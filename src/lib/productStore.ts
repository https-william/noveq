import fs from 'fs';
import path from 'path';
import { Product, ProductSize } from '@/types/commerce';
import { DROP_001_PRODUCTS } from '@/data/products';

/**
 * NOVEQ Authoritative Product Repository
 * 
 * Provides server-side persistent product management (add, edit, hide, update stock & price)
 * with disk persistence `data/products.json` and in-memory caching.
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

declare global {
  // eslint-disable-next-line no-var
  var __noveq_products: Map<string, Product> | undefined;
}

function loadInitialProducts(): Map<string, Product> {
  const map = new Map<string, Product>();

  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const list: Product[] = JSON.parse(data);
      for (const item of list) {
        map.set(item.slug, item);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load products from disk:', err);
  }

  // Seed with DROP_001_PRODUCTS if empty
  if (map.size === 0) {
    for (const prod of DROP_001_PRODUCTS) {
      map.set(prod.slug, {
        ...prod,
        hidden: prod.publish_status === 'draft' || false,
      });
    }
    persistProductsToFile(map);
  }

  return map;
}

const productsStore: Map<string, Product> =
  global.__noveq_products ?? loadInitialProducts();

if (process.env.NODE_ENV !== 'production') {
  global.__noveq_products = productsStore;
}

function persistProductsToFile(store: Map<string, Product> = productsStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(store.values());
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist products to disk:', err);
  }
}

/**
 * Returns all products for storefront (excludes hidden/draft items by default)
 */
export function getStorefrontProducts(includeHidden = false): Product[] {
  const all = Array.from(productsStore.values());
  if (includeHidden) return all;
  return all.filter((p) => !p.hidden && p.publish_status !== 'draft');
}

/**
 * Returns all products for admin console (includes hidden and drafts)
 */
export function getAllAdminProducts(): Product[] {
  return Array.from(productsStore.values());
}

/**
 * Find single product by slug
 */
export function getProductBySlug(slug: string): Product | undefined {
  if (productsStore.has(slug)) {
    return productsStore.get(slug);
  }
  // Slugs aliases
  if (slug === 'the-braid-slide-pam') {
    return productsStore.get('the-weave-slide-pam');
  }
  return undefined;
}

/**
 * Save new product or update existing
 */
export function saveProduct(product: Product): Product {
  productsStore.set(product.slug, product);
  persistProductsToFile();
  return product;
}

/**
 * Update partial details of a product
 */
export function updateProduct(
  slug: string,
  updates: Partial<Product>
): Product | undefined {
  const existing = productsStore.get(slug);
  if (!existing) return undefined;

  const updated: Product = {
    ...existing,
    ...updates,
    slug: updates.slug || existing.slug, // Maintain key integrity
  };

  if (updates.slug && updates.slug !== slug) {
    productsStore.delete(slug);
  }

  productsStore.set(updated.slug, updated);
  persistProductsToFile();
  return updated;
}

/**
 * Toggle hide/show status
 */
export function toggleProductVisibility(
  slug: string,
  hidden?: boolean
): Product | undefined {
  const prod = productsStore.get(slug);
  if (!prod) return undefined;

  prod.hidden = hidden !== undefined ? hidden : !prod.hidden;
  prod.publish_status = prod.hidden ? 'draft' : 'published';

  productsStore.set(slug, prod);
  persistProductsToFile();
  return prod;
}

/**
 * Update price, stock count, and optional sizes breakdown
 */
export function updatePriceAndStock(
  slug: string,
  price: number,
  stock: number,
  sizes?: ProductSize[]
): Product | undefined {
  const prod = productsStore.get(slug);
  if (!prod) return undefined;

  prod.price = price;
  prod.stock = stock;
  if (sizes && sizes.length > 0) {
    prod.sizes = sizes;
  }

  productsStore.set(slug, prod);
  persistProductsToFile();
  return prod;
}

/**
 * Delete product from repository
 */
export function deleteProduct(slug: string): boolean {
  if (!productsStore.has(slug)) return false;
  const removed = productsStore.delete(slug);
  if (removed) persistProductsToFile();
  return removed;
}
