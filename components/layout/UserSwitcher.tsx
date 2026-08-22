'use client';

import { useState, useEffect } from 'react';
import { MOCK_USERS, User } from '@/types/user';
import { authService } from '@/lib/auth';
import { startSession } from '@/lib/api-client';

const roleColors = {
  support: 'bg-green-500',
  compliance: 'bg-yellow-500',
  admin: 'bg-purple-500'
};

const roleLabels = {
  support: 'Support Agent',
  compliance: 'Compliance Reviewer',
  admin: 'Admin'
};

export function UserSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const signIn = async (user: User) => {
    // The server session is authoritative for authorization; the local auth
    // service only drives UI affordances.
    await startSession(user.id);
    authService.setCurrentUser(user);
  };

  useEffect(() => {
    if (!authService.getCurrentUser()) {
      signIn(MOCK_USERS[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserSwitch = (user: User) => {
    signIn(user);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
      >
        <div className={`w-10 h-10 ${currentUser ? roleColors[currentUser.role as keyof typeof roleColors] : 'bg-gray-400'} rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
          {currentUser?.name.charAt(0) || '?'}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-900">{currentUser?.name || 'Select User'}</p>
          <p className="text-xs text-gray-600 capitalize font-medium">
            {currentUser ? roleLabels[currentUser.role as keyof typeof roleLabels] : ''}
          </p>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <p className="text-sm font-semibold text-gray-900">Switch User</p>
              <p className="text-xs text-gray-600 mt-1">Simulate different roles and permissions</p>
            </div>
            <div className="p-2">
              {MOCK_USERS.map((user) => {
                const isSelected = currentUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleUserSwitch(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isSelected ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 ${roleColors[user.role as keyof typeof roleColors]} rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600 capitalize font-medium">
                        {roleLabels[user.role as keyof typeof roleLabels]}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
