'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'lucide-react';
import { Order } from '@/types/commerce';
import { Subscriber } from '@/lib/subscribers';
import { supabase } from '@/lib/supabase';

const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1ZLbOPcCztTgtxmKmWLW_BB_utKxS7-DpePflxXerA1I/edit?gid=79417387#gid=79417387';

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
  total: 20000,
  paymentMethod: 'Direct Bank Transfer',
  paymentStatus: 'success',
};

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Active View Tab: 'orders' | 'customers' | 'subscribers'
  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'subscribers'>('orders');

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Offline Order Modal State
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offlineForm, setOfflineForm] = useState<OfflineOrderForm>(INITIAL_OFFLINE_FORM);
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false);
  const [offlineConfirmStep, setOfflineConfirmStep] = useState(false);

  // Status Change Confirmation Modal State
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: string;
    newStatus: Order['status'];
    currentStatus: Order['status'];
    orderName: string;
  } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Subscribers State
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersSearch, setSubscribersSearch] = useState('');
  const [copiedAllEmails, setCopiedAllEmails] = useState(false);

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
      const [ordersRes, subsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/newsletter'),
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
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();

      // Listen to Realtime database changes if Supabase credentials exist
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const channel = supabase
          .channel('admin-live-updates')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => {
              fetchAdminData();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'subscribers' },
            () => {
              fetchAdminData();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [isAuthenticated, fetchAdminData]);

  // Request Confirmation Before Status Change
  const requestStatusChange = (order: Order, newStatus: Order['status']) => {
    if (order.status === newStatus) return;
    setPendingStatusChange({
      orderId: order.id,
      newStatus,
      currentStatus: order.status,
      orderName: order.customer.fullName,
    });
  };

  // Execute Confirmed Status Change
  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    const { orderId, newStatus } = pendingStatusChange;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
      setPendingStatusChange(null);
    }
  };

  // Submit Offline / Manual Order
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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'pending' && (order.status === 'paid' || order.status === 'processing')) ||
        (filterStatus === 'shipped' && order.status === 'shipped') ||
        (filterStatus === 'delivered' && order.status === 'delivered') ||
        (filterStatus === 'cancelled' && order.status === 'cancelled') ||
        order.status === filterStatus;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        order.id.toLowerCase().includes(q) ||
        order.customer.fullName.toLowerCase().includes(q) ||
        order.customer.email.toLowerCase().includes(q) ||
        order.customer.phone.includes(searchQuery) ||
        order.customer.city.toLowerCase().includes(q) ||
        order.items.some((i) => i.product.name.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchQuery]);

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

  const generateCustomerWhatsAppUrl = (order: Order) => {
    const itemsList = order.items
      .map((i) => `${i.product.name} (Size ${i.selectedSize})`)
      .join(', ');
    const msg = encodeURIComponent(
      `Hello ${order.customer.fullName},\n\nThis is NOVEQ. We have confirmed your order *${order.id}* (${itemsList}).\n\nYour pair is currently being prepared for delivery to ${order.customer.city}.\n\nThank you for choosing NOVEQ.`
    );
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

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
              Please enter your access password to manage orders and client records.
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
                className="w-full px-4 py-3 text-sm bg-bone border border-cocoa/30 rounded-xs focus-dark font-mono text-ink-black"
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
              className="w-full py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px] shadow-sm"
            >
              Sign In to Console
            </button>
          </form>

          <div className="text-[11px] text-muted-taupe border-t border-cocoa/15 pt-4">
            NOVEQ Atelier Management · Nigeria
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone text-ink-black py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cocoa/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif italic text-cocoa">Store Operations</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-800">
              Live Cloud Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink-black uppercase font-serif">
            Operations & Order Ledger
          </h1>
          <p className="text-xs sm:text-sm text-muted-taupe mt-1">
            Track customer orders, log offline purchases, and manage subscribers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setOfflineForm(INITIAL_OFFLINE_FORM);
              setOfflineConfirmStep(false);
              setIsOfflineModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-espresso hover:bg-ink-black text-warm-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors focus-dark shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Offline Sale</span>
          </button>

          <button
            type="button"
            onClick={fetchAdminData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-bone transition-colors focus-dark"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Data</span>
          </button>

          <a
            href={GOOGLE_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-bone transition-colors focus-dark"
          >
            <span>Google Sheet</span>
            <ExternalLink className="w-3 h-3 text-cocoa" />
          </a>

          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-bone transition-colors focus-dark"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3 h-3 text-cocoa" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-warm-white border border-oxblood/30 text-oxblood text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-oxblood/10 transition-colors focus-dark"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            ₦{metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-taupe">Website + recorded offline sales</p>
        </div>

        {/* Total Orders */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Orders Received</span>
            <ShoppingBag className="w-4 h-4 text-espresso" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            {metrics.totalOrdersCount}
          </div>
          <p className="text-[11px] text-muted-taupe">Total client transactions</p>
        </div>

        {/* Pending Dispatch */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Awaiting Dispatch</span>
            <Clock className="w-4 h-4 text-oxblood" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight tabular-nums text-oxblood">
            {metrics.pendingFulfillmentsCount}
          </div>
          <p className="text-[11px] text-muted-taupe">Pairs waiting for rider pickup</p>
        </div>

        {/* Active Subscribers */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Active Subscribers</span>
            <Users className="w-4 h-4 text-cocoa" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            {subscribers.length}
          </div>
          <p className="text-[11px] text-muted-taupe">Linked live with Supabase</p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-cocoa/20">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-ink-black text-ink-black bg-warm-white/60'
              : 'border-transparent text-muted-taupe hover:text-ink-black'
          }`}
        >
          Orders Ledger ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          className={`px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold border-b-2 transition-colors ${
            activeTab === 'customers'
              ? 'border-ink-black text-ink-black bg-warm-white/60'
              : 'border-transparent text-muted-taupe hover:text-ink-black'
          }`}
        >
          Customer Directory ({uniqueCustomers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subscribers')}
          className={`px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold border-b-2 transition-colors ${
            activeTab === 'subscribers'
              ? 'border-ink-black text-ink-black bg-warm-white/60'
              : 'border-transparent text-muted-taupe hover:text-ink-black'
          }`}
        >
          Email Subscribers ({subscribers.length})
        </button>
      </div>

      {/* TAB 1: ORDERS LEDGER */}
      {activeTab === 'orders' && (
        <div className="bg-warm-white border border-cocoa/20 rounded-xs overflow-hidden shadow-xs space-y-4 p-6">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
            <div>
              <h2 className="text-xl font-bold text-ink-black">Orders & Dispatch Register</h2>
              <p className="text-xs text-muted-taupe mt-0.5">
                Every verified website order and manual offline sale. Changes sync to Google Sheets and notify Telegram.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-cocoa" />
                <input
                  type="text"
                  placeholder="Search order ID, name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-bone border border-cocoa/30 rounded-xs focus-dark text-ink-black font-medium"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-bone p-1 border border-cocoa/20 rounded-xs w-full sm:w-auto overflow-x-auto">
                {[
                  { id: 'all', label: `All (${orders.length})` },
                  {
                    id: 'pending',
                    label: `Awaiting Dispatch (${
                      orders.filter((o) => o.status === 'paid' || o.status === 'processing').length
                    })`,
                  },
                  {
                    id: 'shipped',
                    label: `In Transit (${orders.filter((o) => o.status === 'shipped').length})`,
                  },
                  {
                    id: 'delivered',
                    label: `Delivered (${orders.filter((o) => o.status === 'delivered').length})`,
                  },
                  {
                    id: 'cancelled',
                    label: `Cancelled (${orders.filter((o) => o.status === 'cancelled').length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterStatus(tab.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xs whitespace-nowrap transition-colors ${
                      filterStatus === tab.id
                        ? 'bg-ink-black text-warm-white shadow-xs'
                        : 'text-cocoa hover:text-ink-black hover:bg-warm-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-taupe flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 text-espresso animate-spin" />
              <span>Loading orders from database...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-taupe space-y-2">
              <p className="font-semibold text-ink-black text-sm">No orders found</p>
              <p>
                When customers purchase online or you log an offline transaction, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/50">
                    <th className="p-3">Order ID & Date</th>
                    <th className="p-3">Customer Info</th>
                    <th className="p-3">Items & Color</th>
                    <th className="p-3">Delivery Destination</th>
                    <th className="p-3">Total (NGN)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cocoa/15">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-bone/40 transition-colors">
                      {/* Order ID */}
                      <td className="p-3 align-top font-mono">
                        <div className="font-bold text-ink-black flex items-center gap-1">
                          <span>{order.id}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(order.id, order.id)}
                            className="text-cocoa hover:text-ink-black p-0.5"
                            title="Copy Order ID"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-muted-taupe mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-NG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <span
                          className={`inline-block mt-1 text-[9px] uppercase px-1.5 py-0.5 rounded-xs font-semibold ${
                            order.id.startsWith('NOV-OFF')
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {order.id.startsWith('NOV-OFF') ? 'Offline Sale' : order.payment.provider}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-3 align-top">
                        <div className="font-bold text-ink-black">{order.customer.fullName}</div>
                        <div className="text-muted-taupe font-mono text-[11px]">{order.customer.phone}</div>
                        <div className="text-[10px] text-muted-taupe truncate max-w-[150px]">
                          {order.customer.email.includes('@client.noveq') ? (
                            <span className="italic text-muted-taupe">Offline Client</span>
                          ) : (
                            order.customer.email
                          )}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-3 align-top">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="space-y-0.5 mb-1.5 last:mb-0">
                            <div className="font-semibold text-ink-black">
                              {item.product.name}
                            </div>
                            <div className="text-[11px] text-espresso font-mono">
                              Color: <span className="font-bold">{item.selectedColour || item.product.colour}</span> · Size: <span className="font-bold">{item.selectedSize}</span> · Qty: {item.quantity}
                            </div>
                          </div>
                        ))}
                      </td>

                      {/* Destination */}
                      <td className="p-3 align-top max-w-[180px]">
                        <div className="text-ink-black font-semibold">
                          {order.customer.city}, {order.customer.state}
                        </div>
                        <div className="text-[11px] text-muted-taupe line-clamp-2 mt-0.5">
                          {order.customer.address}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="p-3 align-top font-mono font-bold text-ink-black text-sm tabular-nums">
                        ₦{order.total.toLocaleString()}
                      </td>

                      {/* Status Dropdown with Confirmation Trigger */}
                      <td className="p-3 align-top">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            requestStatusChange(order, e.target.value as Order['status'])
                          }
                          className={`text-[10px] font-bold px-2 py-1 rounded-xs border uppercase tracking-wider focus-dark cursor-pointer ${
                            order.status === 'paid'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : order.status === 'shipped'
                              ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                              : order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          <option value="paid">Awaiting Dispatch</option>
                          <option value="processing">In Processing</option>
                          <option value="shipped">In Transit (Dispatched)</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3 align-top space-y-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bone hover:bg-warm-white border border-cocoa/30 text-ink-black text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors focus-dark w-full justify-center"
                        >
                          <Eye className="w-3 h-3 text-espresso" />
                          <span>View Details</span>
                        </button>

                        <a
                          href={generateCustomerWhatsAppUrl(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors focus-dark w-full justify-center shadow-xs"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp Client</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(generateWaybillText(order), `waybill-${order.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-white border border-cocoa/30 hover:bg-bone text-ink-black text-[9px] font-semibold rounded-xs transition-colors focus-dark w-full justify-center"
                        >
                          <FileText className="w-3 h-3 text-cocoa" />
                          <span>{copiedId === `waybill-${order.id}` ? 'Waybill Copied!' : 'Copy Waybill'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CUSTOMER DIRECTORY (CRM) */}
      {activeTab === 'customers' && (
        <div className="bg-warm-white border border-cocoa/20 rounded-xs overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
            <div>
              <h2 className="text-xl font-bold text-ink-black">Client Directory</h2>
              <p className="text-xs text-muted-taupe mt-0.5">
                Profiles of patrons who have ordered footwear from NOVEQ.
              </p>
            </div>
            <div className="text-xs text-cocoa font-medium">
              <span>Total Unique Patrons: </span>
              <span className="font-bold text-ink-black font-mono">{uniqueCustomers.length}</span>
            </div>
          </div>

          {uniqueCustomers.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-taupe space-y-2">
              <Users className="w-8 h-8 text-cocoa/40 mx-auto" />
              <p className="font-semibold text-ink-black text-sm">No customers recorded yet</p>
              <p>Customer profiles will aggregate automatically as orders are placed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/50">
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
                      <td className="p-3 font-bold text-ink-black">
                        {cust.fullName}
                      </td>
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
                            `Hello ${cust.fullName}, this is the NOVEQ atelier team. Thank you for walking with us.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors"
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

      {/* TAB 3: EMAIL SUBSCRIBERS */}
      {activeTab === 'subscribers' && (
        <div className="bg-warm-white border border-cocoa/20 rounded-xs overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
            <div>
              <h2 className="text-xl font-bold text-ink-black">Email Subscribers</h2>
              <p className="text-xs text-muted-taupe mt-0.5">
                Visitors who opted in or checked out on the website. Linked in real-time with Supabase.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-cocoa" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={subscribersSearch}
                  onChange={(e) => setSubscribersSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-bone border border-cocoa/30 rounded-xs focus-dark text-ink-black font-medium"
                />
              </div>

              <button
                type="button"
                onClick={copyAllSubscribers}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-espresso transition-colors"
              >
                {copiedAllEmails ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied {subscribers.length} Emails!</span>
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
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cocoa" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {filteredSubscribers.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-taupe space-y-2">
              <Mail className="w-8 h-8 text-cocoa/40 mx-auto" />
              <p className="font-semibold text-ink-black text-sm">No subscribers found</p>
              <p>Visitors who subscribe on the site will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/50">
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
                      <td className="p-3 font-mono font-semibold text-ink-black">
                        {sub.email}
                      </td>
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
                        <button
                          type="button"
                          onClick={() => copyToClipboard(sub.email, sub.id)}
                          className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-espresso hover:underline"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RECORD OFFLINE SALE MODAL */}
      {isOfflineModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-warm-white border border-cocoa/30 max-w-lg w-full rounded-xs shadow-2xl overflow-hidden my-8">
            <div className="p-5 border-b border-cocoa/20 bg-bone flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-espresso">
                  Manual Entry
                </span>
                <h3 className="text-lg font-bold text-ink-black">Record Offline Sale</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOfflineModalOpen(false)}
                className="p-1 hover:bg-cocoa/10 rounded-full"
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
                    <span>₦{offlineForm.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-cocoa">
                    <span>Payment Method:</span>
                    <span>{offlineForm.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOfflineConfirmStep(false)}
                    className="flex-1 py-3 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingOffline}
                    onClick={handleCreateOfflineOrder}
                    className="flex-1 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-espresso transition-colors disabled:opacity-50"
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
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium"
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
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium font-mono"
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
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium"
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
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium"
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
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium"
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
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium"
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
                      onChange={(e) =>
                        setOfflineForm({ ...offlineForm, productName: e.target.value })
                      }
                      className="w-full px-2 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium"
                    >
                      <option value="The Ring Slide Pam">The Ring Slide Pam</option>
                      <option value="The Weave Slide Pam">The Weave Slide Pam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                      Color
                    </label>
                    <select
                      value={offlineForm.colour}
                      onChange={(e) => setOfflineForm({ ...offlineForm, colour: e.target.value })}
                      className="w-full px-2 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium"
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
                      className="w-full px-2 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium"
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
                        const qty = Number(e.target.value);
                        setOfflineForm({
                          ...offlineForm,
                          quantity: qty,
                          total: qty * 20000,
                        });
                      }}
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium font-mono"
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
                      className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium font-mono"
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
                      className="w-full px-2 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium"
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
                    className="w-full px-3 py-2 bg-bone border border-cocoa/30 rounded-xs text-ink-black font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-cocoa/15">
                  <button
                    type="button"
                    onClick={() => setIsOfflineModalOpen(false)}
                    className="flex-1 py-3 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-espresso transition-colors shadow-xs"
                  >
                    Review & Confirm
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CRITICAL ACTION CONFIRMATION MODAL (STATUS CHANGE) */}
      {pendingStatusChange && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-warm-white border border-cocoa/30 max-w-md w-full rounded-xs shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-oxblood">
              <div className="w-10 h-10 rounded-full bg-oxblood/10 border border-oxblood/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-oxblood" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink-black">Confirm Status Change</h3>
                <p className="text-xs text-muted-taupe">Please review before updating.</p>
              </div>
            </div>

            <p className="text-xs text-ink-black/85 leading-relaxed">
              Are you sure you want to change order <span className="font-mono font-bold">{pendingStatusChange.orderId}</span> ({pendingStatusChange.orderName}) from{' '}
              <span className="font-bold uppercase text-cocoa">{pendingStatusChange.currentStatus}</span> to{' '}
              <span className="font-bold uppercase text-ink-black">{pendingStatusChange.newStatus}</span>?
            </p>

            {pendingStatusChange.newStatus === 'shipped' && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xs flex items-center gap-2">
                <Truck className="w-4 h-4 shrink-0 text-blue-700" />
                <span>This records the dispatch timestamp and marks the pair as en route.</span>
              </div>
            )}

            {pendingStatusChange.newStatus === 'cancelled' && (
              <div className="p-3 bg-oxblood/10 border border-oxblood/20 text-oxblood text-xs rounded-xs">
                Warning: This marks the order as cancelled and excludes it from active fulfillment.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                className="flex-1 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-bone transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={confirmStatusChange}
                className="flex-1 py-2.5 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-espresso transition-colors disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Updating...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAIL MODAL DRAWER WITH DISPATCH WAYBILL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-warm-white border border-cocoa/30 max-w-xl w-full rounded-xs shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-cocoa/20 bg-bone flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-espresso">
                  Order Details
                </span>
                <h3 className="text-xl font-bold font-mono text-ink-black">
                  {selectedOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-cocoa/10 rounded-full text-ink-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Customer Box */}
              <div className="p-4 bg-bone/60 border border-cocoa/20 rounded-xs space-y-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-cocoa">
                  Customer & Delivery Information
                </div>
                <div className="text-sm font-bold text-ink-black">{selectedOrder.customer.fullName}</div>
                <div className="font-mono text-espresso">{selectedOrder.customer.phone}</div>
                <div className="text-muted-taupe">{selectedOrder.customer.email}</div>
                <div className="text-ink-black pt-1 font-medium">
                  {selectedOrder.customer.address}, {selectedOrder.customer.city}, {selectedOrder.customer.state}
                </div>
                {selectedOrder.customer.deliveryNotes && (
                  <div className="pt-2 text-cocoa italic">
                    Note: “{selectedOrder.customer.deliveryNotes}”
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-wider font-bold text-cocoa">
                  Footwear Ordered ({selectedOrder.items.length})
                </div>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-bone/30 border border-cocoa/15 rounded-xs">
                    <div className="relative w-12 h-12 bg-bone border border-cocoa/20 shrink-0 overflow-hidden">
                      <Image
                        src={item.product.images[0]?.src || '/images/products/the-ring-burgundy.jpg'}
                        alt={item.product.name}
                        fill
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

              {/* Financial Breakdown */}
              <div className="p-4 bg-bone/50 border border-cocoa/20 rounded-xs space-y-2 font-mono">
                <div className="flex justify-between text-muted-taupe">
                  <span>Subtotal</span>
                  <span>₦{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-taupe">
                  <span>Delivery Fee</span>
                  <span>Pay rider on delivery</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-ink-black pt-2 border-t border-cocoa/20">
                  <span>Total Amount</span>
                  <span>₦{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Waybill & WhatsApp Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(generateWaybillText(selectedOrder), `modal-waybill-${selectedOrder.id}`)
                  }
                  className="py-3 px-4 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-bold rounded-xs hover:bg-bone transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4 text-cocoa" />
                  <span>
                    {copiedId === `modal-waybill-${selectedOrder.id}` ? 'Waybill Copied!' : 'Copy Dispatch Waybill'}
                  </span>
                </button>

                <a
                  href={generateCustomerWhatsAppUrl(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-xs uppercase tracking-wider font-bold rounded-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-cocoa/20 bg-bone flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-espresso transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
