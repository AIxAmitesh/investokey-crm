'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LEAD_STATUSES } from '@/lib/constants';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
}

export default function SalesDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
    fetchAllLeads();
  }, []);

  const fetchAllLeads = async () => {
    try {
      const res = await fetch('/api/sales/leads?page=1&limit=1000', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const total = leads.length;
  const countByStatus = (key: string) => leads.filter((l) => l.status === key).length;
  const closedCount = countByStatus('CLOSED');
  const convRate = total ? Math.round((closedCount / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {userName ? `Hi, ${userName.split(' ')[0]}!` : 'My Dashboard'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Your lead pipeline overview</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Leads</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Closed</p>
          <p className="text-3xl sm:text-4xl font-bold text-green-600">{closedCount}</p>
          <p className="text-xs text-gray-400 mt-1">Rate: {convRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Follow-ups</p>
          <p className="text-3xl sm:text-4xl font-bold text-purple-600">
            {countByStatus('FOLLOW UP') + countByStatus('SITE VISIT')}
          </p>
        </div>
      </div>

      {/* Status Grid */}
      <div className="mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Leads by Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {LEAD_STATUSES.map((status) => {
            const count = countByStatus(status.value);
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <Link key={status.value} href={`/sales/leads?status=${encodeURIComponent(status.value)}`}>
                <div className={`border rounded-xl p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow ${status.color.replace('text-', 'border-').replace('bg-', 'bg-').split(' ')[0]} bg-white`}>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 truncate">{status.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-400 mt-1">{pct}%</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Action */}
      <Link href="/sales/leads">
        <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 sm:p-5 cursor-pointer transition-colors">
          <p className="text-base sm:text-lg font-semibold">View All My Leads</p>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">{total} leads assigned to you</p>
        </div>
      </Link>
    </div>
  );
}
