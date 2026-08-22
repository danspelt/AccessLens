import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { logActivity } from '@/lib/db/activity';
import { scheduleBadgeEvaluation } from '@/lib/badges/awardBadges';
import { ALLOWED_UPLOAD_CONTEXTS, classifyUpload, contentMatchesType } from '@/lib/uploads/validation';

const PUBLIC_UPLOAD_CONTEXTS = new Set(['places', 'submissions']);

export async function POST(request: NextRequest) {
  const session = await auth();

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const context = (formData.get('context') as string) || 'general';

    if (!ALLOWED_UPLOAD_CONTEXTS.has(context)) {
      return NextResponse.json({ error: 'Invalid upload context' }, { status: 400 });
    }

    if (!session?.user?.id && !PUBLIC_UPLOAD_CONTEXTS.has(context)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!session?.user?.id && PUBLIC_UPLOAD_CONTEXTS.has(context)) {
      const hasVideo = files.some((file) => classifyUpload(file.type)?.kind === 'video');
      if (hasVideo) {
        return NextResponse.json(
          { error: 'Sign in to upload videos, or upload photos only.' },
          { status: 401 }
        );
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 files per upload' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const kinds: ('image' | 'video')[] = [];

    for (const file of files) {
      const classified = classifyUpload(file.type);
      if (!classified) {
        return NextResponse.json(
          {
            error:
              `File type ${file.type || 'unknown'} not allowed. Accepted: JPEG, PNG, WebP, MP4, WebM, MOV, Ogg video`,
          },
          { status: 400 }
        );
      }

      if (file.size > classified.maxSize) {
        const mb = classified.kind === 'image' ? 10 : 50;
        return NextResponse.json(
          { error: `${file.name} exceeds maximum size of ${mb}MB for ${classified.kind}s` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (!contentMatchesType(buffer, file.type)) {
        return NextResponse.json({ error: `${file.name} content does not match its declared file type` }, { status: 400 });
      }

      const filename = `${randomUUID()}.${classified.extension}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', context);

      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, filename), buffer);

      uploadedUrls.push(`/uploads/${context}/${filename}`);
      kinds.push(classified.kind);
    }

    const photoCount = kinds.filter((k) => k === 'image').length;
    const videoCount = kinds.filter((k) => k === 'video').length;
    let message = `Uploaded ${uploadedUrls.length} file${uploadedUrls.length === 1 ? '' : 's'}`;
    if (photoCount && videoCount) {
      message = `Uploaded ${photoCount} photo${photoCount === 1 ? '' : 's'} and ${videoCount} video${videoCount === 1 ? '' : 's'}`;
    } else if (videoCount) {
      message = `Uploaded ${videoCount} video${videoCount === 1 ? '' : 's'}`;
    } else {
      message = `Uploaded ${photoCount} photo${photoCount === 1 ? '' : 's'}`;
    }

    if (session?.user?.id) {
      await logActivity({
        userId: session.user.id,
        type: 'photo_uploaded',
        entityType: 'photo',
        entityId: session.user.id,
        message,
        metadata: { context, count: uploadedUrls.length, urls: uploadedUrls, kinds },
      });
      if (photoCount > 0) {
        scheduleBadgeEvaluation(session.user.id);
      }
    }

    return NextResponse.json({ urls: uploadedUrls, kinds }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
