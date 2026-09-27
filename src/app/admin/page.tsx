'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Send,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Order } from '@/types/commerce';

export default function AdminDashboardPage() {
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

  const fetchAdminData = async () => {
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
    fetchAdminData();
  }, []);

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
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
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
      order.customer.phone.includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  const generateCustomerWhatsAppUrl = (order: Order) => {
    const itemsList = order.items
      .map((i) => `${i.product.name} (Size ${i.selectedSize})`)
      .join(', ');
    const msg = encodeURIComponent(
      `Hello ${order.customer.fullName},\n\nThis is NOVEQ Concierge. We have received and verified your Drop 001 order *${order.id}* for ${itemsList}.\n\nYour delivery to ${order.customer.city} is currently being prepared!\n\nThank you for choosing NOVEQ.`
    );
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  const generateCEOAlertUrl = (order: Order) => {
    const itemsList = order.items
      .map((i) => `${i.product.name} (${i.selectedSize})`)
      .join(', ');
    const msg = encodeURIComponent(
      `🚨 *NOVEQ ORDER ALERT*\n\nOrder: *${order.id}*\nCustomer: *${order.customer.fullName}*\nPhone: *${order.customer.phone}*\nItems: ${itemsList}\nTotal: ₦${order.total.toLocaleString()}\nAddress: ${order.customer.address}, ${order.customer.city}`
    );
    return `https://wa.me/2349038555997?text=${msg}`;
  };

  return (
    <div className="min-h-screen bg-bone text-ink-black py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Back-Office Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cocoa/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-espresso text-warm-white text-[10px] uppercase tracking-widest font-semibold rounded-xs mb-2">
            <span>Executive Command</span>
            <span>•</span>
            <span>Drop 001 Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-black">
            NOVEQ Executive Back-Office
          </h1>
          <p className="text-xs sm:text-sm text-muted-taupe mt-1">
            Real-time fulfillment, customer dispatch, and financial metrics overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAdminData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-bone transition-colors focus-dark"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-black text-warm-white text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-espresso transition-colors focus-dark"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-espresso" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-ink-black">
            ₦{metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-taupe">Drop 001 sales gross total</p>
        </div>

        {/* Total Orders */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-espresso" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-ink-black">
            {metrics.totalOrdersCount}
          </div>
          <p className="text-[11px] text-muted-taupe">Orders received to date</p>
        </div>

        {/* Pending Dispatch */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Pending Dispatch</span>
            <Clock className="w-4 h-4 text-oxblood" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-oxblood">
            {metrics.pendingFulfillmentsCount}
          </div>
          <p className="text-[11px] text-muted-taupe">Awaiting courier handover</p>
        </div>

        {/* CEO Direct Contact */}
        <div className="p-5 bg-warm-white border border-cocoa/20 rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-cocoa font-medium uppercase tracking-wider">
            <span>Concierge Line</span>
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-ink-black font-mono">
            +234 903 855 5997
          </div>
          <p className="text-[11px] text-muted-taupe">noveqthebrand@gmail.com</p>
        </div>
      </div>

      {/* Paystack Activation Guide Banner */}
      <div className="p-5 bg-espresso text-warm-white border border-cocoa/40 rounded-xs space-y-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-warm-white" />
          <h2 className="text-sm uppercase tracking-widest font-bold text-warm-white">
            Paystack Live Integration Setup Guide
          </h2>
        </div>
        <p className="text-xs text-muted-taupe-on-dark leading-relaxed">
          Your Paystack payment service is fully built and ready! To start receiving real payments directly into your bank account, copy your live API keys from your Paystack Dashboard and paste them into Vercel Environment Variables:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-ink-black/60 p-3 rounded-xs border border-cocoa/30">
          <div>
            <span className="text-muted-taupe-on-dark block text-[10px] uppercase font-sans">
              Public Key (Client side)
            </span>
            <span className="text-warm-white font-bold">NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</span>
          </div>
          <div>
            <span className="text-muted-taupe-on-dark block text-[10px] uppercase font-sans">
              Secret Key (Server side)
            </span>
            <span className="text-warm-white font-bold">PAYSTACK_SECRET_KEY</span>
          </div>
        </div>
      </div>

      {/* Orders Management Table Console */}
      <div className="bg-warm-white border border-cocoa/20 rounded-xs overflow-hidden shadow-xs space-y-4 p-6">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
          <div>
            <h2 className="text-xl font-bold text-ink-black">Orders Management</h2>
            <p className="text-xs text-muted-taupe">
              Manage fulfillment states and fire 1-click WhatsApp customer dispatches.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-cocoa" />
              <input
                type="text"
                placeholder="Search orders, names, phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-bone border border-cocoa/30 rounded-xs focus-dark text-ink-black"
              />
            </div>

            {/* Filter Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-cocoa shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto text-xs bg-bone border border-cocoa/30 px-3 py-2 rounded-xs focus-dark text-ink-black"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending Dispatch</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-muted-taupe">
            Loading order records...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-taupe">
            No orders matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/50">
                  <th className="p-3">Order ID & Date</th>
                  <th className="p-3">Customer Contact</th>
                  <th className="p-3">Items & Size</th>
                  <th className="p-3">Delivery Location</th>
                  <th className="p-3">Total (NGN)</th>
                  <th className="p-3">Fulfillment Status</th>
                  <th className="p-3">Quick Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cocoa/15">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-bone/40 transition-colors">
                    {/* Order ID & Date */}
                    <td className="p-3 align-top font-mono">
                      <div className="font-bold text-ink-black">{order.id}</div>
                      <div className="text-[10px] text-muted-taupe">
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

                    {/* Customer Contact */}
                    <td className="p-3 align-top">
                      <div className="font-bold text-ink-black">{order.customer.fullName}</div>
                      <div className="text-muted-taupe">{order.customer.phone}</div>
                      <div className="text-[10px] text-muted-taupe truncate max-w-[150px]">
                        {order.customer.email}
                      </div>
                    </td>

                    {/* Items & Size */}
                    <td className="p-3 align-top">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="font-medium text-ink-black">
                            {item.product.name}
                          </div>
                          <div className="text-[11px] text-espresso font-mono">
                            Size: <span className="font-bold">{item.selectedSize}</span> · Qty: {item.quantity}
                          </div>
                          {item.withHeartCharm && (
                            <div className="text-[10px] text-oxblood font-semibold">
                              Heart Charm: &quot;{item.engravedText || 'Standard'}&quot;
                            </div>
                          )}
                        </div>
                      ))}
                    </td>

                    {/* Delivery Location */}
                    <td className="p-3 align-top max-w-[200px]">
                      <div className="text-ink-black font-medium">{order.customer.city}, {order.customer.state}</div>
                      <div className="text-[11px] text-muted-taupe line-clamp-2">
                        {order.customer.address}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="p-3 align-top font-mono font-bold text-ink-black">
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
                        className={`text-[11px] font-semibold px-2 py-1 rounded-xs border uppercase tracking-wider focus-dark ${
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
                      <a
                        href={generateCustomerWhatsAppUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-[11px] font-semibold rounded-xs transition-colors focus-dark w-full justify-center"
                      >
                        <Send className="w-3 h-3" />
                        <span>WhatsApp Customer</span>
                      </a>

                      <a
                        href={generateCEOAlertUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-white border border-cocoa/30 hover:bg-bone text-ink-black text-[10px] font-semibold rounded-xs transition-colors focus-dark w-full justify-center"
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
    </div>
  );
}
