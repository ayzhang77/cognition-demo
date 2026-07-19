'use client';

import { useState } from 'react';
import { MOCK_USERS } from '@/types/user';
import { authService } from '@/lib/auth';

export function UserSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  const handleUserSwitch = (user: typeof MOCK_USERS[0]) => {
    authService.setCurrentUser(user);
    setCurrentUser(user);
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
          {currentUser?.name.charAt(0) || '?'}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'Select User'}</p>
          <p className="text-xs text-gray-500 capitalize">{currentUser?.role || ''}</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-3 border-b">
              <p className="text-sm font-medium text-gray-900">Switch User</p>
              <p className="text-xs text-gray-500">Simulate different roles</p>
            </div>
            <div className="p-2">
              {MOCK_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSwitch(user)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
