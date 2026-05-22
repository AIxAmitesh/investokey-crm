'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ChangePasswordModal from '@/components/ChangePasswordModal';

interface TopbarProps {
  role: 'admin' | 'sales';
}

export default function Topbar({ role }: TopbarProps) {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [showMenu, setShowMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) {
      setUserName(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    router.push('/');
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center">
          {/* Left side - Title */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              {role === 'admin' ? 'Admin' : 'Sales'}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 hidden md:block">
              {role === 'admin' ? 'Dashboard' : 'Dashboard'}
            </p>
          </div>

          {/* Right side - User menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm md:text-base text-gray-700 font-medium hidden sm:inline max-w-[100px] truncate">
                {userName}
              </span>
              <span className="text-gray-500 text-sm">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-xs text-gray-500">Logged in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                </div>

                <button
                  onClick={() => {
                    setShowChangePassword(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors font-medium text-sm"
                >
                  🔐 Change Password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={() => {
          setShowChangePassword(false);
        }}
      />
    </>
  );
}