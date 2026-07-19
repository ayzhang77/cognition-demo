'use client';

import { useState, useEffect } from 'react';
import { Payment, RefundAction } from '@/types/refund';
import { refundService } from '@/services/refund-service';
import { authService } from '@/lib/auth';
import { Card } from '@/components/shared/Card';
import { Table } from '@/components/shared/Table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { AuditLog } from '@/components/shared/AuditLog';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function RefundsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundModal, setRefundModal] = useState({ isOpen: false, amount: '', reason: '' });
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; action: RefundAction; refundId: string }>({ isOpen: false, action: 'approve', refundId: '' });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    refundStatus: '',
    minAmount: '',
    maxAmount: '',
    risk: ''
  });

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadPayments();
  }, [filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await refundService.getPayments({
        search: filters.search || undefined,
        refundStatus: filters.refundStatus || undefined,
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
        risk: filters.risk || undefined
      });
      setPayments(data);
    } catch (err) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!selectedPayment || !currentUser) return;

    try {
      const amount = parseFloat(refundModal.amount);
      
      // Check authorization
      if (!authService.canRefundAmount(amount)) {
        setError('Support agents may only refund up to $500. Amounts above $500 require Finance admin approval.');
        return;
      }

      if (amount > selectedPayment.refundableAmount) {
        setError('Refund amount exceeds refundable amount');
        return;
      }

      if (!refundModal.reason.trim()) {
        setError('Please provide a reason for the refund');
        return;
      }

      await refundService.requestRefund(
        selectedPayment.id,
        amount,
        currentUser.id,
        currentUser.name,
        refundModal.reason
      );

      setRefundModal({ isOpen: false, amount: '', reason: '' });
      setSelectedPayment(null);
      setError(null);
      loadPayments();
    } catch (err) {
      setError('Failed to request refund');
    }
  };

  const handleRefundAction = async () => {
    if (!actionModal.refundId || !currentUser) return;

    try {
      if (!notes.trim()) {
        setError('Please provide a reason for this action');
        return;
      }

      await refundService.processRefundAction(
        actionModal.refundId,
        actionModal.action,
        currentUser.id,
        currentUser.name,
        notes
      );

      setActionModal({ isOpen: false, action: 'approve', refundId: '' });
      setNotes('');
      setSelectedPayment(null);
      setError(null);
      loadPayments();
    } catch (err) {
      setError('Failed to process action');
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Payment ID',
      className: 'font-medium'
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (value: string, row: Payment) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-gray-500">{row.customerEmail}</p>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value: number, row: Payment) => formatCurrency(value, row.currency)
    },
    {
      key: 'refundableAmount',
      header: 'Refundable',
      render: (value: number, row: Payment) => formatCurrency(value, row.currency)
    },
    {
      key: 'refundHistory',
      header: 'Refunds',
      render: (value: any[]) => (
        <span className="text-sm text-gray-600">{value.length} request(s)</span>
      )
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      render: (value: Date) => formatDate(value)
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading payments...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Refunds Dashboard</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search by customer, ID..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.refundStatus}
            onChange={(e) => setFilters({ ...filters, refundStatus: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processed">Processed</option>
          </select>
          <input
            type="number"
            placeholder="Min Amount"
            value={filters.minAmount}
            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Max Amount"
            value={filters.maxAmount}
            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.risk}
            onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </Card>

      <Card>
        <Table data={payments} columns={columns} onRowClick={setSelectedPayment} />
      </Card>

      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Payment: ${selectedPayment.id}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Customer</p>
                <p className="text-lg font-semibold">{selectedPayment.customerName}</p>
                <p className="text-sm text-gray-600">{selectedPayment.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-lg font-semibold">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</p>
                <p className="text-sm text-gray-600">Refundable: {formatCurrency(selectedPayment.refundableAmount, selectedPayment.currency)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Transaction ID:</span>
                <span className="ml-2 font-medium">{selectedPayment.transactionId}</span>
              </div>
              <div>
                <span className="text-gray-500">Payment Date:</span>
                <span className="ml-2 font-medium">{formatDate(selectedPayment.paymentDate)}</span>
              </div>
            </div>

            {selectedPayment.refundHistory.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Refund History</p>
                <div className="space-y-3">
                  {selectedPayment.refundHistory.map((refund) => (
                    <div key={refund.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{formatCurrency(refund.amount, selectedPayment.currency)}</p>
                          <p className="text-sm text-gray-600">{refund.reason}</p>
                        </div>
                        <StatusBadge status={refund.status} />
                      </div>
                      <div className="text-xs text-gray-500">
                        Requested by {refund.requestedBy} on {formatDate(refund.requestedAt)}
                      </div>
                      {refund.status === 'pending' && currentUser && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => setActionModal({ isOpen: true, action: 'approve', refundId: refund.id })}
                            disabled={!authService.canRefundAmount(refund.amount)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setActionModal({ isOpen: true, action: 'reject', refundId: refund.id })}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {refund.auditHistory.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">View Audit History</summary>
                          <AuditLog events={refund.auditHistory} className="mt-2" />
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPayment.refundableAmount > 0 && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => setRefundModal({ isOpen: true, amount: selectedPayment.refundableAmount.toString(), reason: '' })}
                >
                  Request Refund
                </Button>
              </div>
            )}

            {selectedPayment.refundableAmount > 500 && currentUser?.role === 'support' && (
              <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                ⚠️ Refunds above $500 require Finance admin approval
              </p>
            )}
          </div>
        </Modal>
      )}

      <Modal
        isOpen={refundModal.isOpen}
        onClose={() => setRefundModal({ isOpen: false, amount: '', reason: '' })}
        title="Request Refund"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRefundModal({ isOpen: false, amount: '', reason: '' })}>
              Cancel
            </Button>
            <Button onClick={handleRequestRefund}>
              Request Refund
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refund Amount (Max: {selectedPayment && formatCurrency(selectedPayment.refundableAmount)})
            </label>
            <input
              type="number"
              value={refundModal.amount}
              onChange={(e) => setRefundModal({ ...refundModal, amount: e.target.value })}
              max={selectedPayment?.refundableAmount}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              value={refundModal.reason}
              onChange={(e) => setRefundModal({ ...refundModal, reason: e.target.value })}
              placeholder="Enter refund reason..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, action: 'approve', refundId: '' })}
        title={`${actionModal.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Refund`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setActionModal({ isOpen: false, action: 'approve', refundId: '' })}>
              Cancel
            </Button>
            <Button onClick={handleRefundAction}>
              Confirm
            </Button>
          </>
        }
      >
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Please provide a reason for {actionModal.action.replace(/_/g, ' ')} this refund.
          </p>
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
