'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  role: 'admin' | 'sales';
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/leads', label: 'Leads', icon: '👥' },
  { href: '/admin/users', label: 'Users', icon: '👤' },
  { href: '/admin/add-lead', label: 'Add Lead', icon: '➕' },
  { href: '/admin/import-leads', label: 'Import Leads', icon: '📥' },
];

const salesLinks = [
  { href: '/sales/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/sales/leads', label: 'My Leads', icon: '👥' },
];

export default function Sidebar({ role, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const links = role === 'admin' ? adminLinks : salesLinks;

  const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-lg flex-shrink-0">{link.icon}</span>
            <span className="text-sm font-medium truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── MOBILE: full-screen overlay drawer ─────────────────────── */}
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col
          transition-transform duration-300 ease-in-out md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
          <span className="text-lg font-bold text-white">Investokey</span>
          <button
            onClick={onMobileClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <NavLinks onLinkClick={onMobileClose} />

        <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
          {role === 'admin' ? 'Admin Panel' : 'Sales Panel'}
        </div>
      </aside>

      {/* ── DESKTOP: sticky sidebar, collapsible ───────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-gray-900 text-white sticky top-0 h-screen flex-shrink-0 transition-all duration-300
          ${collapsed ? 'w-[68px]' : 'w-60'}`}
      >
        {/* Logo */}
        <div className="flex items-center px-4 py-4 border-b border-gray-700 min-h-[57px]">
          {collapsed ? (
            <span className="text-white font-bold text-sm mx-auto">IK</span>
          ) : (
            <span className="text-white font-bold text-lg">Investokey</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                title={collapsed ? link.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-lg flex-shrink-0">{link.icon}</span>
                {!collapsed && <span className="text-sm font-medium truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-gray-700">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center ${collapsed ? 'justify-center' : 'justify-end'}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {!collapsed && <span className="text-xs ml-1">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
