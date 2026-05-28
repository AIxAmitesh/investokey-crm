'use client';

import Link from 'next/link';
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

interface LeadsTableProps {
  leads: Lead[];
  onDelete?: (id: string) => void;
}

export default function LeadsTable({ leads, onDelete }: LeadsTableProps) {
  const getStatusStyle = (status: string) => {
    const s = LEAD_STATUSES.find((x) => x.value === status);
    return s?.color || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    return LEAD_STATUSES.find((x) => x.value === status)?.label || status;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

  if (leads.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">No leads found</p>
        <p className="text-gray-300 text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Location</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Assigned To</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 sm:px-6 py-4">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                  {lead.firstName} {lead.lastName}
                </p>
                {lead.email && (
                  <p className="text-xs text-gray-400 truncate max-w-[140px] hidden sm:block">{lead.email}</p>
                )}
              </td>
              <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{lead.phone}</td>
              <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                {lead.city && lead.state ? `${lead.city}, ${lead.state}` : lead.city || lead.state || '—'}
              </td>
              <td className="px-4 sm:px-6 py-4">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusStyle(lead.status)}`}>
                  {getStatusLabel(lead.status)}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
                {lead.assignments.length > 0
                  ? lead.assignments.map((a) => a.user.name).join(', ')
                  : <span className="text-gray-300">Unassigned</span>}
              </td>
              <td className="px-4 sm:px-6 py-4 text-xs text-gray-400 hidden lg:table-cell whitespace-nowrap">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-4 sm:px-6 py-4">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => onDelete?.(lead.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
