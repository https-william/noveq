import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and generate unique WebP filename
    const timestamp = Date.now();
    const originalName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'product';
    const cleanBaseName = originalName.replace(/\.[^/.]+$/, '');
    const filename = `${cleanBaseName}-${timestamp}.webp`;
    const storagePath = `catalog/${filename}`;

    let publicUrl = '';

    // Attempt Supabase Storage Upload
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { error: uploadError } = await supabaseAdmin.storage
          .from('products')
          .upload(storagePath, buffer, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabaseAdmin.storage
            .from('products')
            .getPublicUrl(storagePath);
          if (data?.publicUrl) {
            publicUrl = data.publicUrl;
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn('Supabase Storage upload warning:', uploadError.message);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Supabase storage exception:', err);
      }
    }

    // Fallback: local disk storage in public/uploads/
    if (!publicUrl) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, filename);
      fs.writeFileSync(localFilePath, buffer);
      publicUrl = `/uploads/${filename}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: buffer.length,
      format: 'image/webp',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process image upload';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
