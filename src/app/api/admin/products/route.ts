import { NextRequest, NextResponse } from 'next/server';
import {
  getAllAdminProductsAsync,
  getProductBySlug,
  saveProduct,
  updateProduct,
  updatePriceAndStock,
  toggleProductVisibility,
  toggleProductRestocking,
  deleteProduct,
} from '@/lib/productStore';
import { Product, ProductSize } from '@/types/commerce';
import { WORLDWIDE_WOMEN_SIZES } from '@/config/sizing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getAllAdminProductsAsync();
    return NextResponse.json({ success: true, products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch products';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug: customSlug,
      collection = 'Drop 001',
      price,
      compare_at_price,
      colour,
      colourHex = '#141414',
      images = [],
      stock = 11,
      material = 'Soft natural Nigerian leather with cushioned underfoot bedding and smooth rounded edges.',
      care = 'Wipe with a soft dry cloth after wear and nourish lightly with clear leather balm.',
      description,
      design_note = '',
      sizes,
      hidden = false,
      restocking = false,
    } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Product name and price are required.' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const baseSlug = customSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let count = 1;
    while (getProductBySlug(slug)) {
      slug = `${baseSlug}-${count++}`;
    }

    // Default worldwide sizing (EU 34 to EU 44) if not explicitly provided
    const perSizeStock = Math.max(1, Math.floor(Number(stock) / WORLDWIDE_WOMEN_SIZES.length));
    const defaultSizes: ProductSize[] =
      sizes && sizes.length > 0
        ? sizes
        : WORLDWIDE_WOMEN_SIZES.map((spec) => ({
            size: spec.eu,
            available: true,
            stockCount: perSizeStock,
          }));

    const newProduct: Product = {
      name: name.trim(),
      slug,
      collection,
      price: Number(price),
      compare_at_price: compare_at_price ? Number(compare_at_price) : undefined,
      currency: 'NGN',
      colour: colour || 'Black',
      colourHex,
      colours: [
        {
          name: colour || 'Black',
          hex: colourHex,
          imageSrc: images[0]?.src || '',
        },
      ],
      images: images.length > 0 ? images : [
        {
          src: '/images/products/the-ring-burgundy.jpg',
          alt: `NOVEQ ${name}`,
          viewType: 'hero',
        },
      ],
      sizes: defaultSizes,
      stock: Number(stock),
      material,
      care,
      description: description || `Handcrafted in Lagos from soft natural Nigerian leather with cushioned everyday support.`,
      design_note,
      charm_option: { supported: false },
      publish_status: hidden ? 'draft' : 'published',
      hidden: Boolean(hidden),
      restocking: Boolean(restocking),
      fit_notes: 'True to standard European sizing across EU 34 to EU 44. Soft leather gently relaxes to fit your foot width after 2–3 wears.',
      shipping_notes: 'Crafted to order in 5 business days, followed by 2 business days for delivery. Delivered within 7 business days nationwide.',
    };

    const saved = await saveProduct(newProduct);
    return NextResponse.json({ success: true, product: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, action, updates, price, stock, sizes, hidden, restocking } = body;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Product slug is required.' }, { status: 400 });
    }

    if (action === 'toggle-visibility') {
      const updated = await toggleProductVisibility(slug, hidden);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product: updated });
    }

    if (action === 'toggle-restocking') {
      const updated = await toggleProductRestocking(slug, restocking);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product: updated });
    }

    if (action === 'update-price-stock') {
      const updated = await updatePriceAndStock(slug, Number(price), Number(stock), sizes);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product: updated });
    }

    // General updates
    const updated = await updateProduct(slug, updates || body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Product slug is required.' }, { status: 400 });
    }

    const removed = await deleteProduct(slug);
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedSlug: slug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
