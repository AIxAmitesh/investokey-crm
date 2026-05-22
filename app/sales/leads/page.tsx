'use client';

import { useEffect, useState } from 'react';
import UpdateLeadModal from '@/components/UpdateLeadModal';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  property?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  budget?: string;
  status: string;
  source?: string;
  notes?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  pages: number;
}

export default function MyLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal states
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const statusOptions = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATING', 'CLOSED', 'LOST'];

  useEffect(() => {
    fetchLeads();
  }, [currentPage, selectedStatus]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...(selectedStatus !== 'ALL' && { status: selectedStatus }),
      });

      const response = await fetch(`/api/sales/leads?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data: LeadsResponse = await response.json();
      setLeads(data.leads);
      setTotalPages(data.pages);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      QUALIFIED: 'bg-purple-100 text-purple-800',
      NEGOTIATING: 'bg-orange-100 text-orange-800',
      CLOSED: 'bg-green-100 text-green-800',
      LOST: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleOpenUpdate = (lead: Lead) => {
    setSelectedLead(lead);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    fetchLeads(); // Refresh leads
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Section */}
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 bg-white border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Leads</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your assigned leads and follow-ups</p>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-6 bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="ALL">All Leads</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leads Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full sm:h-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading leads...</p>
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500 text-base sm:text-lg font-medium">No leads found</p>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Table Container - Responsive */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm">
                        Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                        Contact
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                        Property
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm">
                        Budget
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                        Follow-Up
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">
                          <div className="truncate">
                            {lead.firstName} {lead.lastName}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                          <div className="truncate">{lead.phone}</div>
                          {lead.email && (
                            <div className="text-xs text-gray-500 truncate">{lead.email}</div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                          {lead.property && (
                            <div>
                              <div className="truncate">{lead.property}</div>
                              {lead.city && (
                                <div className="text-xs text-gray-500 truncate">
                                  {lead.city}
                                  {lead.state && `, ${lead.state}`}
                                </div>
                              )}
                            </div>
                          )}
                          {!lead.property && <span className="text-gray-400">N/A</span>}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                          {lead.budget || 'N/A'}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm">
                          <span
                            className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(lead.nextFollowUp)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm">
                          <button
                            onClick={() => handleOpenUpdate(lead)}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs sm:text-sm text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Update Lead Modal */}
      {selectedLead && (
        <UpdateLeadModal
          isOpen={showUpdateModal}
          lead={selectedLead}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}