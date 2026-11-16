'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  ExternalLink,
  RefreshCw,
  LogOut,
  TrendingUp,
  Users,
  Mail,
  PlusCircle,
  Package,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { Order, Product } from '@/types/commerce';
import { Subscriber } from '@/lib/subscribers';
import { supabase } from '@/lib/supabase';
import { resizeImageToWebP } from '@/lib/imageResize';
import { GOOGLE_SHEETS_CONFIG } from '@/config/siteSettings';
import {
  AdminTab,
  SheetsSubTab,
  SubscriberSegment,
  OfflineOrderForm,
  INITIAL_OFFLINE_FORM,
  CustomerSummary,
} from '@/components/Admin/adminUtils';
import { AdminAuthGate } from '@/components/Admin/AdminAuthGate';
import { AdminCampaignCommandBar } from '@/components/Admin/AdminCampaignCommandBar';
import { AdminOrdersTab } from '@/components/Admin/AdminOrdersTab';
import { AdminProductsTab } from '@/components/Admin/AdminProductsTab';
import { AdminMetricsTab } from '@/components/Admin/AdminMetricsTab';
import { AdminClientsTab } from '@/components/Admin/AdminClientsTab';
import { AdminSubscribersTab } from '@/components/Admin/AdminSubscribersTab';
import { AdminSheetsTab } from '@/components/Admin/AdminSheetsTab';
import { AdminQuickStockModal } from '@/components/Admin/AdminQuickStockModal';
import { AdminProductFormModal } from '@/components/Admin/AdminProductFormModal';
import { AdminOfflineOrderModal } from '@/components/Admin/AdminOfflineOrderModal';
import { AdminOrderDetailModal } from '@/components/Admin/AdminOrderDetailModal';
import { AdminConfirmModal } from '@/components/Admin/AdminConfirmModal';

const GOOGLE_SHEET_URL = GOOGLE_SHEETS_CONFIG.tabs.orders.url;

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Navigation Tabs & Filter Segments
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [subscriberSegment, setSubscriberSegment] =
    useState<SubscriberSegment>('all');

  // Google Sheets Hub State
  const [sheetsSubTab, setSheetsSubTab] = useState<SheetsSubTab>('orders');
  const [webhookStatus, setWebhookStatus] = useState<
    'idle' | 'testing' | 'healthy' | 'error'
  >('idle');
  const [webhookMessage, setWebhookMessage] = useState<string>('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncSummary, setSyncSummary] = useState<{
    total: number;
    succeeded: number;
    failed: number;
  } | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [orderSyncFeedback, setOrderSyncFeedback] = useState<
    Record<string, { success: boolean; message: string }>
  >({});
  const [iframeKey, setIframeKey] = useState<number>(1);
  const customWebhookUrl = GOOGLE_SHEETS_CONFIG.defaultWebhookUrl;

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
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(
    null
  );
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [statusSaveFeedback, setStatusSaveFeedback] = useState<
    Record<string, string>
  >({});

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(
    null
  );
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Offline Order Modal State
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offlineForm, setOfflineForm] =
    useState<OfflineOrderForm>(INITIAL_OFFLINE_FORM);
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false);
  const [offlineConfirmStep, setOfflineConfirmStep] = useState(false);

  // Subscribers State
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersSearch, setSubscribersSearch] = useState('');
  const [copiedAllEmails, setCopiedAllEmails] = useState(false);

  // Delete Confirmation States
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [subscriberToDelete, setSubscriberToDelete] =
    useState<Subscriber | null>(null);
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
    if (!isAuthenticated) return;
    fetchAdminData();

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
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
  }, [isAuthenticated, fetchAdminData]);

  // Order Status Update (Optimistic)
  const handleInstantStatusChange = async (
    orderId: string,
    newStatus: Order['status']
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrderModal?.id === orderId) {
      setSelectedOrderModal((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    }

    setSavingStatusId(orderId);
    setStatusSaveFeedback((prev) => ({ ...prev, [orderId]: 'Saved' }));

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Server error');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Instant status save error:', err);
      setStatusSaveFeedback((prev) => ({ ...prev, [orderId]: 'Save failed' }));
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

  // Deletion Handlers
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/orders?orderId=${encodeURIComponent(orderToDelete.id)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
        setMetrics((prev) => ({
          ...prev,
          totalOrdersCount: Math.max(0, prev.totalOrdersCount - 1),
          totalRevenue: Math.max(
            0,
            prev.totalRevenue -
              (orderToDelete.payment.status === 'success'
                ? orderToDelete.total
                : 0)
          ),
        }));
        if (selectedOrderModal?.id === orderToDelete.id) {
          setSelectedOrderModal(null);
        }
        setOrderToDelete(null);
      } else {
        alert(data.error || 'Could not remove order.');
      }
    } catch {
      alert('Network issue while removing order.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/newsletter?email=${encodeURIComponent(subscriberToDelete.email)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setSubscribers((prev) =>
          prev.filter(
            (s) =>
              s.email.toLowerCase() !== subscriberToDelete.email.toLowerCase()
          )
        );
        setSubscriberToDelete(null);
      } else {
        alert(data.error || 'Could not remove contact.');
      }
    } catch {
      alert('Network issue while removing contact.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/products?slug=${encodeURIComponent(productToDelete.slug)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.filter((p) => p.slug !== productToDelete.slug)
        );
        setProductToDelete(null);
      } else {
        alert(data.error || 'Could not remove style.');
      }
    } catch {
      alert('Network issue while removing style.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Product Toggles & Mutations
  const handleToggleProductVisibility = async (
    slug: string,
    currentHidden?: boolean
  ) => {
    const nextHidden = !currentHidden;
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
    } catch {
      fetchProducts();
    }
  };

  const handleToggleProductRestocking = async (
    slug: string,
    currentRestocking?: boolean
  ) => {
    const nextRestocking = !currentRestocking;
    setProducts((prev) =>
      prev.map((p) =>
        p.slug === slug ? { ...p, restocking: nextRestocking } : p
      )
    );

    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'toggle-restocking',
          restocking: nextRestocking,
        }),
      });
    } catch {
      fetchProducts();
    }
  };

  const handleImageFileSelect = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    setIsUploadingImage(true);
    setUploadFeedback('Resizing photo...');

    let fileToUpload: File = file;
    try {
      try {
        fileToUpload = await resizeImageToWebP(file, {
          maxDimension: 1200,
          quality: 0.85,
        });
      } catch {
        fileToUpload = file;
      }

      const kbSize = Math.round(fileToUpload.size / 1024);
      setUploadFeedback(`Uploading ${kbSize} KB image...`);

      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errMsg = `Upload failed (${res.status})`;
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.success && data.url) {
        onSuccess(data.url);
        setUploadFeedback('Photo saved.');
        setTimeout(() => setUploadFeedback(null), 3500);
      } else {
        throw new Error(data.error || 'Server could not save photo.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadFeedback(`Error: ${msg}`);

      if (fileToUpload && fileToUpload.size < 400 * 1024) {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              onSuccess(reader.result);
              setUploadFeedback('Attached compressed image.');
              setTimeout(() => setUploadFeedback(null), 3500);
            }
          };
          reader.readAsDataURL(fileToUpload);
          return;
        } catch {
          // ignore
        }
      }
      alert(`Could not upload image: ${msg}. You can also paste an image link directly.`);
    } finally {
      setIsUploadingImage(false);
    }
  };

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
        alert(data.error || 'Could not update stock.');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Stock update error:', err);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleSaveFullProduct = async (
    productData: Partial<Product>,
    isNew = false
  ) => {
    setIsSavingProduct(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isNew ? productData : { slug: productData.slug, updates: productData }
        ),
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
        alert(data.error || 'Could not save style.');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Product save error:', err);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const openOfflineModal = () => {
    const activeDefault =
      products.find((p) => !p.restocking && !p.hidden) || products[0];
    setOfflineForm({
      ...INITIAL_OFFLINE_FORM,
      productName: activeDefault?.name || INITIAL_OFFLINE_FORM.productName,
      colour:
        activeDefault?.colours?.[0]?.name ||
        activeDefault?.colour ||
        INITIAL_OFFLINE_FORM.colour,
      total: activeDefault?.price || INITIAL_OFFLINE_FORM.total,
    });
    setOfflineConfirmStep(false);
    setIsOfflineModalOpen(true);
  };

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
      } else {
        alert(data.error || 'Could not save offline order.');
      }
    } catch {
      alert('Network interruption while saving order.');
    } finally {
      setIsSubmittingOffline(false);
    }
  };

  // Clipboard & CSV Export
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyFilteredEmails = (list: Subscriber[]) => {
    const emails = list.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedAllEmails(true);
    setTimeout(() => setCopiedAllEmails(false), 2500);
  };

  const exportFilteredCSV = (list: Subscriber[], segmentLabel: string) => {
    const headers = 'Email,Name,Source,SubscribedAt,Tags\n';
    const rows = list
      .map(
        (s) =>
          `"${s.email}","${s.name || ''}","${s.source}","${s.subscribedAt}","${(
            s.tags || []
          ).join(';')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `noveq-${segmentLabel}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Google Sheets Sync Handlers
  const testWebhook = async () => {
    setWebhookStatus('testing');
    setWebhookMessage('Checking Google Sheet webhook connection...');
    try {
      const res = await fetch(
        `/api/admin/sheets?webhookUrl=${encodeURIComponent(customWebhookUrl)}`
      );
      const data = await res.json();
      if (data.success) {
        setWebhookStatus('healthy');
        setWebhookMessage(
          data.message || 'Webhook is live and responding cleanly.'
        );
      } else {
        setWebhookStatus('error');
        setWebhookMessage(
          data.message || data.error || 'Webhook returned an error.'
        );
      }
    } catch (err: unknown) {
      setWebhookStatus('error');
      const msg = err instanceof Error ? err.message : String(err);
      setWebhookMessage(`Connection failed: ${msg}`);
    }
  };

  const handleSyncOrder = async (orderId: string) => {
    setSyncingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_order',
          orderId,
          webhookUrl: customWebhookUrl,
        }),
      });
      const data = await res.json();
      setOrderSyncFeedback((prev) => ({
        ...prev,
        [orderId]: {
          success: data.success,
          message: data.message || (data.success ? 'Synced' : 'Failed'),
        },
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setOrderSyncFeedback((prev) => ({
        ...prev,
        [orderId]: { success: false, message: msg },
      }));
    } finally {
      setSyncingOrderId(null);
    }
  };

  const handleSyncAllOrders = async () => {
    setIsSyncingAll(true);
    setSyncSummary(null);
    try {
      const res = await fetch('/api/admin/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_all',
          webhookUrl: customWebhookUrl,
        }),
      });
      const data = await res.json();
      if (data.results) {
        const newFeedback: Record<
          string,
          { success: boolean; message: string }
        > = {};
        data.results.forEach(
          (r: { orderId: string; success: boolean; message: string }) => {
            newFeedback[r.orderId] = { success: r.success, message: r.message };
          }
        );
        setOrderSyncFeedback((prev) => ({ ...prev, ...newFeedback }));
        setSyncSummary({
          total: data.total,
          succeeded: data.succeeded,
          failed: data.failed,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync all failed';
      setWebhookMessage(msg);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Derived View Data
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      let matchesStatus = true;
      if (filterStatus === 'sourcing') {
        matchesStatus =
          order.status === 'sourcing' || order.status === 'processing';
      } else if (filterStatus === 'out for delivery') {
        matchesStatus =
          order.status === 'out for delivery' || order.status === 'shipped';
      } else if (filterStatus !== 'all') {
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

  const statusCounts = useMemo(
    () => ({
      all: orders.length,
      paid: orders.filter((o) => o.status === 'paid').length,
      sourcing: orders.filter(
        (o) => o.status === 'sourcing' || o.status === 'processing'
      ).length,
      outForDelivery: orders.filter(
        (o) => o.status === 'out for delivery' || o.status === 'shipped'
      ).length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }),
    [orders]
  );

  const uniqueCustomers = useMemo<CustomerSummary[]>(() => {
    const map = new Map<string, CustomerSummary>();
    for (const order of orders) {
      const key = (order.customer.email || order.customer.phone)
        .toLowerCase()
        .trim();
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

  const totalPairsSold = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled')
        .reduce(
          (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
          0
        ),
    [orders]
  );

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <RefreshCw className="w-5 h-5 text-espresso animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminAuthGate
        passwordInput={passwordInput}
        authError={authError}
        onPasswordChange={setPasswordInput}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bone text-ink-black py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cocoa/15 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-cocoa font-semibold">
              Lagos Studio Operations
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-800">
              Live Sync
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-ink-black mt-1">
            Store &amp; Order Command
          </h1>
          <p className="text-xs text-muted-taupe mt-0.5">
            Track orders, toggle restocking styles, manage EU 34–44 stock, and prepare for November 27.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={openOfflineModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink-black hover:bg-espresso text-warm-white text-xs uppercase tracking-[0.16em] font-semibold rounded-full transition-colors focus-dark shadow-xs min-h-[42px] cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Offline Sale</span>
          </button>

          <button
            type="button"
            onClick={fetchAdminData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-bone transition-colors min-h-[42px] cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>

          <a
            href={GOOGLE_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-bone transition-colors min-h-[42px]"
          >
            <span>Sheet</span>
            <ExternalLink className="w-3 h-3 text-cocoa" />
          </a>

          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-bone transition-colors min-h-[42px]"
          >
            <span>Storefront</span>
            <ExternalLink className="w-3 h-3 text-cocoa" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-warm-white border border-oxblood/30 text-oxblood text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-oxblood/10 transition-colors min-h-[42px] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Nov 27 & Waitlist Command Bar */}
      <AdminCampaignCommandBar
        products={products}
        subscribers={subscribers}
        onJumpToTab={(tab, seg) => {
          setActiveTab(tab);
          if (seg) setSubscriberSegment(seg);
        }}
      />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-warm-white border border-cocoa/20 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-cocoa font-semibold uppercase tracking-wider">
            <span>Gross Sales</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            ₦{metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-taupe">
            Online Paystack + offline sales
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-warm-white border border-cocoa/20 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-cocoa font-semibold uppercase tracking-wider">
            <span>Orders</span>
            <ShoppingBag className="w-3.5 h-3.5 text-espresso" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            {orders.length}
          </div>
          <p className="text-[11px] text-muted-taupe">Total recorded orders</p>
        </div>

        <div className="p-4 sm:p-5 bg-warm-white border border-cocoa/20 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-cocoa font-semibold uppercase tracking-wider">
            <span>In Progress</span>
            <Clock className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums text-amber-900">
            {statusCounts.paid +
              statusCounts.sourcing +
              statusCounts.outForDelivery}
          </div>
          <p className="text-[11px] text-muted-taupe">
            Paid, crafting, or with courier
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-warm-white border border-cocoa/20 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-cocoa font-semibold uppercase tracking-wider">
            <span>Pairs Sold</span>
            <Package className="w-3.5 h-3.5 text-cocoa" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            {totalPairsSold}
          </div>
          <p className="text-[11px] text-muted-taupe">
            Active footwear units ordered
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-cocoa/20 overflow-x-auto pb-px">
        {[
          {
            id: 'orders' as const,
            label: `Orders (${orders.length})`,
            icon: ShoppingBag,
          },
          {
            id: 'products' as const,
            label: `Catalog (${products.length})`,
            icon: Layers,
          },
          {
            id: 'dashboard' as const,
            label: 'Insights & Sizes',
            icon: TrendingUp,
          },
          {
            id: 'subscribers' as const,
            label: `Waitlists (${subscribers.length})`,
            icon: Mail,
          },
          {
            id: 'customers' as const,
            label: `Clients (${uniqueCustomers.length})`,
            icon: Users,
          },
          {
            id: 'sheets' as const,
            label: 'Sheets & Books',
            icon: FileSpreadsheet,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors whitespace-nowrap min-h-[44px] cursor-pointer ${
                isActive
                  ? 'border-ink-black text-ink-black bg-warm-white rounded-t-xl'
                  : 'border-transparent text-muted-taupe hover:text-ink-black'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Views */}
      {activeTab === 'orders' && (
        <AdminOrdersTab
          orders={orders}
          filteredOrders={filteredOrders}
          statusCounts={statusCounts}
          loading={loading}
          filterStatus={filterStatus}
          searchQuery={searchQuery}
          expandedOrderId={expandedOrderId}
          savingStatusId={savingStatusId}
          statusSaveFeedback={statusSaveFeedback}
          copiedId={copiedId}
          onFilterStatusChange={setFilterStatus}
          onSearchQueryChange={setSearchQuery}
          onToggleExpandOrder={setExpandedOrderId}
          onInstantStatusChange={handleInstantStatusChange}
          onCopy={copyToClipboard}
          onOpenOrderModal={setSelectedOrderModal}
          onRequestDeleteOrder={setOrderToDelete}
        />
      )}

      {activeTab === 'products' && (
        <AdminProductsTab
          products={products}
          productsLoading={productsLoading}
          onOpenAddModal={() => setIsAddProductOpen(true)}
          onToggleVisibility={handleToggleProductVisibility}
          onToggleRestocking={handleToggleProductRestocking}
          onOpenQuickStock={setQuickStockProduct}
          onOpenEditModal={setEditingProduct}
          onRequestDeleteProduct={setProductToDelete}
        />
      )}

      {activeTab === 'dashboard' && (
        <AdminMetricsTab
          orders={orders}
          products={products}
          statusCounts={statusCounts}
          onJumpToFilteredOrders={(status) => {
            setFilterStatus(status);
            setActiveTab('orders');
          }}
          onSwitchTab={setActiveTab}
        />
      )}

      {activeTab === 'subscribers' && (
        <AdminSubscribersTab
          subscribers={subscribers}
          searchQuery={subscribersSearch}
          segment={subscriberSegment}
          copiedId={copiedId}
          copiedAllEmails={copiedAllEmails}
          onSearchChange={setSubscribersSearch}
          onSegmentChange={setSubscriberSegment}
          onCopyEmail={copyToClipboard}
          onCopyFilteredEmails={copyFilteredEmails}
          onExportFilteredCSV={exportFilteredCSV}
          onRequestDeleteSubscriber={setSubscriberToDelete}
        />
      )}

      {activeTab === 'customers' && (
        <AdminClientsTab customers={uniqueCustomers} />
      )}

      {activeTab === 'sheets' && (
        <AdminSheetsTab
          orders={orders}
          sheetsSubTab={sheetsSubTab}
          webhookStatus={webhookStatus}
          webhookMessage={webhookMessage}
          isSyncingAll={isSyncingAll}
          syncSummary={syncSummary}
          syncingOrderId={syncingOrderId}
          orderSyncFeedback={orderSyncFeedback}
          iframeKey={iframeKey}
          onSubTabChange={setSheetsSubTab}
          onTestWebhook={testWebhook}
          onSyncAllOrders={handleSyncAllOrders}
          onSyncSingleOrder={handleSyncOrder}
          onReloadIframe={() => setIframeKey((p) => p + 1)}
          onDismissWebhook={() => setWebhookStatus('idle')}
          onDismissSyncSummary={() => setSyncSummary(null)}
        />
      )}

      {/* Modals */}
      {quickStockProduct && (
        <AdminQuickStockModal
          product={quickStockProduct}
          isSaving={isSavingProduct}
          onChangeProduct={setQuickStockProduct}
          onClose={() => setQuickStockProduct(null)}
          onSave={handleSaveQuickStock}
        />
      )}

      {(isAddProductOpen || editingProduct) && (
        <AdminProductFormModal
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

      {isOfflineModalOpen && (
        <AdminOfflineOrderModal
          products={products}
          form={offlineForm}
          confirmStep={offlineConfirmStep}
          isSubmitting={isSubmittingOffline}
          onChangeForm={setOfflineForm}
          onSetConfirmStep={setOfflineConfirmStep}
          onSubmit={handleCreateOfflineOrder}
          onClose={() => setIsOfflineModalOpen(false)}
        />
      )}

      {selectedOrderModal && (
        <AdminOrderDetailModal
          order={selectedOrderModal}
          copiedId={copiedId}
          onCopyWaybill={copyToClipboard}
          onRequestDelete={setOrderToDelete}
          onClose={() => setSelectedOrderModal(null)}
        />
      )}

      {orderToDelete && (
        <AdminConfirmModal
          title="Remove Order Record"
          subtitle="Permanent removal from studio ledger"
          details={[
            { label: 'Order Reference', value: orderToDelete.id },
            { label: 'Buyer', value: orderToDelete.customer.fullName },
            {
              label: 'Amount',
              value: `₦${orderToDelete.total.toLocaleString()}`,
            },
            { label: 'Status', value: orderToDelete.status },
          ]}
          warningText="Removing this order deletes it permanently from your database and cannot be undone."
          confirmLabel="Remove Order"
          cancelLabel="Keep Order"
          isBusy={isDeleting}
          onCancel={() => setOrderToDelete(null)}
          onConfirm={handleDeleteOrder}
        />
      )}

      {subscriberToDelete && (
        <AdminConfirmModal
          title="Remove Contact"
          subtitle="Delete contact from waitlists and subscriber records"
          details={[
            { label: 'Email', value: subscriberToDelete.email },
            ...(subscriberToDelete.name
              ? [{ label: 'Name', value: subscriberToDelete.name }]
              : []),
          ]}
          warningText="Are you sure you want to remove this contact from your subscriber list?"
          confirmLabel="Remove Contact"
          cancelLabel="Keep Contact"
          isBusy={isDeleting}
          onCancel={() => setSubscriberToDelete(null)}
          onConfirm={handleDeleteSubscriber}
        />
      )}

      {productToDelete && (
        <AdminConfirmModal
          title="Remove Footwear Style"
          subtitle="Remove style from catalog"
          details={[
            { label: 'Style', value: productToDelete.name },
            {
              label: 'Price',
              value: `₦${productToDelete.price.toLocaleString()}`,
            },
          ]}
          warningText="This permanently deletes the style. Tip: If you only want to pause orders, use Set Restocking or Hide instead."
          confirmLabel="Delete Style"
          cancelLabel="Keep Style"
          isBusy={isDeleting}
          onCancel={() => setProductToDelete(null)}
          onConfirm={handleDeleteProduct}
        />
      )}
    </div>
  );
}
