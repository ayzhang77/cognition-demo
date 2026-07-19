'use client';

import { useState, useEffect } from 'react';
import { KYCCase, KYCAction } from '@/types/kyc';
import { kycService } from '@/services/kyc-service';
import { authService } from '@/lib/auth';
import { Card } from '@/components/shared/Card';
import { Table } from '@/components/shared/Table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { AuditLog } from '@/components/shared/AuditLog';
import { getRiskColor, formatDate } from '@/lib/utils';

export default function KYCPage() {
  const [cases, setCases] = useState<KYCCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<KYCCase | null>(null);
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; action: KYCAction }>({ isOpen: false, action: 'approve' });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    riskLevel: '',
    reviewReason: ''
  });
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadCases();
  }, [filters]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await kycService.getCases(filters);
      setCases(data);
    } catch (err) {
      setError('Failed to load KYC cases');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedCase || !currentUser) return;

    try {
      // Check authorization for high-risk cases
      if (selectedCase.riskLevel === 'high' && actionModal.action === 'approve') {
        if (!authService.canApproveKYCHighRisk()) {
          setError('High-risk cases can only be approved by Compliance reviewers or Admins');
          return;
        }
      }

      if (!notes.trim()) {
        setError('Please provide a reason for this action');
        return;
      }

      await kycService.performAction(selectedCase.id, actionModal.action, currentUser.id, currentUser.name, notes);
      setActionModal({ isOpen: false, action: 'approve' });
      setNotes('');
      setSelectedCase(null);
      setError(null);
      loadCases();
    } catch (err) {
      setError('Failed to perform action');
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Case ID',
      className: 'font-medium'
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (value: string, row: KYCCase) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-gray-500">{row.customerEmail}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    {
      key: 'riskLevel',
      header: 'Risk',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(value)}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'reviewReason',
      header: 'Reason',
      render: (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      render: (value: Date) => formatDate(value)
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading KYC cases...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">KYC Review Queue</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="escalated">Escalated</option>
            <option value="info_requested">Info Requested</option>
          </select>
          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            value={filters.reviewReason}
            onChange={(e) => setFilters({ ...filters, reviewReason: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Reasons</option>
            <option value="document_mismatch">Document Mismatch</option>
            <option value="suspicious_activity">Suspicious Activity</option>
            <option value="incomplete_info">Incomplete Info</option>
            <option value="high_risk_country">High Risk Country</option>
            <option value="age_verification">Age Verification</option>
          </select>
        </div>
      </Card>

      <Card>
        <Table data={cases} columns={columns} onRowClick={setSelectedCase} />
      </Card>

      {selectedCase && (
        <Modal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title={`KYC Case: ${selectedCase.id}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Customer</p>
                <p className="text-lg font-semibold">{selectedCase.customerName}</p>
                <p className="text-sm text-gray-600">{selectedCase.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Risk Level</p>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getRiskColor(selectedCase.riskLevel)}`}>
                  {selectedCase.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Identity Information</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Date of Birth:</span>
                    <span className="ml-2 font-medium">{selectedCase.identityInfo.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Document Type:</span>
                    <span className="ml-2 font-medium">{selectedCase.identityInfo.documentType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Document Number:</span>
                    <span className="ml-2 font-medium">{selectedCase.identityInfo.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Country:</span>
                    <span className="ml-2 font-medium">{selectedCase.identityInfo.country}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Verification Checks</p>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedCase.verificationChecks).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedCase.reviewerNotes && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Reviewer Notes</p>
                <p className="text-sm bg-yellow-50 p-3 rounded-lg">{selectedCase.reviewerNotes}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Audit History</p>
              <AuditLog events={selectedCase.auditHistory} />
            </div>

            {selectedCase.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => setActionModal({ isOpen: true, action: 'approve' })}
                  disabled={selectedCase.riskLevel === 'high' && !authService.canApproveKYCHighRisk()}
                >
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setActionModal({ isOpen: true, action: 'request_info' })}
                >
                  Request Info
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setActionModal({ isOpen: true, action: 'reject' })}
                >
                  Reject
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActionModal({ isOpen: true, action: 'escalate' })}
                >
                  Escalate
                </Button>
              </div>
            )}

            {selectedCase.riskLevel === 'high' && selectedCase.status === 'pending' && !authService.canApproveKYCHighRisk() && (
              <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                ⚠️ High-risk cases can only be approved by Compliance reviewers or Admins
              </p>
            )}
          </div>
        </Modal>
      )}

      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, action: 'approve' })}
        title={`${actionModal.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Case`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setActionModal({ isOpen: false, action: 'approve' })}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              disabled={selectedCase?.riskLevel === 'high' && actionModal.action === 'approve' && !authService.canApproveKYCHighRisk()}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Please provide a reason for {actionModal.action.replace(/_/g, ' ')} this case.
          </p>
          {selectedCase?.riskLevel === 'high' && actionModal.action === 'approve' && !authService.canApproveKYCHighRisk() && (
            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg mb-4">
              ⚠️ High-risk cases can only be approved by Compliance reviewers or Admins
            </p>
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your notes..."
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Modal>
    </div>
  );
}
