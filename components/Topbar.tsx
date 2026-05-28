'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import ChangePasswordModal from '@/components/ChangePasswordModal';

interface TopbarProps {
  role: 'admin' | 'sales';
  onMenuClick: () => void;
}

export default function Topbar({ role, onMenuClick }: TopbarProps) {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [showMenu, setShowMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    router.push('/');
  };

  const initial = userName.charAt(0).toUpperCase();

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          {/* Left: hamburger (mobile) + title */}
          <div className="flex items-center gap-3">
            {/* Hamburger — visible only on mobile */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight">
                {role === 'admin' ? 'Admin Panel' : 'Sales Panel'}
              </h2>
              <p className="text-xs text-gray-400 hidden sm:block">Investokey CRM</p>
            </div>
          </div>

          {/* Right: user menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {initial}
              </div>
              <span className="text-sm text-gray-700 font-medium hidden sm:block max-w-[120px] truncate">
                {userName}
              </span>
              <svg className="w-3 h-3 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400">Logged in as</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {role === 'admin' ? 'Admin' : 'Sales'}
                  </span>
                </div>

                <button
                  onClick={() => { setShowChangePassword(true); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
                >
                  <span>🔐</span> Change Password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm flex items-center gap-2 border-t border-gray-100"
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={() => setShowChangePassword(false)}
      />
    </>
  );
}
