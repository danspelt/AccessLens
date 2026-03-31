import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { logActivity } from '@/lib/db/activity';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
  'video/ogg',
]);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-m4v': 'm4v',
  'video/ogg': 'ogv',
};

function classifyFile(file: File): { kind: 'image' | 'video'; maxSize: number } | null {
  if (IMAGE_TYPES.has(file.type)) {
    return { kind: 'image', maxSize: MAX_IMAGE_SIZE };
  }
  if (VIDEO_TYPES.has(file.type)) {
    return { kind: 'video', maxSize: MAX_VIDEO_SIZE };
  }
  return null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const context = (formData.get('context') as string) || 'general';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 files per upload' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const kinds: ('image' | 'video')[] = [];

    for (const file of files) {
      const classified = classifyFile(file);
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

      const ext = MIME_TO_EXT[file.type] || (classified.kind === 'video' ? 'mp4' : 'jpg');
      const filename = `${randomUUID()}.${ext}`;
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

    await logActivity({
      userId: session.user.id,
      type: 'photo_uploaded',
      entityType: 'photo',
      entityId: session.user.id,
      message,
      metadata: { context, count: uploadedUrls.length, urls: uploadedUrls, kinds },
    });

    return NextResponse.json({ urls: uploadedUrls, kinds }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
