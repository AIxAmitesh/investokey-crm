'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SidebarProps {
  role: 'admin' | 'sales';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !isOpen) setIsOpen(true);
      if (mobile && isOpen) setIsOpen(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

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

  const links = role === 'admin' ? adminLinks : salesLinks;

  const sidebarWidth = isOpen ? 'w-64' : 'w-20';
  const isFixed = window.innerWidth < 768;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isFixed ? 'fixed' : 'relative'
        } ${sidebarWidth} bg-gray-900 text-white transition-all duration-300 flex flex-col z-50 h-screen md:h-auto md:sticky md:top-0`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <h1 className={`font-bold text-lg ${isOpen ? '' : 'text-center'}`}>
            {isOpen ? 'Investokey' : 'IK'}
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => isMobile && setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-xl flex-shrink-0">{link.icon}</span>
                {isOpen && <span className="text-sm">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            title={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>
      </aside>
    </>
  );
}