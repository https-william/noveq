import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Image Upload Route for Product Management
 *
 * Robust 3-tier architecture:
 * 1. Server-side Sharp image optimization (auto-rotate, max 1200px, 85% WebP)
 * 2. Supabase Storage bucket 'products'
 * 3. Fallback to local filesystem (public/uploads/) or WebP Data URI
 *
 * Guarantees zero failures whether Supabase keys are configured, unconfigured,
 * or running in local vs serverless environments.
 */

export async function POST(req: NextRequest) {
  try {
    let fileBuffer: Buffer | null = null;
    let fileName = 'product-image';
    let inputMimeType = 'image/webp';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No image file provided in form data.' },
          { status: 400 }
        );
      }

      fileName = file.name || 'product-image';
      inputMimeType = file.type || 'image/jpeg';
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const json = await req.json();
      const { dataUrl, filename: customName } = json;

      if (!dataUrl) {
        return NextResponse.json(
          { success: false, error: 'No dataUrl provided in JSON payload.' },
          { status: 400 }
        );
      }

      if (customName) fileName = customName;

      // Extract base64 part
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches[2]) {
        inputMimeType = matches[1];
        fileBuffer = Buffer.from(matches[2], 'base64');
      } else {
        fileBuffer = Buffer.from(dataUrl, 'base64');
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' },
        { status: 400 }
      );
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image buffer is empty.' },
        { status: 400 }
      );
    }

    // 1. Server-side Sharp Image Optimization
    let processedBuffer: Buffer = fileBuffer;
    let outputMime = 'image/webp';
    let outputExt = 'webp';

    try {
      processedBuffer = await sharp(fileBuffer)
        .rotate() // Auto-orient based on EXIF
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
      outputMime = 'image/webp';
      outputExt = 'webp';
    } catch (sharpError) {
      // eslint-disable-next-line no-console
      console.warn('Sharp conversion fallback to raw buffer:', sharpError);
      processedBuffer = fileBuffer;
      outputMime = inputMimeType || 'image/jpeg';
      outputExt = fileName.split('.').pop() || 'jpg';
    }

    // Generate unique sanitized filename
    const timestamp = Date.now();
    const cleanBase = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.[^/.]+$/, '');
    const finalFilename = `${cleanBase}-${timestamp}.${outputExt}`;
    const storagePath = `catalog/${finalFilename}`;

    let publicUrl = '';
    let storageType = 'supabase';

    // 2. Primary: Supabase Storage Upload
    const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const hasSupabaseServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (hasSupabaseUrl && hasSupabaseServiceKey) {
      try {
        const { error: uploadError } = await supabaseAdmin.storage
          .from('products')
          .upload(storagePath, processedBuffer, {
            contentType: outputMime,
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabaseAdmin.storage
            .from('products')
            .getPublicUrl(storagePath);
          if (data?.publicUrl) {
            publicUrl = data.publicUrl;
            storageType = 'supabase';
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn('Supabase storage upload error:', uploadError.message);
        }
      } catch (sbErr) {
        // eslint-disable-next-line no-console
        console.warn('Supabase storage exception:', sbErr);
      }
    } else {
      // eslint-disable-next-line no-console
      console.info('Supabase storage credentials not fully populated. Falling back to local/inline.');
    }

    // 3. Fallback Tier 1: Local Filesystem Storage (public/uploads/)
    if (!publicUrl) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const localFilePath = path.join(uploadDir, finalFilename);
        fs.writeFileSync(localFilePath, processedBuffer);
        publicUrl = `/uploads/${finalFilename}`;
        storageType = 'local';
      } catch (fsErr) {
        // eslint-disable-next-line no-console
        console.warn('Local filesystem write failed (read-only environment):', fsErr);
      }
    }

    // 4. Fallback Tier 2: In-Memory WebP Data URI
    if (!publicUrl) {
      publicUrl = `data:${outputMime};base64,${processedBuffer.toString('base64')}`;
      storageType = 'inline';
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
      storageType,
      size: processedBuffer.length,
      format: outputMime,
    });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error('Fatal upload route error:', err);
    const message = err instanceof Error ? err.message : 'Failed to process image upload';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
