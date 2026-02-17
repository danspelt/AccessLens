import { NextRequest, NextResponse } from 'next/server';
import { getGridFSBucket } from '@/lib/db/mongoose';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid photo ID' },
        { status: 400 }
      );
    }

    const bucket = await getGridFSBucket();
    const fileId = new ObjectId(id);

    // Find the file in GridFS
    const files = await bucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    const file = files[0];

    const contentType =
      (file as unknown as { contentType?: string }).contentType ??
      (file.metadata as unknown as { contentType?: string; mimeType?: string } | undefined)?.contentType ??
      (file.metadata as unknown as { contentType?: string; mimeType?: string } | undefined)?.mimeType ??
      'image/jpeg';

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', file.length.toString());
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    // Create a readable stream from GridFS and pipe to response
    const downloadStream = bucket.openDownloadStream(fileId);
    
    // Use ReadableStream for better Next.js compatibility
    const stream = new ReadableStream({
      start(controller) {
        downloadStream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        downloadStream.on('end', () => {
          controller.close();
        });
        downloadStream.on('error', (error) => {
          console.error('Error streaming photo:', error);
          controller.error(error);
        });
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

