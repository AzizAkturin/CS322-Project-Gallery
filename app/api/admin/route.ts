import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const passphrase = searchParams.get('passphrase') ?? '';
  const correct = process.env.ADMIN_PASSPHRASE;
  if (!correct || passphrase !== correct) {
    return NextResponse.json({ error: 'Invalid passphrase' }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
