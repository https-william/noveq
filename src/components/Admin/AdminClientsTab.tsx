'use client';

import React, { useMemo, useState } from 'react';
import { Users, MessageCircle, Search } from 'lucide-react';
import { CustomerSummary, formatNigeriaWhatsAppPhone } from './adminUtils';

interface AdminClientsTabProps {
  customers: CustomerSummary[];
}

export function AdminClientsTab({ customers }: AdminClientsTabProps) {
  const [search, setSearch] = useState('');

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="bg-warm-white border border-cocoa/20 rounded-2xl shadow-apple-sm space-y-5 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
        <div>
          <h2 className="font-editorial text-2xl font-normal text-ink-black">
            Client Directory
          </h2>
          <p className="text-xs text-muted-taupe mt-0.5">
            Everyone who has ordered from NOVEQ, ordered by total spend ({customers.length} total).
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="w-4 h-4 absolute left-3.5 top-3 text-cocoa"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search client or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-bone/60 border border-cocoa/30 rounded-full focus:outline-none focus:border-ink-black text-ink-black font-medium min-h-[40px]"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-taupe space-y-2 border border-dashed border-cocoa/20 rounded-xl">
          <Users className="w-8 h-8 text-cocoa/40 mx-auto" />
          <p className="font-semibold text-ink-black text-sm">
            No matching clients
          </p>
          <p>Client profiles appear here automatically once orders arrive.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredCustomers.map((cust, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-cocoa/20 bg-bone/30 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm text-ink-black">
                      {cust.fullName}
                    </div>
                    <div className="text-[11px] text-muted-taupe">
                      {cust.city}, {cust.state} · {cust.orderCount} order
                      {cust.orderCount > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-ink-black text-sm tabular-nums">
                    ₦{cust.totalSpent.toLocaleString()}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-espresso truncate">
                  {cust.phone}
                  {!cust.email.includes('@client.noveq') && (
                    <span className="text-muted-taupe font-sans ml-2">
                      · {cust.email}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-cocoa/10">
                  <span className="text-[11px] text-muted-taupe">
                    Last order:{' '}
                    {new Date(cust.lastOrderDate).toLocaleDateString('en-GB')}
                  </span>
                  <a
                    href={`https://wa.me/${formatNigeriaWhatsAppPhone(cust.phone)}?text=${encodeURIComponent(
                      `Hello ${cust.fullName}, checking in from NOVEQ. Let us know if you need anything with your pairs.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-[11px] font-semibold rounded-full transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto border border-cocoa/15 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/60">
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">City</th>
                  <th className="p-3.5">Orders</th>
                  <th className="p-3.5">Total Spend</th>
                  <th className="p-3.5">Last Order</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cocoa/15">
                {filteredCustomers.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-bone/30 transition-colors">
                    <td className="p-3.5 font-semibold text-ink-black">
                      {cust.fullName}
                    </td>
                    <td className="p-3.5 font-mono">
                      <div>{cust.phone}</div>
                      {!cust.email.includes('@client.noveq') && (
                        <div className="text-[10px] text-muted-taupe font-sans">
                          {cust.email}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-ink-black">
                      {cust.city}, {cust.state}
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      <span className="px-2.5 py-0.5 bg-bone border border-cocoa/20 rounded-full">
                        {cust.orderCount}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-ink-black tabular-nums">
                      ₦{cust.totalSpent.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-muted-taupe font-mono text-[11px]">
                      {new Date(cust.lastOrderDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-3.5 text-right">
                      <a
                        href={`https://wa.me/${formatNigeriaWhatsAppPhone(cust.phone)}?text=${encodeURIComponent(
                          `Hello ${cust.fullName}, checking in from NOVEQ. Let us know if you need anything with your pairs.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-[10px] font-semibold uppercase tracking-wider rounded-full transition-colors min-h-[34px]"
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
        </>
      )}
    </div>
  );
}
