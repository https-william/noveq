import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Image Upload Route for Product Management
 *
 * Receives the client-side pre-resized (max 800px square) WebP file,
 * uploads to Supabase Storage bucket 'products', and returns the public CDN URL.
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided.' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Storage not configured. Set Supabase env vars.' },
        { status: 500 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and generate unique WebP filename
    const timestamp = Date.now();
    const originalName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'product';
    const cleanBaseName = originalName.replace(/\.[^/.]+$/, '');
    const filename = `${cleanBaseName}-${timestamp}.webp`;
    const storagePath = `catalog/${filename}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('products')
      .upload(storagePath, buffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data } = supabaseAdmin.storage.from('products').getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      filename,
      size: buffer.length,
      format: 'image/webp',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process image upload';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
