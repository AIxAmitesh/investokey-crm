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
  const getStatusColor = (status: string) => {
    const statusObj = LEAD_STATUSES.find((s) => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              City, State
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Date
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {lead.firstName} {lead.lastName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{lead.phone}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {lead.city && lead.state ? `${lead.city}, ${lead.state}` : '-'}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                  {LEAD_STATUSES.find((s) => s.value === lead.status)?.label}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {lead.assignments.length > 0
                  ? lead.assignments.map((a) => a.user.name).join(', ')
                  : 'Unassigned'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => onDelete?.(lead.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {leads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No leads found</p>
        </div>
      )}
    </div>
  );
}