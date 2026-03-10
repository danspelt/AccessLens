import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: 'You must be logged in to upload photos.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP, and GIF images are supported.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Photos must be 8MB or smaller.' }, { status: 400 });
    }

    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const relativeDirectory = path.join('uploads', 'evidence');
    const absoluteDirectory = path.join(process.cwd(), 'public', relativeDirectory);
    const absolutePath = path.join(absoluteDirectory, fileName);

    await mkdir(absoluteDirectory, { recursive: true });
    await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      url: `/${relativeDirectory.replace(/\\/g, '/')}/${fileName}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Unable to upload photo.' }, { status: 500 });
  }
}
