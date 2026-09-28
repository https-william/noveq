'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Send,
  Lock,
  Key,
  Copy,
  Check,
  Eye,
  X,
  LogOut,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { Order } from '@/types/commerce';

const ADMIN_PASSWORD = 'noveqthebrand!';

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Data & Dashboard State
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
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('noveq_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsAuthChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('noveq_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect executive access key. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('noveq_admin_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const fetchAdminData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setMetrics(data.metrics);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
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
      setUpdatingOrderId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && (order.status === 'paid' || order.status === 'processing')) ||
      order.status === filterStatus;

    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery) ||
      order.items.some((i) => i.product.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const generateCustomerWhatsAppUrl = (order: Order) => {
    const itemsList = order.items
      .map((i) => `${i.product.name} (Size ${i.selectedSize})`)
      .join(', ');
    const msg = encodeURIComponent(
      `Hello ${order.customer.fullName},\n\nThis is NOVEQ Concierge. We have confirmed your Drop 001 order *${order.id}* (${itemsList}).\n\nYour order is currently being prepared for dispatch to ${order.customer.city}.\n\nThank you for choosing NOVEQ.`
    );
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  const generateCEOAlertUrl = (order: Order) => {
    const itemsList = order.items
      .map((i) => `${i.product.name} (Size ${i.selectedSize})`)
      .join(', ');
    const msg = encodeURIComponent(
      `🚨 *NOVEQ DIRECT ORDER ALERT*\n\nOrder ID: *${order.id}*\nCustomer: *${order.customer.fullName}*\nPhone: *${order.customer.phone}*\nItems: ${itemsList}\nTotal: ₦${order.total.toLocaleString()}\nAddress: ${order.customer.address}, ${order.customer.city}, ${order.customer.state}`
    );
    return `https://wa.me/2349038555997?text=${msg}`;
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
            <h1 className="text-2xl font-bold tracking-tight text-ink-black uppercase">
              NOVEQ Executive Access
            </h1>
            <p className="text-xs text-muted-taupe">
              Restricted portal. Please enter your executive key to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label htmlFor="admin-pass" className="block text-[11px] uppercase tracking-wider font-semibold text-cocoa mb-1.5">
                Access Password
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
              className="w-full py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-espresso active:scale-[0.98] transition-all focus-dark shadow-xs"
            >
              Authenticate Portal
            </button>
          </form>

          <div className="pt-4 border-t border-cocoa/15 text-[11px] text-muted-taupe">
            NOVEQ Brand Operations · Executive Back-Office
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone text-ink-black py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Executive Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cocoa/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-espresso text-warm-white text-[10px] uppercase tracking-widest font-semibold rounded-xs mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Executive Command</span>
            <span>•</span>
            <span>Authenticated</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-black">
            NOVEQ Back-Office
          </h1>
          <p className="text-xs sm:text-sm text-muted-taupe mt-1">
            Real-time fulfillment, order dispatches, and sales performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAdminData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-bone transition-colors focus-dark active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-warm-white border border-oxblood/30 text-oxblood text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-oxblood/10 transition-colors focus-dark active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Portal</span>
          </button>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-black text-warm-white text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-espresso transition-colors focus-dark active:scale-[0.98]"
          >
            <span>Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs hover:border-cocoa/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Total Gross Sales</span>
            <DollarSign className="w-4 h-4 text-espresso" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            ₦{metrics.totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Drop 001 Launch Revenue</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs hover:border-cocoa/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-espresso" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight tabular-nums text-ink-black">
            {metrics.totalOrdersCount}
          </div>
          <p className="text-[11px] text-muted-taupe">Total transactions recorded</p>
        </div>

        {/* Pending Dispatch */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs hover:border-cocoa/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Awaiting Dispatch</span>
            <Clock className="w-4 h-4 text-oxblood" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight tabular-nums text-oxblood">
            {metrics.pendingFulfillmentsCount}
          </div>
          <p className="text-[11px] text-muted-taupe">Orders needing courier delivery</p>
        </div>

        {/* CEO Direct Contact Line */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs hover:border-cocoa/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Direct Concierge</span>
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold font-mono text-ink-black">
            +234 903 855 5997
          </div>
          <p className="text-[11px] text-muted-taupe">noveqthebrand@gmail.com</p>
        </div>
      </div>

      {/* Paystack Setup Helper */}
      <div className="p-5 bg-espresso text-warm-white border border-cocoa/40 rounded-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-300" />
            <h2 className="text-xs uppercase tracking-widest font-bold text-warm-white">
              Paystack Live Payment Gateway Integration
            </h2>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-mono tracking-wider rounded-xs">
            Ready for Live Keys
          </span>
        </div>
        <p className="text-xs text-muted-taupe-on-dark leading-relaxed">
          Paystack integration is active. Paste your Live API Keys into Vercel Environment Variables to receive payments straight into your bank account:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-ink-black/80 p-3 rounded-xs border border-cocoa/30">
          <div>
            <span className="text-muted-taupe-on-dark block text-[10px] uppercase font-sans">
              Client Public Key
            </span>
            <span className="text-warm-white font-bold">NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</span>
          </div>
          <div>
            <span className="text-muted-taupe-on-dark block text-[10px] uppercase font-sans">
              Server Secret Key
            </span>
            <span className="text-warm-white font-bold">PAYSTACK_SECRET_KEY</span>
          </div>
        </div>
      </div>

      {/* Orders Console Table */}
      <div className="bg-warm-white border border-cocoa/20 rounded-xs overflow-hidden shadow-xs space-y-4 p-6">
        {/* Table Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
          <div>
            <h2 className="text-xl font-bold text-ink-black">Orders & Customer Dispatch</h2>
            <p className="text-xs text-muted-taupe">
              Track status changes and trigger direct 1-click WhatsApp alerts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-cocoa" />
              <input
                type="text"
                placeholder="Search orders, names, phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-bone border border-cocoa/30 rounded-xs focus-dark text-ink-black font-medium"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-bone p-1 border border-cocoa/20 rounded-xs w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'all', label: `All (${orders.length})` },
                {
                  id: 'pending',
                  label: `Pending (${orders.filter((o) => o.status === 'paid' || o.status === 'processing').length})`,
                },
                { id: 'shipped', label: `Shipped (${orders.filter((o) => o.status === 'shipped').length})` },
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

        {/* Table Rendering */}
        {loading ? (
          <div className="py-12 text-center text-xs text-muted-taupe flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 text-espresso animate-spin" />
            <span>Fetching order records...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-taupe">
            No order records matching your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/50">
                  <th className="p-3">Order ID & Date</th>
                  <th className="p-3">Customer Info</th>
                  <th className="p-3">Footwear Items</th>
                  <th className="p-3">Delivery Address</th>
                  <th className="p-3">Total (NGN)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cocoa/15">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-bone/40 transition-colors">
                    {/* Order ID & Date */}
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
                      <span className="inline-block mt-1 text-[9px] uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs font-semibold">
                        {order.payment.provider}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="p-3 align-top">
                      <div className="font-bold text-ink-black">{order.customer.fullName}</div>
                      <div className="text-muted-taupe font-mono text-[11px]">{order.customer.phone}</div>
                      <div className="text-[10px] text-muted-taupe truncate max-w-[150px]">
                        {order.customer.email}
                      </div>
                    </td>

                    {/* Footwear Items */}
                    <td className="p-3 align-top">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5 mb-1.5 last:mb-0">
                          <div className="font-semibold text-ink-black">
                            {item.product.name}
                          </div>
                          <div className="text-[11px] text-espresso font-mono">
                            Size: <span className="font-bold">{item.selectedSize}</span> · Qty: {item.quantity}
                          </div>
                          {item.withHeartCharm && (
                            <div className="text-[10px] text-oxblood font-medium">
                              Heart Charm: &quot;{item.engravedText || 'Standard'}&quot;
                            </div>
                          )}
                        </div>
                      ))}
                    </td>

                    {/* Delivery Location */}
                    <td className="p-3 align-top max-w-[180px]">
                      <div className="text-ink-black font-semibold">{order.customer.city}, {order.customer.state}</div>
                      <div className="text-[11px] text-muted-taupe line-clamp-2 mt-0.5">
                        {order.customer.address}
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`${order.customer.address}, ${order.customer.city}, ${order.customer.state}`, `addr-${order.id}`)}
                        className="text-[10px] text-espresso hover:underline flex items-center gap-1 mt-1 font-medium"
                      >
                        {copiedId === `addr-${order.id}` ? (
                          <span className="text-emerald-700 font-bold">Address Copied!</span>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Total */}
                    <td className="p-3 align-top font-mono font-bold text-ink-black text-sm tabular-nums">
                      ₦{order.total.toLocaleString()}
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-3 align-top">
                      <select
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as Order['status'])
                        }
                        className={`text-[10px] font-bold px-2 py-1 rounded-xs border uppercase tracking-wider focus-dark cursor-pointer ${
                          order.status === 'paid'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : order.status === 'processing'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : order.status === 'shipped'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        <option value="paid">Paid / Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Dispatch Actions */}
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors focus-dark w-full justify-center shadow-xs active:scale-[0.98]"
                      >
                        <Send className="w-3 h-3" />
                        <span>WhatsApp Customer</span>
                      </a>

                      <a
                        href={generateCEOAlertUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-white border border-cocoa/30 hover:bg-bone text-ink-black text-[9px] font-semibold rounded-xs transition-colors focus-dark w-full justify-center"
                      >
                        <MessageCircle className="w-3 h-3 text-oxblood" />
                        <span>Alert CEO Phone</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-warm-white border border-cocoa/30 max-w-xl w-full rounded-xs shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-cocoa/20 bg-bone flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-espresso">
                  Order Breakdown
                </div>
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
                  Customer & Shipping Information
                </div>
                <div className="text-sm font-bold text-ink-black">{selectedOrder.customer.fullName}</div>
                <div className="font-mono text-espresso">{selectedOrder.customer.phone}</div>
                <div className="text-muted-taupe">{selectedOrder.customer.email}</div>
                <div className="text-ink-black pt-1 font-medium">
                  {selectedOrder.customer.address}, {selectedOrder.customer.city}, {selectedOrder.customer.state}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-wider font-bold text-cocoa">
                  Footwear Items ({selectedOrder.items.length})
                </div>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-bone/30 border border-cocoa/15 rounded-xs">
                    <div className="relative w-12 h-12 bg-bone border border-cocoa/20 shrink-0 overflow-hidden">
                      <Image
                        src={item.product.images[0].src}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink-black truncate">{item.product.name}</div>
                      <div className="text-muted-taupe font-mono">
                        Size: <span className="font-bold text-ink-black">{item.selectedSize}</span> · Qty: {item.quantity}
                      </div>
                      {item.withHeartCharm && (
                        <div className="text-[10px] text-oxblood font-semibold">
                          Engraved Text: &quot;{item.engravedText || 'Standard'}&quot;
                        </div>
                      )}
                    </div>
                    <div className="font-mono font-bold text-ink-black">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Summary */}
              <div className="p-4 bg-espresso/5 border border-espresso/20 rounded-xs space-y-1 text-right font-mono">
                <div className="flex justify-between text-muted-taupe text-[11px]">
                  <span>Payment Provider:</span>
                  <span className="uppercase font-bold text-ink-black">{selectedOrder.payment.provider}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-ink-black pt-1 border-t border-cocoa/15">
                  <span>Total Amount Paid:</span>
                  <span>₦{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-bone border-t border-cocoa/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-ink-black text-warm-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-espresso transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
