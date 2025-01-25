import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Attempt to run on the edge

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Here you’d normally store the file in S3, or a database, etc.
    // For demonstration, we’ll just respond with success.
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
