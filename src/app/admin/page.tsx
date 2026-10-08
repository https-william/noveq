'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  Lock,
  Copy,
  Check,
  Eye,
  X,
  LogOut,
  TrendingUp,
  Users,
  Mail,
  Download,
  PlusCircle,
  AlertTriangle,
  FileText,
  MessageCircle,
  Truck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  EyeOff,
  Package,
  UploadCloud,
  DollarSign,
  Layers,
  Sparkles,
  Trash2,
  Link2,
  Star,
} from 'lucide-react';
import { Order, Product, ProductSize } from '@/types/commerce';
import { Subscriber } from '@/lib/subscribers';
import { supabase } from '@/lib/supabase';
import { resizeImageToWebP } from '@/lib/imageResize';

const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1ZLbOPcCztTgtxmKmWLW_BB_utKxS7-DpePflxXerA1I/edit?gid=79417387#gid=79417387';

// Brand Voice WhatsApp Message Generator (/clarity + /wolf)
function getWhatsAppMessageForStatus(order: Order, status: Order['status']): string {
  const customerName = order.customer.fullName.trim();
  const orderId = order.id;
  const city = order.customer.city || 'your delivery address';
  const itemsSummary = order.items
    .map((i) => `${i.product.name} (${i.selectedColour || i.product.colour}, Size ${i.selectedSize})`)
    .join(', ');

  switch (status) {
    case 'paid':
      return `Hello ${customerName}, thank you for choosing NOVEQ. We've received your order *${orderId}* for ${itemsSummary}. Your pair is now scheduled with our workshop artisans for preparation.`;

    case 'sourcing':
    case 'processing':
      return `Hello ${customerName}, a quick update on your NOVEQ order *${orderId}*: your pair (${itemsSummary}) is currently being hand-assembled and conditioned in our workshop. We will notify you the moment it is ready for dispatch.`;

    case 'out for delivery':
    case 'shipped':
      return `Hello ${customerName}, your NOVEQ order *${orderId}* (${itemsSummary}) is out for delivery today with our dispatch courier to ${city}. Please ensure your phone is accessible. Friendly reminder: the delivery fee is settled directly with the rider upon arrival.`;

    case 'delivered':
      return `Hello ${customerName}, our courier has confirmed delivery of your NOVEQ order (${itemsSummary}). We hope the fit and leather feel exceptional. If you need any care advice or have questions, our team is right here with you.`;

    case 'cancelled':
      return `Hello ${customerName}, your order *${orderId}* with NOVEQ has been cancelled as requested. If you have any questions or wish to explore another style in the future, we are always here to assist you.`;

    default:
      return `Hello ${customerName}, thank you for choosing NOVEQ. We are following up on your order *${orderId}* (${itemsSummary}). Let us know if you need anything at all.`;
  }
}

function getWhatsAppUrlForOrder(order: Order, statusOverride?: Order['status']): string {
  const status = statusOverride || order.status;
  const message = getWhatsAppMessageForStatus(order, status);
  let cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '234' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('234') && cleanPhone.length === 10) {
    cleanPhone = '234' + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

interface OfflineOrderForm {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  deliveryNotes: string;
  productName: string;
  colour: string;
  size: string;
  quantity: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'success' | 'pending';
}

const INITIAL_OFFLINE_FORM: OfflineOrderForm = {
  customerName: '',
  phone: '',
  email: '',
  address: '',
  city: 'Lagos',
  state: 'Lagos',
  deliveryNotes: '',
  productName: 'The Ring Slide Pam',
  colour: 'Warm Cognac',
  size: 'EU 40',
  quantity: 1,
  total: 25000,
  paymentMethod: 'Direct Bank Transfer',
  paymentStatus: 'success',
};

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Active View Tab: 'orders' | 'products' | 'dashboard' | 'customers' | 'subscribers'
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'dashboard' | 'customers' | 'subscribers'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrdersCount: 0,
    pendingFulfillmentsCount: 0,
    currency: 'NGN',
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [statusSaveFeedback, setStatusSaveFeedback] = useState<Record<string, string>>({});

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Offline Order Modal State
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offlineForm, setOfflineForm] = useState<OfflineOrderForm>(INITIAL_OFFLINE_FORM);
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false);
  const [offlineConfirmStep, setOfflineConfirmStep] = useState(false);

  // Helper to dynamically resolve product prices for offline ordering
  const getProductPrice = (name: string): number => {
    const matched = products.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (matched && typeof matched.price === 'number' && matched.price > 0) {
      return matched.price;
    }
    if (name.toLowerCase().includes('weave')) return 20000;
    return 25000;
  };

  // Subscribers State
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersSearch, setSubscribersSearch] = useState('');
  const [copiedAllEmails, setCopiedAllEmails] = useState(false);

  // Deletion Confirmation States
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Check persistent session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('noveq_admin_auth');
    const localAuth = localStorage.getItem('noveq_admin_auth');
    if (sessionAuth === 'true' || localAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsAuthChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passwordInput.trim();

    if (
      clean === 'noveqthebrand!' ||
      clean === 'noveqthebrand' ||
      clean === 'oskpolor'
    ) {
      sessionStorage.setItem('noveq_admin_auth', 'true');
      localStorage.setItem('noveq_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('noveq_admin_auth');
    localStorage.removeItem('noveq_admin_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, subsRes, prodsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/newsletter'),
        fetch('/api/admin/products'),
      ]);

      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders || []);
        setMetrics(
          ordersData.metrics || {
            totalRevenue: 0,
            totalOrdersCount: 0,
            pendingFulfillmentsCount: 0,
            currency: 'NGN',
          }
        );
      }

      const subsData = await subsRes.json();
      if (subsData.subscribers) {
        setSubscribers(subsData.subscribers);
      }

      const prodsData = await prodsRes.json();
      if (prodsData.success && prodsData.products) {
        setProducts(prodsData.products);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();

      // Listen to Realtime database updates if Supabase credentials exist
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const channel = supabase
          .channel('admin-live-updates')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => fetchAdminData()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'subscribers' },
            () => fetchAdminData()
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [isAuthenticated, fetchAdminData]);

  // Instant Status Change Handler (Doherty Threshold < 400ms)
  const handleInstantStatusChange = async (orderId: string, newStatus: Order['status']) => {
    // 1. Optimistic instant UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrderModal && selectedOrderModal.id === orderId) {
      setSelectedOrderModal((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    setSavingStatusId(orderId);
    setStatusSaveFeedback((prev) => ({ ...prev, [orderId]: 'Saved ✓' }));

    // 2. Background PATCH request
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Instant status save error:', err);
      setStatusSaveFeedback((prev) => ({ ...prev, [orderId]: 'Error saving' }));
    } finally {
      setSavingStatusId(null);
      setTimeout(() => {
        setStatusSaveFeedback((prev) => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
      }, 2500);
    }
  };

  // Delete Order with Confirmation
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders?orderId=${encodeURIComponent(orderToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
        setMetrics((prev) => ({
          ...prev,
          totalOrdersCount: Math.max(0, prev.totalOrdersCount - 1),
          totalRevenue: Math.max(
            0,
            prev.totalRevenue - (orderToDelete.payment.status === 'success' ? orderToDelete.total : 0)
          ),
          pendingFulfillmentsCount: Math.max(
            0,
            prev.pendingFulfillmentsCount -
              (orderToDelete.status === 'paid' ||
              orderToDelete.status === 'sourcing' ||
              orderToDelete.status === 'out for delivery' ||
              orderToDelete.status === 'processing' ||
              orderToDelete.status === 'shipped'
                ? 1
                : 0)
          ),
        }));
        if (selectedOrderModal && selectedOrderModal.id === orderToDelete.id) {
          setSelectedOrderModal(null);
        }
        setOrderToDelete(null);
      } else {
        alert(data.error || 'Failed to delete order.');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete order error:', err);
      alert('Network error while deleting order.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete Subscriber with Confirmation
  const handleDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/newsletter?email=${encodeURIComponent(subscriberToDelete.email)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers((prev) =>
          prev.filter((s) => s.email.toLowerCase() !== subscriberToDelete.email.toLowerCase())
        );
        setSubscriberToDelete(null);
      } else {
        alert(data.error || 'Failed to delete subscriber.');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete subscriber error:', err);
      alert('Network error while deleting subscriber.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete Product with Confirmation
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products?slug=${encodeURIComponent(productToDelete.slug)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.slug !== productToDelete.slug));
        setProductToDelete(null);
      } else {
        alert(data.error || 'Failed to delete product.');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete product error:', err);
      alert('Network error while deleting product.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Product Visibility
  const handleToggleProductVisibility = async (slug: string, currentHidden?: boolean) => {
    const nextHidden = !currentHidden;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) =>
        p.slug === slug
          ? {
              ...p,
              hidden: nextHidden,
              publish_status: nextHidden ? 'draft' : 'published',
            }
          : p
      )
    );

    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'toggle-visibility',
          hidden: nextHidden,
        }),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle visibility:', err);
      fetchProducts();
    }
  };

  // Handle Image Upload (Sharp Server Optimization + Supabase Storage)
  const handleImageFileSelect = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    setIsUploadingImage(true);
    setUploadFeedback('Optimizing image photo...');

    let fileToUpload: File = file;
    try {
      // 1. Client-side attempt with automatic fallback if canvas unsupported/HEIC
      try {
        fileToUpload = await resizeImageToWebP(file, {
          maxDimension: 1200,
          quality: 0.85,
        });
      } catch {
        fileToUpload = file;
      }

      const kbSize = Math.round(fileToUpload.size / 1024);
      setUploadFeedback(`Uploading ${kbSize} KB image to catalog...`);

      // 2. Upload via API route
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errMsg = `Upload failed with status ${res.status}`;
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch {
          // Non-JSON response
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.success && data.url) {
        onSuccess(data.url);
        const tag = data.storageType ? ` [${data.storageType}]` : '';
        setUploadFeedback(`Image saved successfully!${tag}`);
        setTimeout(() => setUploadFeedback(null), 3500);
      } else {
        throw new Error(data.error || 'Server rejected image upload.');
      }
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Image upload failed:', err);
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadFeedback(`Upload error: ${msg}`);

      // Safe fallback: Only attach data URI if compressed file is small enough (< 400KB)
      if (fileToUpload && fileToUpload.size < 400 * 1024) {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              onSuccess(reader.result);
              setUploadFeedback('Attached compressed preview image.');
              setTimeout(() => setUploadFeedback(null), 3500);
            }
          };
          reader.readAsDataURL(fileToUpload);
          return;
        } catch {
          // ignore reader error
        }
      }

      alert(`Could not upload image: ${msg}. You can also use the "Paste URL" option below to add an image URL directly.`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Quick Stock & Price Save
  const handleSaveQuickStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStockProduct) return;

    setIsSavingProduct(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: quickStockProduct.slug,
          action: 'update-price-stock',
          price: quickStockProduct.price,
          stock: quickStockProduct.stock,
          sizes: quickStockProduct.sizes,
        }),
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.slug === quickStockProduct.slug ? data.product : p))
        );
        setQuickStockProduct(null);
      } else {
        alert(data.error || 'Failed to update stock');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Stock update error:', err);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Full Product Save (Add / Edit)
  const handleSaveFullProduct = async (productData: Partial<Product>, isNew = false) => {
    setIsSavingProduct(true);
    try {
      const url = '/api/admin/products';
      const method = isNew ? 'POST' : 'PATCH';
      const body = isNew
        ? productData
        : { slug: productData.slug, updates: productData };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success && data.product) {
        if (isNew) {
          setProducts((prev) => [data.product, ...prev]);
          setIsAddProductOpen(false);
        } else {
          setProducts((prev) =>
            prev.map((p) => (p.slug === data.product.slug ? data.product : p))
          );
          setEditingProduct(null);
        }
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Product save error:', err);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Submit Offline Order
  const handleCreateOfflineOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineConfirmStep) {
      setOfflineConfirmStep(true);
      return;
    }

    setIsSubmittingOffline(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offlineForm),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => [data.order, ...prev]);
        setMetrics((prev) => ({
          ...prev,
          totalOrdersCount: prev.totalOrdersCount + 1,
          totalRevenue: prev.totalRevenue + data.order.total,
          pendingFulfillmentsCount: prev.pendingFulfillmentsCount + 1,
        }));
        setIsOfflineModalOpen(false);
        setOfflineConfirmStep(false);
        setOfflineForm(INITIAL_OFFLINE_FORM);
      } else {
        alert(data.error || 'Failed to record offline sale.');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Offline order error:', err);
      alert('Network interruption while saving order.');
    } finally {
      setIsSubmittingOffline(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllSubscribers = () => {
    const emails = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedAllEmails(true);
    setTimeout(() => setCopiedAllEmails(false), 2500);
  };

  const exportSubscribersCSV = () => {
    const headers = 'Email,Name,Source,SubscribedAt,Tags\n';
    const rows = subscribers
      .map(
        (s) =>
          `"${s.email}","${s.name || ''}","${s.source}","${s.subscribedAt}","${(s.tags || []).join(';')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `noveq-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Orders (newest first, status filter: paid, sourcing, out for delivery, delivered, cancelled and orders)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      let matchesStatus = true;
      if (filterStatus === 'all') {
        matchesStatus = true;
      } else if (filterStatus === 'paid') {
        matchesStatus = order.status === 'paid';
      } else if (filterStatus === 'sourcing') {
        matchesStatus = order.status === 'sourcing' || order.status === 'processing';
      } else if (filterStatus === 'out for delivery') {
        matchesStatus = order.status === 'out for delivery' || order.status === 'shipped';
      } else if (filterStatus === 'delivered') {
        matchesStatus = order.status === 'delivered';
      } else if (filterStatus === 'cancelled') {
        matchesStatus = order.status === 'cancelled';
      } else {
        matchesStatus = order.status === filterStatus;
      }

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.customer.fullName.toLowerCase().includes(q) ||
        order.customer.email.toLowerCase().includes(q) ||
        order.customer.phone.includes(searchQuery) ||
        order.customer.city.toLowerCase().includes(q) ||
        order.items.some((i) => i.product.name.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  // Orders counts by status
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      paid: orders.filter((o) => o.status === 'paid').length,
      sourcing: orders.filter((o) => o.status === 'sourcing' || o.status === 'processing').length,
      outForDelivery: orders.filter((o) => o.status === 'out for delivery' || o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  // Unique Customers CRM View
  const uniqueCustomers = useMemo(() => {
    const map = new Map<
      string,
      {
        fullName: string;
        phone: string;
        email: string;
        city: string;
        state: string;
        orderCount: number;
        totalSpent: number;
        lastOrderDate: string;
      }
    >();

    for (const order of orders) {
      const key = (order.customer.email || order.customer.phone).toLowerCase().trim();
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          fullName: order.customer.fullName,
          phone: order.customer.phone,
          email: order.customer.email,
          city: order.customer.city,
          state: order.customer.state,
          orderCount: 1,
          totalSpent: order.payment.status === 'success' ? order.total : 0,
          lastOrderDate: order.createdAt,
        });
      } else {
        existing.orderCount += 1;
        if (order.payment.status === 'success') {
          existing.totalSpent += order.total;
        }
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filteredSubscribers = useMemo(() => {
    const q = subscribersSearch.toLowerCase();
    return subscribers.filter((sub) => {
      return (
        sub.email.toLowerCase().includes(q) ||
        (sub.name && sub.name.toLowerCase().includes(q)) ||
        sub.source.toLowerCase().includes(q)
      );
    });
  }, [subscribers, subscribersSearch]);

  const totalPairsSold = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
  }, [orders]);

  // Waybill Text Formatter
  const generateWaybillText = (order: Order) => {
    const itemsList = order.items
      .map(
        (i) =>
          `• ${i.product.name} — Color: ${i.selectedColour || i.product.colour}, Size: ${i.selectedSize} (Qty: ${i.quantity})`
      )
      .join('\n');

    return `📦 NOVEQ DISPATCH WAYBILL
Order Reference: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}
Recipient: ${order.customer.fullName}
Phone: ${order.customer.phone}
Destination: ${order.customer.address}, ${order.customer.city}, ${order.customer.state}
Items:
${itemsList}
Notes: ${order.customer.deliveryNotes || 'None'}
Payment: Paid in Full (₦${order.total.toLocaleString()})
Delivery Fee: Customer pays dispatch rider directly on arrival`.trim();
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <RefreshCw className="w-5 h-5 text-espresso animate-spin" />
      </div>
    );
  }

  // Password Protection Gate UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bone text-ink-black flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-warm-white border border-cocoa/20 p-8 sm:p-10 rounded-xs shadow-md space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-espresso/5 border border-espresso/20 rounded-full mb-2">
              <Lock className="w-5 h-5 text-espresso" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-black uppercase font-serif">
              NOVEQ Store Operations
            </h1>
            <p className="text-xs text-muted-taupe">
              Please enter your access password to manage orders and products.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="admin-pass"
                className="block text-[11px] uppercase tracking-wider font-semibold text-cocoa mb-1.5"
              >
                Password
              </label>
              <input
                id="admin-pass"
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-bone border border-cocoa/30 rounded-xs focus-dark font-mono text-ink-black min-h-[44px]"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-oxblood/10 border border-oxblood/30 text-oxblood text-xs rounded-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px] shadow-sm cursor-pointer"
            >
              Sign In to Console
            </button>
          </form>

          <div className="text-[11px] text-muted-taupe border-t border-cocoa/15 pt-4">
            NOVEQ Store Management · Nigeria
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone text-ink-black py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cocoa/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif italic text-cocoa">Executive Management Console</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-800">
              Live Realtime Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black uppercase font-serif mt-1">
            Store Operations & Catalog
          </h1>
          <p className="text-xs text-muted-taupe mt-0.5">
            Organized orders ledger, instant WhatsApp client updates, and live inventory control.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setOfflineForm(INITIAL_OFFLINE_FORM);
              setOfflineConfirmStep(false);
              setIsOfflineModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-espresso hover:bg-ink-black text-warm-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors focus-dark shadow-xs min-h-[44px]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Offline Sale</span>
          </button>

          <button
            type="button"
            onClick={fetchAdminData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-bone transition-colors focus-dark min-h-[44px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <a
            href={GOOGLE_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-bone transition-colors focus-dark min-h-[44px]"
          >
            <span>Sheet</span>
            <ExternalLink className="w-3 h-3 text-cocoa" />
          </a>

          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-bone transition-colors focus-dark min-h-[44px]"
          >
            <span>Store</span>
            <ExternalLink className="w-3 h-3 text-cocoa" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-warm-white border border-oxblood/30 text-oxblood text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-oxblood/10 transition-colors focus-dark min-h-[44px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Plain, Functional KPI Metric Cards (Only what is necessary) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Gross Revenue */}
        <div className="p-4 bg-warm-white border border-cocoa/20 rounded-xs space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-cocoa font-medium uppercase tracking-wider">
            <span>Gross Sales</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            ₦{metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-taupe">Website + verified offline sales</p>
        </div>

        {/* Total Orders */}
        <div className="p-4 bg-warm-white border border-cocoa/20 rounded-xs space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-cocoa font-medium uppercase tracking-wider">
            <span>Orders Received</span>
            <ShoppingBag className="w-3.5 h-3.5 text-espresso" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            {orders.length}
          </div>
          <p className="text-[10px] text-muted-taupe">Client orders recorded</p>
        </div>

        {/* Pending Fulfillment */}
        <div className="p-4 bg-warm-white border border-cocoa/20 rounded-xs space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-cocoa font-medium uppercase tracking-wider">
            <span>Awaiting Delivery</span>
            <Clock className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-amber-900">
            {statusCounts.paid + statusCounts.sourcing + statusCounts.outForDelivery}
          </div>
          <p className="text-[10px] text-muted-taupe">Paid, sourcing, or in transit</p>
        </div>

        {/* Pairs Sold */}
        <div className="p-4 bg-warm-white border border-cocoa/20 rounded-xs space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-cocoa font-medium uppercase tracking-wider">
            <span>Pairs Sold</span>
            <Package className="w-3.5 h-3.5 text-cocoa" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            {totalPairsSold}
          </div>
          <p className="text-[10px] text-muted-taupe">Total footwear units fulfilled</p>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-1 border-b border-cocoa/20 overflow-x-auto pb-px">
        {[
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'products', label: `Products (${products.length})`, icon: Layers },
          { id: 'dashboard', label: 'Metrics & Pipeline', icon: TrendingUp },
          { id: 'customers', label: `Clients (${uniqueCustomers.length})`, icon: Users },
          { id: 'subscribers', label: `Subscribers (${subscribers.length})`, icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-colors whitespace-nowrap min-h-[44px] cursor-pointer ${
                isActive
                  ? 'border-ink-black text-ink-black bg-warm-white/70 shadow-2xs'
                  : 'border-transparent text-muted-taupe hover:text-ink-black hover:bg-warm-white/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS LEDGER (UX Cognitive Ergonomics + Instant Status Save + wa.me) */}
      {activeTab === 'orders' && (
        <div className="bg-warm-white border border-cocoa/20 rounded-xs shadow-xs space-y-4 p-4 sm:p-6">
          {/* Orders Header & Status Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
            <div>
              <h2 className="text-xl font-bold text-ink-black font-serif">Orders & Fulfillment</h2>
              <p className="text-xs text-muted-taupe mt-0.5">
                Newest orders first. Tap any order to view details, update status instantly, or message customer on WhatsApp.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-cocoa" />
              <input
                type="text"
                placeholder="Search order ID, name, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-bone border border-cocoa/30 rounded-xs focus-dark text-ink-black font-medium min-h-[40px]"
              />
            </div>
          </div>

          {/* Status Filter Tabs: (paid, sourcing, out for delivery, delivered, cancelled and orders) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Orders', count: statusCounts.all },
              { id: 'paid', label: 'Paid', count: statusCounts.paid, color: 'text-amber-800' },
              { id: 'sourcing', label: 'Sourcing', count: statusCounts.sourcing, color: 'text-blue-800' },
              { id: 'out for delivery', label: 'Out for Delivery', count: statusCounts.outForDelivery, color: 'text-purple-800' },
              { id: 'delivered', label: 'Delivered', count: statusCounts.delivered, color: 'text-emerald-800' },
              { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled, color: 'text-gray-600' },
            ].map((tab) => {
              const isSelected = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStatus(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xs whitespace-nowrap transition-colors min-h-[40px] cursor-pointer ${
                    isSelected
                      ? 'bg-ink-black text-warm-white shadow-xs'
                      : 'bg-bone text-cocoa hover:text-ink-black hover:bg-warm-white border border-cocoa/20'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-warm-white/20 text-warm-white'
                        : 'bg-cocoa/10 text-ink-black'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Orders List (Newest First) */}
          {loading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading orders">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="p-4 bg-warm-white border border-cocoa/20 rounded-xs animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-28 bg-cocoa/15 rounded-xs" />
                    <div className="h-4 w-14 bg-cocoa/10 rounded-xs" />
                    <div className="h-3 w-20 bg-cocoa/10 rounded-xs" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-28 bg-cocoa/15 rounded-xs" />
                    <div className="h-4 w-16 bg-cocoa/10 rounded-xs" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-20 bg-cocoa/20 rounded-xs" />
                    <div className="h-5 w-24 bg-cocoa/15 rounded-xs" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-14 text-center text-xs text-muted-taupe space-y-3 border border-dashed border-cocoa/25 rounded-xs bg-warm-white/50 p-6">
              <ShoppingBag className="w-8 h-8 text-cocoa/40 mx-auto" />
              <div className="space-y-1">
                <p className="font-semibold text-ink-black text-sm">No orders matching this filter</p>
                <p>Check back later or reset your search &amp; status filters.</p>
              </div>
              {(searchQuery || filterStatus !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-bone border border-cocoa/30 hover:bg-espresso hover:text-warm-white text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors min-h-[40px]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const statusSaved = statusSaveFeedback[order.id];

                // Editorial badge styling by status
                const getStatusBadge = (status: Order['status']) => {
                  switch (status) {
                    case 'paid':
                      return 'bg-amber-500/10 text-amber-800 border-amber-600/30';
                    case 'sourcing':
                    case 'processing':
                      return 'bg-espresso/10 text-espresso border-espresso/25';
                    case 'out for delivery':
                    case 'shipped':
                      return 'bg-indigo-500/10 text-indigo-900 border-indigo-400/30';
                    case 'delivered':
                      return 'bg-emerald-600/10 text-emerald-800 border-emerald-600/30';
                    case 'cancelled':
                      return 'bg-oxblood/10 text-oxblood border-oxblood/20';
                    default:
                      return 'bg-bone text-cocoa border-cocoa/30';
                  }
                };

                const currentNormalizedStatus =
                  order.status === 'processing'
                    ? 'sourcing'
                    : order.status === 'shipped'
                    ? 'out for delivery'
                    : order.status;

                return (
                  <div
                    key={order.id}
                    className={`border rounded-xs transition-all overflow-hidden ${
                      isExpanded
                        ? 'border-ink-black/40 bg-warm-white shadow-sm'
                        : 'border-cocoa/20 bg-warm-white/60 hover:bg-warm-white hover:border-cocoa/40'
                    }`}
                  >
                    {/* Tappable Summary Card Row */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-3.5 sm:p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                    >
                      {/* Left: ID & Time & Type */}
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="font-mono text-xs font-bold text-ink-black">
                          {order.id}
                        </div>
                        <span
                          className={`text-[9px] uppercase px-2 py-0.5 rounded-xs font-semibold ${
                            order.id.startsWith('NOV-OFF')
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {order.id.startsWith('NOV-OFF') ? 'Offline' : 'Online'}
                        </span>
                        <span className="text-[11px] text-muted-taupe">
                          {new Date(order.createdAt).toLocaleDateString('en-NG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Middle: Customer & Destination summary */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-ink-black">{order.customer.fullName}</span>
                        <span className="text-muted-taupe">·</span>
                        <span className="text-muted-taupe">{order.customer.city}</span>
                        <span className="text-muted-taupe">·</span>
                        <span className="font-mono text-espresso font-medium">
                          {order.items.length} pair{order.items.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Right: Total, Status Pill, and Expand Arrow */}
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="font-mono font-bold text-ink-black text-sm tabular-nums">
                          ₦{order.total.toLocaleString()}
                        </div>

                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border tracking-wider ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                        <div className="text-cocoa p-1">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-ink-black" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tapped / Expanded Order Details */}
                    {isExpanded && (
                      <div className="border-t border-cocoa/20 bg-bone/40 p-4 sm:p-6 space-y-5 animate-in fade-in duration-150">
                        {/* 1. Items Ordered */}
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-cocoa">
                            Ordered Items ({order.items.length})
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-3 bg-warm-white border border-cocoa/15 rounded-xs"
                              >
                                <div className="relative w-12 h-12 bg-bone border border-cocoa/20 shrink-0 overflow-hidden">
                                  <Image
                                    src={item.product.images[0]?.src || '/images/products/the-ring-burgundy.jpg'}
                                    alt={item.product.name}
                                    fill
                                    unoptimized={Boolean(item.product.images[0]?.src?.startsWith('data:') || item.product.images[0]?.src?.startsWith('http'))}
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 text-xs">
                                  <div className="font-bold text-ink-black truncate">
                                    {item.product.name}
                                  </div>
                                  <div className="text-[11px] text-espresso font-mono mt-0.5">
                                    Color: <span className="font-bold">{item.selectedColour || item.product.colour}</span> · Size: <span className="font-bold">{item.selectedSize}</span> · Qty: {item.quantity}
                                  </div>
                                  <div className="text-[11px] text-muted-taupe font-mono mt-0.5">
                                    ₦{item.product.price.toLocaleString()} each
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Customer Details, Address, Note */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Profile & Contact */}
                          <div className="p-3.5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2">
                            <div className="text-[10px] uppercase tracking-wider font-bold text-cocoa">
                              Customer Contact
                            </div>
                            <div className="font-bold text-sm text-ink-black">
                              {order.customer.fullName}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-taupe">Phone:</span>
                              <a
                                href={`tel:${order.customer.phone}`}
                                className="font-mono text-espresso font-semibold hover:underline"
                              >
                                {order.customer.phone}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-muted-taupe">Email:</span>
                              <span className="font-mono text-muted-taupe truncate">
                                {order.customer.email.includes('@client.noveq') ? (
                                  <span className="italic">Offline Customer</span>
                                ) : (
                                  order.customer.email
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Destination & Note */}
                          <div className="p-3.5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2">
                            <div className="text-[10px] uppercase tracking-wider font-bold text-cocoa">
                              Delivery Address & Instructions
                            </div>
                            <div className="font-medium text-ink-black">
                              {order.customer.address}, {order.customer.city}, {order.customer.state}
                            </div>
                            {order.customer.deliveryNotes ? (
                              <div className="p-2 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xs text-[11px]">
                                <span className="font-bold">Rider Note: </span>
                                “{order.customer.deliveryNotes}”
                              </div>
                            ) : (
                              <div className="text-muted-taupe text-[11px] italic">
                                No special delivery note provided.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 3. Status Dropdown (Saves Instantly) + Message Customer Button (wa.me) */}
                        <div className="p-4 bg-warm-white border border-cocoa/30 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Status Dropdown */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <label className="text-[11px] uppercase tracking-wider font-bold text-cocoa">
                              Order Status:
                            </label>

                            <select
                              value={currentNormalizedStatus}
                              disabled={savingStatusId === order.id}
                              onChange={(e) =>
                                handleInstantStatusChange(order.id, e.target.value as Order['status'])
                              }
                              className={`text-xs font-bold px-3 py-2 rounded-xs border uppercase tracking-wider focus-dark cursor-pointer min-h-[40px] ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              <option value="paid">Paid (Scheduled for Artisans)</option>
                              <option value="sourcing">Sourcing (In Workshop Crafting)</option>
                              <option value="out for delivery">Out for Delivery (Rider Dispatched)</option>
                              <option value="delivered">Delivered (Confirmed by Courier)</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            {/* Instant Save Feedback */}
                            {statusSaved && (
                              <span className="text-xs font-bold text-emerald-700 animate-in fade-in flex items-center gap-1 font-mono">
                                <Check className="w-3.5 h-3.5" />
                                {statusSaved}
                              </span>
                            )}
                            {savingStatusId === order.id && (
                              <span className="text-xs text-muted-taupe flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin text-espresso" />
                                Saving...
                              </span>
                            )}
                          </div>

                          {/* Quick Action Buttons (Message Customer + Copy Waybill) */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={getWhatsAppUrlForOrder(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs transition-colors shadow-xs min-h-[44px] cursor-pointer"
                              title="Send tailored WhatsApp message for this status"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Message Customer</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => copyToClipboard(generateWaybillText(order), `waybill-${order.id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-bone border border-cocoa/30 hover:bg-warm-white text-ink-black text-xs font-medium rounded-xs transition-colors min-h-[44px]"
                            >
                              <FileText className="w-3.5 h-3.5 text-cocoa" />
                              <span>
                                {copiedId === `waybill-${order.id}` ? 'Waybill Copied!' : 'Copy Waybill'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedOrderModal(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-bone border border-cocoa/30 hover:bg-warm-white text-ink-black text-xs font-medium rounded-xs transition-colors min-h-[44px]"
                            >
                              <Eye className="w-3.5 h-3.5 text-espresso" />
                              <span>Full Card</span>
                            </button>

                            <a
                              href={`/order-confirmation/${order.id}/receipt`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-bone border border-cocoa/30 hover:bg-warm-white text-ink-black text-xs font-medium rounded-xs transition-colors min-h-[44px]"
                              title="View / Print receipt"
                            >
                              <Download className="w-3.5 h-3.5 text-cocoa" />
                              <span>Receipt</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => setOrderToDelete(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-bone border border-oxblood/30 hover:bg-oxblood/10 text-oxblood text-xs font-semibold rounded-xs transition-colors min-h-[44px]"
                              title="Delete this order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGER (Add, Edit, Hide, Update Price & Stock, 800px WebP Upload) */}
      {activeTab === 'products' && (
        <div className="bg-warm-white border border-cocoa/20 rounded-xs shadow-xs space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
            <div>
              <h2 className="text-xl font-bold text-ink-black font-serif">Product Catalog & Stock</h2>
              <p className="text-xs text-muted-taupe mt-0.5">
                Add, edit, hide footwear styles, manage prices and stock per size, and upload optimized 800px WebP photos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink-black hover:bg-espresso text-warm-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors focus-dark shadow-xs min-h-[44px]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-busy="true" aria-label="Loading products">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="border border-cocoa/20 rounded-xs p-4 sm:p-5 bg-warm-white animate-pulse space-y-4"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 bg-cocoa/15 rounded-xs shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 bg-cocoa/20 rounded-xs" />
                      <div className="h-3 w-1/2 bg-cocoa/10 rounded-xs" />
                      <div className="h-4 w-1/3 bg-cocoa/15 rounded-xs" />
                    </div>
                  </div>
                  <div className="h-9 w-full bg-cocoa/10 rounded-xs" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-taupe space-y-2 border border-dashed border-cocoa/20 rounded-xs">
              <Layers className="w-8 h-8 text-cocoa/40 mx-auto" />
              <p className="font-semibold text-ink-black text-sm">No products in catalog</p>
              <p>Click &quot;Add New Product&quot; above to create your first footwear style.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => {
                const isHidden = product.hidden || product.publish_status === 'draft';
                const totalStock = product.stock;

                return (
                  <div
                    key={product.slug}
                    className={`border rounded-xs p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-colors ${
                      isHidden
                        ? 'border-cocoa/20 bg-bone/40 opacity-80'
                        : 'border-cocoa/30 bg-warm-white shadow-2xs'
                    }`}
                  >
                    {/* Top Row: Thumbnail + Info + Status */}
                    <div className="flex gap-4 items-start">
                      <div className="relative w-20 h-20 bg-bone border border-cocoa/20 rounded-xs shrink-0 overflow-hidden">
                        <Image
                          src={product.images[0]?.src || '/images/products/the-ring-burgundy.jpg'}
                          alt={product.name}
                          fill
                          unoptimized={Boolean(product.images[0]?.src?.startsWith('data:') || product.images[0]?.src?.startsWith('http'))}
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-ink-black truncate">
                            {product.name}
                          </h3>
                          <span
                            className={`text-[9px] uppercase px-2 py-0.5 rounded-xs font-bold tracking-wider ${
                              isHidden
                                ? 'bg-gray-200 text-gray-700 border border-gray-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {isHidden ? 'Hidden (Draft)' : 'Visible'}
                          </span>
                        </div>

                        <div className="text-xs text-muted-taupe font-mono">
                          /{product.slug} · {product.collection}
                        </div>

                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-lg font-bold font-mono text-ink-black">
                            ₦{product.price.toLocaleString()}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-xs font-mono text-muted-taupe line-through">
                              ₦{product.compare_at_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Stock Levels & Sizes */}
                    <div className="p-3 bg-bone border border-cocoa/15 rounded-xs space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-cocoa uppercase tracking-wider">
                          Remaining Stock:
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            totalStock <= 2 ? 'text-oxblood' : 'text-ink-black'
                          }`}
                        >
                          {totalStock} pairs total
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(product.sizes || []).map((sz) => (
                          <span
                            key={sz.size}
                            className={`px-1.5 py-0.5 text-[10px] font-mono rounded-xs border ${
                              sz.stockCount > 0
                                ? 'bg-warm-white border-cocoa/20 text-ink-black'
                                : 'bg-gray-100 border-gray-200 text-gray-400 line-through'
                            }`}
                          >
                            {sz.size}: {sz.stockCount}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom: Action Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-cocoa/15">
                      {/* Hide / Unhide Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleProductVisibility(product.slug, product.hidden)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xs border transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer ${
                          isHidden
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-warm-white text-cocoa border-cocoa/30 hover:bg-bone'
                        }`}
                      >
                        {isHidden ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Unhide</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-muted-taupe" />
                            <span>Hide</span>
                          </>
                        )}
                      </button>

                      {/* Quick Stock & Price */}
                      <button
                        type="button"
                        onClick={() => setQuickStockProduct(product)}
                        className="py-2 px-2 bg-warm-white border border-cocoa/30 hover:bg-bone text-ink-black text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-espresso" />
                        <span>Price & Stock</span>
                      </button>

                      {/* Full Edit Product */}
                      <button
                        type="button"
                        onClick={() => setEditingProduct(product)}
                        className="py-2 px-2 bg-ink-black hover:bg-espresso text-warm-white text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Product</span>
                      </button>

                      {/* Delete Product */}
                      <button
                        type="button"
                        onClick={() => setProductToDelete(product)}
                        className="py-2 px-2 bg-warm-white border border-oxblood/30 hover:bg-oxblood/10 text-oxblood text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FUNCTIONAL DASHBOARD & PIPELINE METRICS */}
      {activeTab === 'dashboard' && (
        <div className="bg-warm-white border border-cocoa/20 rounded-xs shadow-xs space-y-6 p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-ink-black font-serif">Executive Fulfillment & Performance</h2>
            <p className="text-xs text-muted-taupe mt-0.5">
              High-utility operational overview. Real-time conversion, status stages, and inventory movement.
            </p>
          </div>

          {/* Fulfillment Pipeline Bar */}
          <div className="p-4 bg-bone border border-cocoa/20 rounded-xs space-y-3">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-cocoa">
              <span>Orders Fulfillment Status Distribution</span>
              <span className="font-mono text-ink-black">{orders.length} Total</span>
            </div>

            {/* Segmented Pipeline Bar */}
            <div className="h-4 w-full bg-warm-white rounded-xs overflow-hidden flex border border-cocoa/20">
              {orders.length > 0 ? (
                <>
                  <div
                    style={{ width: `${(statusCounts.paid / orders.length) * 100}%` }}
                    className="bg-amber-500 transition-all"
                    title={`Paid: ${statusCounts.paid}`}
                  />
                  <div
                    style={{ width: `${(statusCounts.sourcing / orders.length) * 100}%` }}
                    className="bg-blue-600 transition-all"
                    title={`Sourcing: ${statusCounts.sourcing}`}
                  />
                  <div
                    style={{ width: `${(statusCounts.outForDelivery / orders.length) * 100}%` }}
                    className="bg-purple-600 transition-all"
                    title={`Out for Delivery: ${statusCounts.outForDelivery}`}
                  />
                  <div
                    style={{ width: `${(statusCounts.delivered / orders.length) * 100}%` }}
                    className="bg-emerald-600 transition-all"
                    title={`Delivered: ${statusCounts.delivered}`}
                  />
                  <div
                    style={{ width: `${(statusCounts.cancelled / orders.length) * 100}%` }}
                    className="bg-gray-400 transition-all"
                    title={`Cancelled: ${statusCounts.cancelled}`}
                  />
                </>
              ) : (
                <div className="w-full bg-bone" />
              )}
            </div>

            {/* Legend & Exact Figures */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
              <div
                onClick={() => {
                  setFilterStatus('paid');
                  setActiveTab('orders');
                }}
                className="cursor-pointer hover:underline"
              >
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Paid:</span>
                </div>
                <div className="font-mono font-bold text-sm tabular-nums mt-0.5">
                  {statusCounts.paid} orders
                </div>
              </div>

              <div
                onClick={() => {
                  setFilterStatus('sourcing');
                  setActiveTab('orders');
                }}
                className="cursor-pointer hover:underline"
              >
                <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Sourcing:</span>
                </div>
                <div className="font-mono font-bold text-sm tabular-nums mt-0.5">
                  {statusCounts.sourcing} orders
                </div>
              </div>

              <div
                onClick={() => {
                  setFilterStatus('out for delivery');
                  setActiveTab('orders');
                }}
                className="cursor-pointer hover:underline"
              >
                <div className="flex items-center gap-1.5 text-purple-900 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span>Out for Delivery:</span>
                </div>
                <div className="font-mono font-bold text-sm tabular-nums mt-0.5">
                  {statusCounts.outForDelivery} orders
                </div>
              </div>

              <div
                onClick={() => {
                  setFilterStatus('delivered');
                  setActiveTab('orders');
                }}
                className="cursor-pointer hover:underline"
              >
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Delivered:</span>
                </div>
                <div className="font-mono font-bold text-sm tabular-nums mt-0.5">
                  {statusCounts.delivered} orders
                </div>
              </div>

              <div
                onClick={() => {
                  setFilterStatus('cancelled');
                  setActiveTab('orders');
                }}
                className="cursor-pointer hover:underline"
              >
                <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <span>Cancelled:</span>
                </div>
                <div className="font-mono font-bold text-sm tabular-nums mt-0.5">
                  {statusCounts.cancelled} orders
                </div>
              </div>
            </div>
          </div>

          {/* Footwear Styles Sales Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cocoa">
              Product Performance & Inventory Movement
            </h3>

            <div className="overflow-x-auto border border-cocoa/20 rounded-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/60">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Pairs Sold</th>
                    <th className="p-3">Gross Revenue</th>
                    <th className="p-3">Remaining Stock</th>
                    <th className="p-3">Catalog Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cocoa/15 bg-warm-white">
                  {products.map((prod) => {
                    const soldCount = orders
                      .filter((o) => o.status !== 'cancelled')
                      .reduce((sum, o) => {
                        const matching = o.items.filter(
                          (i) =>
                            i.product.slug === prod.slug ||
                            i.product.name.toLowerCase() === prod.name.toLowerCase()
                        );
                        return sum + matching.reduce((mSum, m) => mSum + m.quantity, 0);
                      }, 0);

                    const prodRevenue = soldCount * prod.price;

                    return (
                      <tr key={prod.slug} className="hover:bg-bone/40 transition-colors">
                        <td className="p-3 font-bold text-ink-black flex items-center gap-2">
                          <span>{prod.name}</span>
                        </td>
                        <td className="p-3 font-mono font-medium">₦{prod.price.toLocaleString()}</td>
                        <td className="p-3 font-mono font-bold text-espresso">{soldCount} pairs</td>
                        <td className="p-3 font-mono font-bold text-ink-black">
                          ₦{prodRevenue.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-xs font-bold ${
                              prod.stock <= 2
                                ? 'bg-oxblood/10 text-oxblood'
                                : 'bg-bone text-ink-black'
                            }`}
                          >
                            {prod.stock} pairs left
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[9px] uppercase px-2 py-0.5 rounded-xs font-bold ${
                              prod.hidden
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {prod.hidden ? 'Hidden' : 'Visible'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLIENT DIRECTORY (CRM) */}
      {activeTab === 'customers' && (
        <div className="bg-warm-white border border-cocoa/20 rounded-xs shadow-xs space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
            <div>
              <h2 className="text-xl font-bold text-ink-black font-serif">Client Directory</h2>
              <p className="text-xs text-muted-taupe mt-0.5">
                Patrons who have placed orders with NOVEQ.
              </p>
            </div>
            <div className="text-xs text-cocoa font-medium">
              <span>Total Unique Patrons: </span>
              <span className="font-bold text-ink-black font-mono">{uniqueCustomers.length}</span>
            </div>
          </div>

          {uniqueCustomers.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-taupe space-y-2 border border-dashed border-cocoa/20 rounded-xs">
              <Users className="w-8 h-8 text-cocoa/40 mx-auto" />
              <p className="font-semibold text-ink-black text-sm">No customers recorded yet</p>
              <p>Customer profiles will aggregate automatically as orders are placed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/60">
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Phone & Email</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Orders Count</th>
                    <th className="p-3">Total Spend</th>
                    <th className="p-3">Last Order</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cocoa/15">
                  {uniqueCustomers.map((cust, idx) => (
                    <tr key={idx} className="hover:bg-bone/40 transition-colors">
                      <td className="p-3 font-bold text-ink-black">{cust.fullName}</td>
                      <td className="p-3 font-mono">
                        <div>{cust.phone}</div>
                        <div className="text-[10px] text-muted-taupe font-sans">{cust.email}</div>
                      </td>
                      <td className="p-3 text-ink-black">
                        {cust.city}, {cust.state}
                      </td>
                      <td className="p-3 font-mono font-bold text-center">
                        <span className="px-2 py-0.5 bg-bone border border-cocoa/20 rounded-xs">
                          {cust.orderCount} pair{cust.orderCount > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-ink-black">
                        ₦{cust.totalSpent.toLocaleString()}
                      </td>
                      <td className="p-3 text-muted-taupe font-mono text-[11px]">
                        {new Date(cust.lastOrderDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3">
                        <a
                          href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${cust.fullName}, this is the NOVEQ team. Thank you for walking with us.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors min-h-[36px]"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: EMAIL SUBSCRIBERS */}
      {activeTab === 'subscribers' && (
        <div className="bg-warm-white border border-cocoa/20 rounded-xs shadow-xs space-y-4 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
            <div>
              <h2 className="text-xl font-bold text-ink-black font-serif">Email Subscribers</h2>
              <p className="text-xs text-muted-taupe mt-0.5">
                Every visitor subscribed by default. Synced live with Supabase subscribers table.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-cocoa" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={subscribersSearch}
                  onChange={(e) => setSubscribersSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-bone border border-cocoa/30 rounded-xs focus-dark text-ink-black font-medium min-h-[40px]"
                />
              </div>

              <button
                type="button"
                onClick={copyAllSubscribers}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-espresso transition-colors min-h-[40px] cursor-pointer"
              >
                {copiedAllEmails ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied {subscribers.length}!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All Emails</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={exportSubscribersCSV}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors min-h-[40px] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cocoa" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {filteredSubscribers.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-taupe space-y-2 border border-dashed border-cocoa/20 rounded-xs">
              <Mail className="w-8 h-8 text-cocoa/40 mx-auto" />
              <p className="font-semibold text-ink-black text-sm">No subscribers found</p>
              <p>Visitors who join your list on the site will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/60">
                    <th className="p-3">Subscriber Email</th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Date Registered</th>
                    <th className="p-3">Tags</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cocoa/15">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-bone/40 transition-colors">
                      <td className="p-3 font-mono font-semibold text-ink-black">{sub.email}</td>
                      <td className="p-3 text-ink-black">
                        {sub.name || <span className="text-muted-taupe italic">Visitor</span>}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-espresso/10 text-espresso text-[10px] uppercase font-mono tracking-wider rounded-xs">
                          {sub.source.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-muted-taupe font-mono text-[11px]">
                        {new Date(sub.subscribedAt).toLocaleDateString('en-NG', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(sub.tags || []).map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 bg-bone border border-cocoa/20 text-[9px] uppercase font-mono text-cocoa rounded-xs"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(sub.email, sub.id)}
                            className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-espresso hover:underline min-h-[30px]"
                          >
                            {copiedId === sub.id ? (
                              <span className="text-emerald-700">Copied!</span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSubscriberToDelete(sub)}
                            className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-oxblood/80 hover:text-oxblood hover:underline min-h-[30px]"
                            title="Delete subscriber"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QUICK PRICE & STOCK MODAL */}
      {quickStockProduct && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-warm-white border border-cocoa/30 max-w-md w-full rounded-xs shadow-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-cocoa/20 bg-bone flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-espresso">
                  Inventory & Pricing
                </span>
                <h3 className="text-base font-bold text-ink-black truncate">
                  {quickStockProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickStockProduct(null)}
                className="p-1 hover:bg-cocoa/10 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5 text-ink-black" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickStock} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Base Retail Price (₦)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  required
                  value={quickStockProduct.price}
                  onChange={(e) =>
                    setQuickStockProduct({
                      ...quickStockProduct,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs font-mono font-bold text-ink-black text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Total Remaining Stock
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={quickStockProduct.stock}
                  onChange={(e) =>
                    setQuickStockProduct({
                      ...quickStockProduct,
                      stock: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs font-mono font-bold text-ink-black text-sm min-h-[44px]"
                />
              </div>

              {/* Sizes breakdown */}
              <div className="space-y-2 pt-2 border-t border-cocoa/15">
                <label className="block text-[10px] uppercase font-bold text-cocoa">
                  Stock Per Size (Pairs Available)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(quickStockProduct.sizes || []).map((sz, idx) => (
                    <div key={sz.size} className="p-2 bg-bone border border-cocoa/20 rounded-xs text-center">
                      <div className="font-bold text-[11px] text-ink-black">{sz.size}</div>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={sz.stockCount}
                        onChange={(e) => {
                          const updatedCount = Number(e.target.value);
                          const updatedSizes = [...quickStockProduct.sizes];
                          updatedSizes[idx] = {
                            ...sz,
                            stockCount: updatedCount,
                            available: updatedCount > 0,
                          };
                          const newTotal = updatedSizes.reduce((sum, s) => sum + s.stockCount, 0);
                          setQuickStockProduct({
                            ...quickStockProduct,
                            sizes: updatedSizes,
                            stock: newTotal,
                          });
                        }}
                        className="w-full text-center px-1 py-1 mt-1 bg-warm-white border border-cocoa/30 rounded-xs font-mono font-bold text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-cocoa/15">
                <button
                  type="button"
                  onClick={() => setQuickStockProduct(null)}
                  className="flex-1 py-3 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="flex-1 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-espresso transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  {isSavingProduct ? 'Saving...' : 'Save Stock & Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL ADD / EDIT PRODUCT MODAL (With 800px WebP Resizing & Supabase Storage) */}
      {(isAddProductOpen || editingProduct) && (
        <ProductFormModal
          initialProduct={editingProduct}
          isNew={isAddProductOpen}
          isSaving={isSavingProduct}
          isUploading={isUploadingImage}
          uploadFeedback={uploadFeedback}
          onClose={() => {
            setIsAddProductOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveFullProduct}
          onUploadImage={handleImageFileSelect}
        />
      )}

      {/* RECORD OFFLINE SALE MODAL */}
      {isOfflineModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-warm-white border border-cocoa/30 max-w-lg w-full rounded-xs shadow-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-cocoa/20 bg-bone flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-espresso">
                  Manual Entry
                </span>
                <h3 className="text-lg font-bold text-ink-black font-serif">Record Offline Sale</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOfflineModalOpen(false)}
                className="p-1 hover:bg-cocoa/10 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5 text-ink-black" />
              </button>
            </div>

            {offlineConfirmStep ? (
              <div className="p-6 space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xs flex gap-3 text-amber-900">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">Please confirm this transaction:</p>
                    <p>
                      Recording this will save the order, update your Google Sheet, and notify the team on Telegram.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-bone border border-cocoa/20 rounded-xs space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-taupe">Customer:</span>
                    <span className="font-bold text-ink-black">{offlineForm.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-taupe">Phone:</span>
                    <span className="font-mono">{offlineForm.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-taupe">Item:</span>
                    <span className="font-semibold text-ink-black">
                      {offlineForm.productName} ({offlineForm.colour}, {offlineForm.size})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-taupe">Quantity:</span>
                    <span className="font-bold">{offlineForm.quantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-cocoa/20 pt-2 text-sm font-bold">
                    <span>Total Amount:</span>
                    <span className="font-mono font-bold">₦{offlineForm.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-cocoa">
                    <span>Channel / Method:</span>
                    <span>{offlineForm.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOfflineConfirmStep(false)}
                    className="flex-1 py-3 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors min-h-[44px]"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingOffline}
                    onClick={handleCreateOfflineOrder}
                    className="flex-1 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-espresso transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    {isSubmittingOffline ? 'Saving & Syncing...' : 'Confirm & Save Order'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateOfflineOrder} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tunde Williams"
                      value={offlineForm.customerName}
                      onChange={(e) =>
                        setOfflineForm({ ...offlineForm, customerName: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +234 803 000 0000"
                      value={offlineForm.phone}
                      onChange={(e) => setOfflineForm({ ...offlineForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium font-mono min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="customer@email.com"
                      value={offlineForm.email}
                      onChange={(e) => setOfflineForm({ ...offlineForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={offlineForm.state}
                      onChange={(e) => setOfflineForm({ ...offlineForm, state: e.target.value })}
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={offlineForm.city}
                      onChange={(e) => setOfflineForm({ ...offlineForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Street, estate, or landmark"
                      value={offlineForm.address}
                      onChange={(e) => setOfflineForm({ ...offlineForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-cocoa/15">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Product
                    </label>
                    <select
                      value={offlineForm.productName}
                      onChange={(e) => {
                        const newName = e.target.value;
                        const unitPrice = getProductPrice(newName);
                        setOfflineForm({
                          ...offlineForm,
                          productName: newName,
                          total: offlineForm.quantity * unitPrice,
                        });
                      }}
                      className="w-full px-2 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium min-h-[44px]"
                    >
                      {products.length > 0 ? (
                        products.map((p) => (
                          <option key={p.slug} value={p.name}>
                            {p.name} (₦{p.price.toLocaleString()})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="The Ring Slide Pam">The Ring Slide Pam (₦25,000)</option>
                          <option value="The Weave Slide Pam">The Weave Slide Pam (₦20,000)</option>
                          <option value="The Twist Slide Pam">The Twist Slide Pam (₦25,000)</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Color
                    </label>
                    <select
                      value={offlineForm.colour}
                      onChange={(e) => setOfflineForm({ ...offlineForm, colour: e.target.value })}
                      className="w-full px-2 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium min-h-[44px]"
                    >
                      <option value="Warm Cognac">Warm Cognac</option>
                      <option value="Burgundy">Burgundy</option>
                      <option value="Black">Black</option>
                      <option value="Off White">Off White</option>
                      <option value="Army Green">Army Green</option>
                      <option value="Dark Brown">Dark Brown</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Size
                    </label>
                    <select
                      value={offlineForm.size}
                      onChange={(e) => setOfflineForm({ ...offlineForm, size: e.target.value })}
                      className="w-full px-2 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium min-h-[44px]"
                    >
                      {['EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'].map(
                        (sz) => (
                          <option key={sz} value={sz}>
                            {sz}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={offlineForm.quantity}
                      onChange={(e) => {
                        const qty = Math.max(1, Number(e.target.value) || 1);
                        const unitPrice = getProductPrice(offlineForm.productName);
                        setOfflineForm({
                          ...offlineForm,
                          quantity: qty,
                          total: qty * unitPrice,
                        });
                      }}
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium font-mono min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Total Amount (₦)
                    </label>
                    <input
                      type="number"
                      value={offlineForm.total}
                      onChange={(e) =>
                        setOfflineForm({ ...offlineForm, total: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium font-mono min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Channel / Method
                    </label>
                    <select
                      value={offlineForm.paymentMethod}
                      onChange={(e) =>
                        setOfflineForm({ ...offlineForm, paymentMethod: e.target.value })
                      }
                      className="w-full px-2 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium min-h-[44px]"
                    >
                      <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="WhatsApp Order">WhatsApp Order</option>
                      <option value="Instagram DM">Instagram DM</option>
                      <option value="Pop-up Showroom">Pop-up Showroom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                    Delivery Notes / Rider Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paid to Zenith bank, deliver before 3pm"
                    value={offlineForm.deliveryNotes}
                    onChange={(e) =>
                      setOfflineForm({ ...offlineForm, deliveryNotes: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium min-h-[44px]"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-cocoa/15">
                  <button
                    type="button"
                    onClick={() => setIsOfflineModalOpen(false)}
                    className="flex-1 py-3 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-espresso transition-colors shadow-xs min-h-[44px]"
                  >
                    Review & Confirm
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FULL ORDER DETAIL MODAL */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-warm-white border border-cocoa/30 max-w-xl w-full rounded-xs shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-cocoa/20 bg-bone flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-espresso">
                  Order Details
                </span>
                <h3 className="text-xl font-bold font-mono text-ink-black">
                  {selectedOrderModal.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderModal(null)}
                className="p-1.5 hover:bg-cocoa/10 rounded-full text-ink-black min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="p-4 bg-bone/60 border border-cocoa/20 rounded-xs space-y-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-cocoa">
                  Customer & Delivery Information
                </div>
                <div className="text-sm font-bold text-ink-black">{selectedOrderModal.customer.fullName}</div>
                <div className="font-mono text-espresso">{selectedOrderModal.customer.phone}</div>
                <div className="text-muted-taupe">{selectedOrderModal.customer.email}</div>
                <div className="text-ink-black pt-1 font-medium">
                  {selectedOrderModal.customer.address}, {selectedOrderModal.customer.city}, {selectedOrderModal.customer.state}
                </div>
                {selectedOrderModal.customer.deliveryNotes && (
                  <div className="pt-2 text-cocoa italic">
                    Note: “{selectedOrderModal.customer.deliveryNotes}”
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-wider font-bold text-cocoa">
                  Footwear Ordered ({selectedOrderModal.items.length})
                </div>
                {selectedOrderModal.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-bone/30 border border-cocoa/15 rounded-xs">
                    <div className="relative w-12 h-12 bg-bone border border-cocoa/20 shrink-0 overflow-hidden">
                      <Image
                        src={item.product.images[0]?.src || '/images/products/the-ring-burgundy.jpg'}
                        alt={item.product.name}
                        fill
                        unoptimized={Boolean(item.product.images[0]?.src?.startsWith('data:') || item.product.images[0]?.src?.startsWith('http'))}
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink-black truncate">{item.product.name}</div>
                      <div className="text-[11px] text-espresso font-mono">
                        Color: {item.selectedColour || item.product.colour} · Size: {item.selectedSize} · Qty: {item.quantity} · ₦{item.product.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-bone/50 border border-cocoa/20 rounded-xs space-y-2 font-mono">
                <div className="flex justify-between text-muted-taupe">
                  <span>Subtotal</span>
                  <span>₦{selectedOrderModal.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-taupe">
                  <span>Delivery Fee</span>
                  <span>Pay rider on delivery</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-ink-black pt-2 border-t border-cocoa/20">
                  <span>Total Amount</span>
                  <span>₦{selectedOrderModal.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(generateWaybillText(selectedOrderModal), `modal-waybill-${selectedOrderModal.id}`)
                  }
                  className="py-3 px-4 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-bone transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <FileText className="w-4 h-4 text-cocoa" />
                  <span>
                    {copiedId === `modal-waybill-${selectedOrderModal.id}` ? 'Waybill Copied!' : 'Copy Dispatch Waybill'}
                  </span>
                </button>

                <a
                  href={getWhatsAppUrlForOrder(selectedOrderModal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="p-4 border-t border-cocoa/20 bg-bone flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOrderToDelete(selectedOrderModal)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-warm-white border border-oxblood/30 text-oxblood text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-oxblood/10 transition-colors min-h-[44px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Order</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderModal(null)}
                className="px-5 py-2.5 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-espresso transition-colors min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DELETE CONFIRMATION MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-warm-white border border-cocoa/30 max-w-md w-full rounded-xs shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-oxblood">
              <div className="w-10 h-10 rounded-full bg-oxblood/10 border border-oxblood/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-oxblood" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink-black">Delete Order Record</h3>
                <p className="text-xs text-muted-taupe">Permanent removal from store ledger.</p>
              </div>
            </div>

            <div className="p-3 bg-bone border border-cocoa/20 rounded-xs space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-taupe">Order Reference:</span>
                <span className="font-mono font-bold text-ink-black">{orderToDelete.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-taupe">Customer:</span>
                <span className="font-bold text-ink-black">{orderToDelete.customer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-taupe">Amount:</span>
                <span className="font-mono font-bold text-ink-black">₦{orderToDelete.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-taupe">Status:</span>
                <span className="uppercase font-bold text-cocoa">{orderToDelete.status}</span>
              </div>
            </div>

            <p className="text-xs text-oxblood leading-relaxed">
              Are you sure you want to permanently delete this order? This will remove the transaction record from your database and cannot be undone.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors min-h-[44px]"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteOrder}
                className="flex-1 py-2.5 bg-oxblood text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-oxblood/90 transition-colors disabled:opacity-50 min-h-[44px]"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIBER DELETE CONFIRMATION MODAL */}
      {subscriberToDelete && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-warm-white border border-cocoa/30 max-w-md w-full rounded-xs shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-oxblood">
              <div className="w-10 h-10 rounded-full bg-oxblood/10 border border-oxblood/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-oxblood" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink-black">Remove Subscriber</h3>
                <p className="text-xs text-muted-taupe">Delete email from subscriber records.</p>
              </div>
            </div>

            <div className="p-3 bg-bone border border-cocoa/20 rounded-xs space-y-1.5 text-xs">
              <div>
                <span className="text-muted-taupe">Email: </span>
                <span className="font-mono font-bold text-ink-black">{subscriberToDelete.email}</span>
              </div>
              {subscriberToDelete.name && (
                <div>
                  <span className="text-muted-taupe">Name: </span>
                  <span className="font-medium text-ink-black">{subscriberToDelete.name}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-taupe leading-relaxed">
              Are you sure you want to remove this contact from your email list and Supabase records?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSubscriberToDelete(null)}
                className="flex-1 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors min-h-[44px]"
              >
                Keep Contact
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSubscriber}
                className="flex-1 py-2.5 bg-oxblood text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-oxblood/90 transition-colors disabled:opacity-50 min-h-[44px]"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-warm-white border border-cocoa/30 max-w-md w-full rounded-xs shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-oxblood">
              <div className="w-10 h-10 rounded-full bg-oxblood/10 border border-oxblood/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-oxblood" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink-black">Delete Product</h3>
                <p className="text-xs text-muted-taupe">Remove footwear style from catalog.</p>
              </div>
            </div>

            <div className="p-3 bg-bone border border-cocoa/20 rounded-xs space-y-1 text-xs">
              <div className="font-bold text-ink-black text-sm">{productToDelete.name}</div>
              <div className="text-muted-taupe font-mono">
                /{productToDelete.slug} · ₦{productToDelete.price.toLocaleString()}
              </div>
            </div>

            <p className="text-xs text-oxblood leading-relaxed">
              Warning: This will permanently remove this footwear style from your store inventory. (Tip: You can also use &quot;Hide&quot; to keep it in your archive without customers seeing it).
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors min-h-[44px]"
              >
                Keep Product
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 bg-oxblood text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-oxblood/90 transition-colors disabled:opacity-50 min-h-[44px]"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Style'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Dedicated Product Add / Edit Modal Component
 * with Client-Side 800px WebP Optimization & Supabase Storage
 */
interface ProductFormModalProps {
  initialProduct: Product | null;
  isNew: boolean;
  isSaving: boolean;
  isUploading: boolean;
  uploadFeedback: string | null;
  onClose: () => void;
  onSave: (data: Partial<Product>, isNew: boolean) => void;
  onUploadImage: (file: File, onSuccess: (url: string) => void) => void;
}

function ProductFormModal({
  initialProduct,
  isNew,
  isSaving,
  isUploading,
  uploadFeedback,
  onClose,
  onSave,
  onUploadImage,
}: ProductFormModalProps) {
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [collection, setCollection] = useState(initialProduct?.collection || 'Drop 001');
  const [price, setPrice] = useState(initialProduct?.price || 20000);
  const [comparePrice, setComparePrice] = useState(initialProduct?.compare_at_price || 22000);
  const [colour, setColour] = useState(initialProduct?.colour || 'Warm Cognac');
  const [colourHex, setColourHex] = useState(initialProduct?.colourHex || '#7C3F1D');
  const [stock, setStock] = useState(initialProduct?.stock || 5);
  const [description, setDescription] = useState(
    initialProduct?.description || 'Contemporary handcrafted leather pam with barefoot ergonomics.'
  );
  const [material, setMaterial] = useState(
    initialProduct?.material || 'Hand-selected Nigerian calfskin, molded ergonomic footbed.'
  );
  const [care, setCare] = useState(
    initialProduct?.care || 'Wipe with soft cotton cloth after wear. Condition with light neutral balm.'
  );
  const [designNote, setDesignNote] = useState(initialProduct?.design_note || '');
  const [hidden, setHidden] = useState(initialProduct?.hidden || initialProduct?.publish_status === 'draft' || false);
  const [images, setImages] = useState<Array<{ src: string; alt: string; viewType: 'hero' | 'detail' | 'side' }>>(
    initialProduct?.images?.map((img, idx) => ({
      src: img.src,
      alt: img.alt || `NOVEQ ${name}`,
      viewType: (img.viewType as 'hero' | 'detail' | 'side') || (idx === 0 ? 'hero' : 'detail'),
    })) || [
      {
        src: '/images/products/the-twist-burgundy.jpg',
        alt: 'NOVEQ Product Image',
        viewType: 'hero',
      },
    ]
  );
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('Product name and price are required.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        collection,
        price: Number(price),
        compare_at_price: comparePrice ? Number(comparePrice) : undefined,
        colour,
        colourHex,
        stock: Number(stock),
        description,
        material,
        care,
        design_note: designNote,
        hidden,
        publish_status: hidden ? 'draft' : 'published',
        images: images.map((i, idx) => ({
          src: i.src,
          alt: i.alt || `NOVEQ ${name}`,
          viewType: idx === 0 ? 'hero' : (i.viewType || 'detail'),
        })),
      },
      isNew
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUploadImage(file, (uploadedUrl) => {
      setImages((prev) => {
        const isPlaceholderOnly = isNew && prev.length === 1 && (
          prev[0].src.includes('the-ring-burgundy') || prev[0].src.includes('the-twist-burgundy')
        );
        const filtered = isPlaceholderOnly ? [] : prev;
        return [
          {
            src: uploadedUrl,
            alt: `NOVEQ ${name || 'Product'} Image`,
            viewType: 'hero',
          },
          ...filtered.map((img) => ({
            ...img,
            viewType: 'detail' as const,
          })),
        ];
      });
    });

    // Reset input value so selecting same file works reliably
    e.target.value = '';
  };

  const handleAddImageUrl = (urlToAdd?: string) => {
    const targetUrl = (urlToAdd || customImageUrl).trim();
    if (!targetUrl) return;

    setImages((prev) => {
      const isPlaceholderOnly = isNew && prev.length === 1 && (
        prev[0].src.includes('the-ring-burgundy') || prev[0].src.includes('the-twist-burgundy')
      );
      const filtered = isPlaceholderOnly ? [] : prev;
      return [
        {
          src: targetUrl,
          alt: `NOVEQ ${name || 'Product'} Image`,
          viewType: filtered.length === 0 ? 'hero' : 'detail',
        },
        ...filtered,
      ];
    });
    setCustomImageUrl('');
    setIsUrlInputOpen(false);
  };

  const handleSetHero = (targetIdx: number) => {
    setImages((prev) => {
      if (targetIdx <= 0 || targetIdx >= prev.length) return prev;
      const selected = prev[targetIdx];
      const remainder = prev.filter((_, idx) => idx !== targetIdx);
      return [
        { ...selected, viewType: 'hero' },
        ...remainder.map((img) => ({ ...img, viewType: 'detail' as const })),
      ];
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-warm-white border border-cocoa/30 max-w-2xl w-full rounded-xs shadow-2xl overflow-hidden my-8 animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 border-b border-cocoa/20 bg-bone flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-espresso">
              Catalog Management
            </span>
            <h3 className="text-lg font-bold text-ink-black font-serif">
              {isNew ? 'Add New Footwear Style' : `Edit: ${initialProduct?.name}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-cocoa/10 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5 text-ink-black" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Row 1: Name and Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Knot Slide Pam"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (isNew) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }
                }}
                className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs font-semibold text-ink-black min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                URL Slug
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs font-mono text-ink-black min-h-[44px]"
              />
            </div>
          </div>

          {/* Row 2: Price, Compare Price, Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Retail Price (₦) *
              </label>
              <input
                type="number"
                min={1000}
                step={500}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs font-mono font-bold text-ink-black min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Compare-at Price (₦)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={comparePrice}
                onChange={(e) => setComparePrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs font-mono text-muted-taupe min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Total Stock Available *
              </label>
              <input
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs font-mono font-bold text-ink-black min-h-[44px]"
              />
            </div>
          </div>

          {/* Row 3: Colour & Hex & Collection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Primary Colour Name
              </label>
              <input
                type="text"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Colour Hex Code
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={colourHex}
                  onChange={(e) => setColourHex(e.target.value)}
                  className="w-10 h-10 border border-cocoa/30 rounded-xs p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={colourHex}
                  onChange={(e) => setColourHex(e.target.value)}
                  className="flex-1 px-3 py-2 bg-bone border border-cocoa/30 rounded-xs font-mono text-ink-black min-h-[44px]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Collection
              </label>
              <input
                type="text"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black min-h-[44px]"
              />
            </div>
          </div>

          {/* Image Upload & Management (Sharp Server Optimization + Supabase Storage) */}
          <div className="p-4 bg-bone border border-cocoa/20 rounded-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa">
                  Product Imagery (Auto-Resized & Optimized WebP)
                </label>
                <p className="text-[11px] text-muted-taupe">
                  Uploaded images are automatically scaled, auto-oriented, and optimized to WebP.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-ink-black hover:bg-espresso text-warm-white text-xs uppercase font-semibold rounded-xs transition-colors min-h-[40px] cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUrlInputOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-bone hover:bg-cocoa/15 border border-cocoa/30 text-ink-black text-xs font-semibold rounded-xs transition-colors min-h-[40px] cursor-pointer"
                  title="Paste an image URL directly"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{isUrlInputOpen ? 'Hide URL' : 'Paste URL'}</span>
                </button>
              </div>
            </div>

            {/* Optional URL Input Dropdown */}
            {isUrlInputOpen && (
              <div className="p-3 bg-warm-white border border-cocoa/30 rounded-xs space-y-2 animate-in fade-in duration-150">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://... or /images/products/..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-xs text-ink-black min-h-[40px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl()}
                    disabled={!customImageUrl.trim()}
                    className="px-3 py-2 bg-espresso hover:bg-ink-black text-warm-white text-xs font-semibold rounded-xs disabled:opacity-40 min-h-[40px] cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-taupe">
                  <span>Quick catalog presets:</span>
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl('/images/models/the-twist-hero-model.jpg')}
                    className="px-1.5 py-0.5 bg-bone border border-cocoa/20 rounded-xs hover:border-cocoa text-espresso"
                  >
                    The Twist (Model)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl('/images/products/the-twist-burgundy.jpg')}
                    className="px-1.5 py-0.5 bg-bone border border-cocoa/20 rounded-xs hover:border-cocoa text-espresso"
                  >
                    The Twist (Burgundy)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl('/images/products/the-twist-warm-cognac.jpg')}
                    className="px-1.5 py-0.5 bg-bone border border-cocoa/20 rounded-xs hover:border-cocoa text-espresso"
                  >
                    The Twist (Brown)
                  </button>
                </div>
              </div>
            )}

            {uploadFeedback && (
              <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xs font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{uploadFeedback}</span>
              </div>
            )}

            {/* Gallery Previews with Hero Indicator */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-muted-taupe block">
                Attached Images ({images.length}) — Click star to set primary hero
              </span>
              <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => {
                  const isHero = idx === 0 || img.viewType === 'hero';
                  return (
                    <div
                      key={idx}
                      className={`relative w-20 h-20 bg-warm-white border rounded-xs overflow-hidden group ${
                        isHero ? 'border-espresso ring-2 ring-espresso/30' : 'border-cocoa/30'
                      }`}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        unoptimized={img.src.startsWith('data:') || img.src.startsWith('http')}
                        sizes="80px"
                        className="object-cover"
                      />

                      {/* Hero Badge */}
                      {isHero && (
                        <span className="absolute top-1 left-1 px-1 py-0.5 bg-ink-black/90 text-warm-white text-[9px] uppercase font-bold tracking-wider rounded-xs pointer-events-none">
                          Hero
                        </span>
                      )}

                      {/* Controls on hover / touch */}
                      <div className="absolute inset-0 bg-ink-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {!isHero && (
                          <button
                            type="button"
                            onClick={() => handleSetHero(idx)}
                            className="p-1.5 bg-warm-white/90 hover:bg-warm-white text-ink-black rounded-xs transition-colors"
                            title="Set as Hero image"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 bg-oxblood hover:bg-oxblood/80 text-warm-white rounded-xs transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
              Short Description / Editorial Hook
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Leather & Materials
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Care Instructions
              </label>
              <input
                type="text"
                value={care}
                onChange={(e) => setCare(e.target.value)}
                className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black min-h-[44px]"
              />
            </div>
          </div>

          {/* Catalog Visibility Toggle */}
          <div className="p-3 bg-bone border border-cocoa/20 rounded-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-ink-black">Storefront Visibility</div>
              <div className="text-[11px] text-muted-taupe">
                {hidden
                  ? 'Currently hidden from public storefront (Draft mode)'
                  : 'Published and actively visible to customers'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHidden(!hidden)}
              className={`px-3 py-1.5 rounded-xs font-bold text-xs uppercase tracking-wider border min-h-[38px] ${
                hidden
                  ? 'bg-gray-200 text-gray-800 border-gray-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}
            >
              {hidden ? 'Hidden' : 'Visible'}
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-3 border-t border-cocoa/15">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-espresso transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {isSaving ? 'Saving Product...' : isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
