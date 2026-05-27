'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  useEffect(() => {
    fetchAllLeads();
  }, []);

  const fetchAllLeads = async () => {
    try {
      // Fetch all leads (without filters, no pagination)
      const response = await fetch('/api/sales/leads?page=1', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Get all leads from response (you may need to adjust based on your API)
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Count leads by status
  const getCounts = () => {
    return {
      total: leads.length,
      NEW: leads.filter((l) => l.status === 'NEW').length,
      INTERESTED: leads.filter((l) => l.status === 'INTERESTED').length,
      NOT_INTERESTED: leads.filter((l) => l.status === 'NOT INTERESTED').length,
      NOT_CONTACTED: leads.filter((l) => l.status === 'NOT CONTACTED').length,
      SITE_VISIT: leads.filter((l) => l.status === 'SITE VISIT').length,
      CLOSED: leads.filter((l) => l.status === 'CLOSED').length,
    };
  };

  const counts = getCounts();

  const statuses = [
    { key: 'NEW', label: 'New', icon: '📌', color: 'blue' },
    { key: 'INTERESTED', label: 'INTERESTED', icon: '📞', color: 'yellow' },
    { key: 'NOT INTERESTED', label: 'NOT INTERESTED', icon: '✓', color: 'purple' },
    { key: 'NOT CONTACTED', label: 'NOT CONTACTED', icon: '💬', color: 'orange' },
    { key: 'SITE VISIT', label: 'SITE VISIT', icon: '✅', color: 'green' },
    { key: 'CLOSED', label: 'CLOSED', icon: '❌', color: 'red' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      red: 'bg-red-50 border-red-200 text-red-900',
    };
    return colors[color];
  };

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
      <p className="text-gray-600 mb-8">Track your leads by status</p>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Total Leads Card */}
          <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Leads</p>
            <p className="text-4xl font-bold text-gray-900">{counts.total}</p>
            <p className="text-3xl mt-4">👥</p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statuses.map((status) => {
              const count = counts[status.key as keyof typeof counts];
              return (
                <Link
                  key={status.key}
                  href={`/sales/leads?status=${status.key}`}
                >
                  <div
                    className={`border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow ${getColorClasses(
                      status.color
                    )}`}
                  >
                    <p className="text-sm font-medium mb-2">{status.label}</p>
                    <p className="text-3xl font-bold">{count}</p>
                    <p className="text-2xl mt-3">{status.icon}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Welcome Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Welcome to Your Sales Dashboard
            </h2>
            <p className="text-blue-800">
              You have <strong>{counts.total} total leads</strong> assigned to you. Click on any status
              above to view and update your leads, or go to "My Leads" in the sidebar to see all leads
              with filtering options.
            </p>
          </div>
        </>
      )}
    </div>
  );
}