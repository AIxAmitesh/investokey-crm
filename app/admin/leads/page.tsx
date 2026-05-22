'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LeadsTable from '@/components/admin/LeadsTable';
import { LEAD_STATUSES } from '@/lib/constants';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  status: string;
  createdAt: string;
  assignments: Array<{
    user: { id: string; name: string; email: string };
  }>;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, page]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter !== 'ALL') query.append('status', statusFilter);
      query.append('page', page.toString());

      const response = await fetch(`/api/admin/leads?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setLeads(leads.filter((lead) => lead.id !== leadId));
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Leads</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/add-lead"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Lead
          </Link>
          <Link
            href="/admin/import-leads"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            📤 Import Leads
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Status:
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {LEAD_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                setStatusFilter(status.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === status.value
                  ? `${status.color}`
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading leads...</p>
            </div>
          </div>
        ) : (
          <>
            <LeadsTable leads={leads} onDelete={handleDelete} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 border-t px-6 py-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}