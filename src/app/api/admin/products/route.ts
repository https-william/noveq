import { NextRequest, NextResponse } from 'next/server';
import {
  getAllAdminProducts,
  getProductBySlug,
  saveProduct,
  updateProduct,
  updatePriceAndStock,
  toggleProductVisibility,
  deleteProduct,
} from '@/lib/productStore';
import { Product, ProductSize } from '@/types/commerce';

export async function GET() {
  try {
    const products = getAllAdminProducts();
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
      stock = 5,
      material = 'Hand-selected Nigerian calfskin',
      care = 'Wipe with soft cotton cloth. Condition with neutral wax balm.',
      description,
      design_note = '',
      sizes,
      hidden = false,
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

    // Default sizes if not provided
    const defaultSizes: ProductSize[] = sizes && sizes.length > 0 ? sizes : [
      { size: 'EU 37', available: true, stockCount: Math.max(1, Math.floor(stock / 5)) },
      { size: 'EU 38', available: true, stockCount: Math.max(1, Math.floor(stock / 5)) },
      { size: 'EU 39', available: true, stockCount: Math.max(1, Math.floor(stock / 5)) },
      { size: 'EU 40', available: true, stockCount: Math.max(1, Math.floor(stock / 5)) },
      { size: 'EU 41', available: true, stockCount: Math.max(1, Math.floor(stock / 5)) },
    ];

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
      description: description || `Contemporary handcrafted leather pam with barefoot ergonomics.`,
      design_note,
      charm_option: { supported: false },
      publish_status: hidden ? 'draft' : 'published',
      hidden: Boolean(hidden),
      fit_notes: 'True to standard European size. The full-grain leather gently relaxes to your foot width.',
      shipping_notes: 'Ships within 24–48 hours nationwide. Tracked courier with delivery fee paid directly to rider on arrival.',
    };

    const saved = saveProduct(newProduct);
    return NextResponse.json({ success: true, product: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, action, updates, price, stock, sizes, hidden } = body;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Product slug is required.' }, { status: 400 });
    }

    if (action === 'toggle-visibility') {
      const updated = toggleProductVisibility(slug, hidden);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product: updated });
    }

    if (action === 'update-price-stock') {
      const updated = updatePriceAndStock(slug, Number(price), Number(stock), sizes);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product: updated });
    }

    // General updates
    const updated = updateProduct(slug, updates || body);
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

    const removed = deleteProduct(slug);
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedSlug: slug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
