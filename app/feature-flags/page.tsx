'use client';

import { useState, useEffect } from 'react';
import { FeatureFlag, FlagAction, Environment } from '@/types/feature-flag';
import { featureFlagService } from '@/services/feature-flag-service';
import { authService } from '@/lib/auth';
import { MOCK_USERS } from '@/types/user';
import { Card } from '@/components/shared/Card';
import { Table } from '@/components/shared/Table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { AuditLog } from '@/components/shared/AuditLog';
import { formatDate } from '@/lib/utils';

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [editModal, setEditModal] = useState({ 
    isOpen: false, 
    action: 'enable' as FlagAction, 
    enabledUserIds: [] as string[],
    environment: 'development' as Environment,
    reason: '' 
  });
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    environment: '',
    state: ''
  });
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadFlags();
  }, [filters]);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await featureFlagService.getFlags({
        environment: filters.environment || undefined,
        state: filters.state || undefined
      });
      setFlags(data);
    } catch (err) {
      setError('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagAction = async () => {
    if (!selectedFlag || !currentUser) return;

    try {
      // Check authorization for production changes
      if (editModal.environment === 'production' && !authService.canModifyProductionFlags()) {
        setError('Production changes require Admin role');
        return;
      }

      if (editModal.environment === 'production' && !editModal.reason.trim()) {
        setError('Production changes require a reason');
        return;
      }

      await featureFlagService.performAction(
        selectedFlag.id,
        editModal.action,
        currentUser.id,
        currentUser.name,
        editModal.reason,
        {
          enabledUserIds: editModal.enabledUserIds,
          environment: editModal.environment
        }
      );

      setEditModal({ isOpen: false, action: 'enable', enabledUserIds: [], environment: 'development', reason: '' });
      setSelectedFlag(null);
      setError(null);
      loadFlags();
    } catch (err) {
      setError('Failed to update feature flag');
    }
  };

  const getUserNames = (userIds: string[]) => {
    return userIds.map(id => MOCK_USERS.find(u => u.id === id)?.name || 'Unknown').join(', ');
  };

  const columns = [
    {
      key: 'name',
      header: 'Flag Name',
      className: 'font-medium'
    },
    {
      key: 'description',
      header: 'Description',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'environment',
      header: 'Environment',
      render: (value: Environment) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
          value === 'production' ? 'bg-red-50 text-red-700 border-red-200' :
          value === 'staging' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
          'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'state',
      header: 'State',
      render: (value: string) => <StatusBadge status={value} />
    },
    {
      key: 'enabledUserIds',
      header: 'Enabled Users',
      render: (value: string[], row: FeatureFlag) => {
        if (row.state === 'enabled') return 'All Users';
        if (row.state === 'disabled') return 'None';
        return getUserNames(value);
      }
    },
    {
      key: 'lastModifiedAt',
      header: 'Last Modified',
      render: (value: Date) => formatDate(value)
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading feature flags...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Feature Flag Admin</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filters.environment}
            onChange={(e) => setFilters({ ...filters, environment: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Environments</option>
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
          <select
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All States</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
            <option value="user_targeted">User Targeted</option>
          </select>
        </div>
      </Card>

      <Card>
        <Table data={flags} columns={columns} onRowClick={setSelectedFlag} />
      </Card>

      {selectedFlag && (
        <Modal
          isOpen={!!selectedFlag}
          onClose={() => setSelectedFlag(null)}
          title={`Feature Flag: ${selectedFlag.name}`}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-gray-900">{selectedFlag.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Environment</p>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${
                  selectedFlag.environment === 'production' ? 'bg-red-50 text-red-700 border-red-200' :
                  selectedFlag.environment === 'staging' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {selectedFlag.environment.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">State</p>
                <StatusBadge status={selectedFlag.state} />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Enabled Users</p>
              <div className="mt-2">
                {selectedFlag.state === 'enabled' && (
                  <p className="text-green-700 font-medium">All Users</p>
                )}
                {selectedFlag.state === 'disabled' && (
                  <p className="text-red-700 font-medium">None</p>
                )}
                {selectedFlag.state === 'user_targeted' && (
                  <div className="flex flex-wrap gap-2">
                    {selectedFlag.enabledUserIds.map(userId => {
                      const user = MOCK_USERS.find(u => u.id === userId);
                      return user ? (
                        <div key={userId} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{user.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Last Modified By:</span>
                <span className="ml-2 font-medium">{selectedFlag.lastModifiedBy}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Modified At:</span>
                <span className="ml-2 font-medium">{formatDate(selectedFlag.lastModifiedAt)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Audit History</p>
              <AuditLog events={selectedFlag.auditHistory} />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => setEditModal({ 
                  isOpen: true, 
                  action: 'enable', 
                  enabledUserIds: selectedFlag.enabledUserIds,
                  environment: selectedFlag.environment,
                  reason: '' 
                })}
              >
                Enable
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEditModal({ 
                  isOpen: true, 
                  action: 'disable', 
                  enabledUserIds: selectedFlag.enabledUserIds,
                  environment: selectedFlag.environment,
                  reason: '' 
                })}
              >
                Disable
              </Button>
              <Button
                variant="ghost"
                onClick={() => setEditModal({ 
                  isOpen: true, 
                  action: 'update_user_targeting', 
                  enabledUserIds: selectedFlag.enabledUserIds,
                  environment: selectedFlag.environment,
                  reason: '' 
                })}
              >
                Update User Targeting
              </Button>
            </div>

            {selectedFlag.environment === 'production' && !authService.canModifyProductionFlags() && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                ⚠️ Production changes require Admin role
              </p>
            )}
          </div>
        </Modal>
      )}

      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, action: 'enable', enabledUserIds: [], environment: 'development', reason: '' })}
        title={`${editModal.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Flag`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModal({ isOpen: false, action: 'enable', enabledUserIds: [], environment: 'development', reason: '' })}>
              Cancel
            </Button>
            <Button onClick={handleFlagAction}>
              Confirm Change
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {editModal.action === 'update_user_targeting' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Users to Enable
              </label>
              <div className="space-y-2">
                {MOCK_USERS.map((user) => (
                  <label key={user.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editModal.enabledUserIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditModal({ 
                            ...editModal, 
                            enabledUserIds: [...editModal.enabledUserIds, user.id] 
                          });
                        } else {
                          setEditModal({ 
                            ...editModal, 
                            enabledUserIds: editModal.enabledUserIds.filter(id => id !== user.id) 
                          });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment
            </label>
            <select
              value={editModal.environment}
              onChange={(e) => setEditModal({ ...editModal, environment: e.target.value as Environment })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason {editModal.environment === 'production' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={editModal.reason}
              onChange={(e) => setEditModal({ ...editModal, reason: e.target.value })}
              placeholder={editModal.environment === 'production' ? 'Required for production changes...' : 'Enter reason (optional)...'}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {editModal.environment === 'production' && (
              <p className="text-xs text-orange-600 mt-1">Production changes require a reason</p>
            )}
          </div>

          {editModal.environment === 'production' && !authService.canModifyProductionFlags() && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              ⚠️ You do not have permission to modify production flags
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
