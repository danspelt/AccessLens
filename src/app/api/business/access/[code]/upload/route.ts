import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { findPlaceByAccessCode } from '@/lib/db/placesByAccessCode';
import { requireBusinessAccessForPlace } from '@/lib/business/session';
import { normalizeAccessCode } from '@/lib/access/codeFormat';
import { classifyUpload, contentMatchesType } from '@/lib/uploads/validation';

interface RouteContext {
  params: Promise<{ code: string }>;
}

/** Business portal upload — no account login; uses access-code session cookie. */
export async function POST(request: NextRequest, context: RouteContext) {
  const { code: rawCode } = await context.params;
  const code = normalizeAccessCode(rawCode);
  const place = await findPlaceByAccessCode(code);

  if (!place) {
    return NextResponse.json({ error: 'Invalid or expired access code' }, { status: 404 });
  }

  const session = await requireBusinessAccessForPlace(place._id.toString());
  if (!session || session.accessCode !== code) {
    return NextResponse.json({ error: 'Please verify your access code first' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }
    if (files.length > 6) {
      return NextResponse.json({ error: 'Maximum 6 files per upload' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const classification = classifyUpload(file.type);
      if (!classification || classification.kind !== 'image') {
        return NextResponse.json({ error: `File type not allowed: ${file.name}` }, { status: 400 });
      }
      if (file.size > classification.maxSize) {
        return NextResponse.json({ error: `${file.name} exceeds 10MB` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (!contentMatchesType(buffer, file.type)) {
        return NextResponse.json({ error: `${file.name} content does not match its declared file type` }, { status: 400 });
      }
      const filename = `${randomUUID()}.${classification.extension}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'places');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, filename), buffer);
      uploadedUrls.push(`/uploads/places/${filename}`);
    }

    return NextResponse.json({ urls: uploadedUrls, kinds: uploadedUrls.map(() => 'image') }, { status: 201 });
  } catch (error) {
    console.error('business upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
