import fs from 'fs';
import path from 'path';
import { Product, ProductSize } from '@/types/commerce';
import { DROP_001_PRODUCTS } from '@/data/products';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * NOVEQ Authoritative Product Repository
 *
 * Cloud-Persistent Multi-Tier Architecture:
 * 1. Supabase Storage: Bucket 'products' at 'catalog/products.json' (Permanent, multi-region CDN)
 * 2. In-Memory Cache: Zero latency reads across serverless lambdas
 * 3. Local Filesystem: 'data/products.json' for local offline development
 * 4. Static Fallback: DROP_001_PRODUCTS from codebase
 *
 * Solves serverless container resets: price updates and new products permanently persist
 * in Supabase Storage and will never reset on redeployment or cold starts.
 */

const STORAGE_BUCKET = 'products';
const STORAGE_PATH = 'catalog/products.json';
const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

declare global {
  // eslint-disable-next-line no-var
  var __noveq_products: Map<string, Product> | undefined;
  // eslint-disable-next-line no-var
  var __noveq_last_synced: number | undefined;
}

// Memory cache
const productsStore: Map<string, Product> = global.__noveq_products ?? new Map<string, Product>();

if (process.env.NODE_ENV !== 'production') {
  global.__noveq_products = productsStore;
}

/**
 * Read local disk products if file exists
 */
function readLocalDiskProducts(): Product[] | null {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const list: Product[] = JSON.parse(data);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch {
    // Local filesystem read failed (e.g. read-only environment)
  }
  return null;
}

/**
 * Write to local disk if environment allows
 */
function writeLocalDiskProducts(list: Product[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // Ignore read-only filesystem errors in production
  }
}

/**
 * Seed memory store with baseline catalog
 */
function seedInitialMemory() {
  if (productsStore.size === 0) {
    const diskList = readLocalDiskProducts();
    const source = diskList && diskList.length > 0 ? diskList : DROP_001_PRODUCTS;
    for (const item of source) {
      productsStore.set(item.slug, {
        ...item,
        hidden: item.publish_status === 'draft' || Boolean(item.hidden),
      });
    }
  }
}

// Initial bootstrap
seedInitialMemory();

/**
 * Fetch catalog from Supabase Storage
 */
async function fetchCatalogFromSupabase(): Promise<Product[] | null> {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!hasSupabase) return null;

  // 1. Direct download using Supabase Admin client
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(STORAGE_PATH);

    if (!error && data) {
      const text = await data.text();
      const parsed: Product[] = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ProductStore] Supabase download error:', err);
  }

  // 2. Fallback via public CDN URL with cache buster
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${STORAGE_PATH}?t=${Date.now()}`;
      const res = await fetch(publicUrl, { cache: 'no-store' });
      if (res.ok) {
        const parsed: Product[] = await res.json();
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore CDN fallback error
  }

  return null;
}

/**
 * Upload entire catalog to Supabase Storage
 */
async function syncCatalogToSupabase(list: Product[]): Promise<boolean> {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabase) return false;

  try {
    const buffer = Buffer.from(JSON.stringify(list, null, 2), 'utf-8');
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_PATH, buffer, {
        contentType: 'application/json',
        cacheControl: 'no-cache, no-store, max-age=0',
        upsert: true,
      });

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[ProductStore] Failed to sync to Supabase storage:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[ProductStore] Supabase sync exception:', err);
    return false;
  }
}

/**
 * Ensure memory store is populated and fresh from Supabase
 */
export async function ensureProductsLoaded(force = false): Promise<void> {
  const now = Date.now();
  const lastSync = global.__noveq_last_synced || 0;
  const isStale = now - lastSync > 30000; // 30s cache TTL

  if (!force && !isStale && productsStore.size > 0) {
    return;
  }

  const cloudList = await fetchCatalogFromSupabase();
  if (cloudList && cloudList.length > 0) {
    productsStore.clear();
    for (const item of cloudList) {
      productsStore.set(item.slug, item);
    }
    global.__noveq_last_synced = now;
    writeLocalDiskProducts(cloudList);
    return;
  }

  // NOTE: If Supabase download fails (e.g. transient network hiccup), NEVER overwrite
  // cloud storage with stale local disk/git defaults. We preserve the current in-memory store.
  global.__noveq_last_synced = now;
}

// Background sync on module evaluation (non-blocking)
if (typeof window === 'undefined') {
  ensureProductsLoaded().catch(() => {});
}

/**
 * Synchronous getters (reads hot in-memory store)
 */
export function getStorefrontProducts(includeHidden = false): Product[] {
  const all = Array.from(productsStore.values());
  if (includeHidden) return all;
  return all.filter((p) => !p.hidden && p.publish_status !== 'draft');
}

export function getAllAdminProducts(): Product[] {
  return Array.from(productsStore.values());
}

export function getProductBySlug(slug: string): Product | undefined {
  if (productsStore.has(slug)) {
    return productsStore.get(slug);
  }
  if (slug === 'the-braid-slide-pam') {
    return productsStore.get('the-weave-slide-pam');
  }
  return undefined;
}

/**
 * Async getters (guarantee latest cloud state)
 */
export async function getStorefrontProductsAsync(includeHidden = false): Promise<Product[]> {
  await ensureProductsLoaded();
  return getStorefrontProducts(includeHidden);
}

export async function getAllAdminProductsAsync(): Promise<Product[]> {
  await ensureProductsLoaded(true); // Always fresh for admin
  return getAllAdminProducts();
}

export async function getProductBySlugAsync(slug: string): Promise<Product | undefined> {
  await ensureProductsLoaded();
  return getProductBySlug(slug);
}

/**
 * Mutators: Update in-memory Map immediately and persist to Supabase Storage + local disk
 */
export async function saveProduct(product: Product): Promise<Product> {
  productsStore.set(product.slug, product);
  const list = Array.from(productsStore.values());
  writeLocalDiskProducts(list);
  await syncCatalogToSupabase(list);
  return product;
}

export async function updateProduct(
  slug: string,
  updates: Partial<Product>
): Promise<Product | undefined> {
  await ensureProductsLoaded();
  const existing = productsStore.get(slug);
  if (!existing) return undefined;

  const updated: Product = {
    ...existing,
    ...updates,
    slug: updates.slug || existing.slug,
  };

  if (updates.slug && updates.slug !== slug) {
    productsStore.delete(slug);
  }

  productsStore.set(updated.slug, updated);
  const list = Array.from(productsStore.values());
  writeLocalDiskProducts(list);
  await syncCatalogToSupabase(list);
  return updated;
}

export async function updatePriceAndStock(
  slug: string,
  price: number,
  stock: number,
  sizes?: ProductSize[]
): Promise<Product | undefined> {
  await ensureProductsLoaded();
  const prod = productsStore.get(slug);
  if (!prod) return undefined;

  prod.price = price;
  prod.stock = stock;
  if (sizes && sizes.length > 0) {
    prod.sizes = sizes;
  }

  productsStore.set(slug, prod);
  const list = Array.from(productsStore.values());
  writeLocalDiskProducts(list);
  await syncCatalogToSupabase(list);
  return prod;
}

export async function toggleProductVisibility(
  slug: string,
  hidden?: boolean
): Promise<Product | undefined> {
  await ensureProductsLoaded();
  const prod = productsStore.get(slug);
  if (!prod) return undefined;

  prod.hidden = hidden !== undefined ? hidden : !prod.hidden;
  prod.publish_status = prod.hidden ? 'draft' : 'published';

  productsStore.set(slug, prod);
  const list = Array.from(productsStore.values());
  writeLocalDiskProducts(list);
  await syncCatalogToSupabase(list);
  return prod;
}

export async function deleteProduct(slug: string): Promise<boolean> {
  await ensureProductsLoaded();
  if (!productsStore.has(slug)) return false;
  const removed = productsStore.delete(slug);
  if (removed) {
    const list = Array.from(productsStore.values());
    writeLocalDiskProducts(list);
    await syncCatalogToSupabase(list);
  }
  return removed;
}
