import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not configured.' },
      { status: 503 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const classPass = process.env.CLASS_PASSPHRASE;
        const adminPass = process.env.ADMIN_PASSPHRASE;
        const authorized =
          (classPass && clientPayload === classPass) ||
          (adminPass && clientPayload === adminPass);
        if (!authorized) {
          throw new Error('Unauthorized: valid passphrase required to upload files.');
        }
        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'video/mp4', 'video/quicktime', 'video/webm', 'video/mov',
          ],
          maximumSizeInBytes: 500 * 1024 * 1024,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
