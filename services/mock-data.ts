import { KYCCase, KYCStatus, RiskLevel, ReviewReason } from '../types/kyc';
import { Payment, Refund, RefundStatus, RefundRisk } from '../types/refund';
import { FeatureFlag, Environment, FlagState } from '../types/feature-flag';

// Mock KYC Cases
export const MOCK_KYC_CASES: KYCCase[] = [
  {
    id: 'KYC-001',
    customerId: 'CUST-001',
    customerName: 'Alice Johnson',
    customerEmail: 'alice.johnson@email.com',
    status: 'pending',
    riskLevel: 'medium',
    reviewReason: 'document_mismatch',
    submittedAt: new Date('2024-01-15T10:30:00Z'),
    identityInfo: {
      dateOfBirth: '1990-05-15',
      documentType: 'passport',
      documentNumber: 'P123456789',
      country: 'US'
    },
    verificationChecks: {
      documentAuthenticity: true,
      biometricMatch: false,
      watchlistMatch: false,
      addressVerification: true
    },
    auditHistory: [
      {
        id: 'AUDIT-001',
        action: 'assigned',
        userId: '2',
        userName: 'Priya Shah',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        details: { assignedTo: 'queue' }
      }
    ]
  },
  {
    id: 'KYC-002',
    customerId: 'CUST-002',
    customerName: 'Bob Smith',
    customerEmail: 'bob.smith@email.com',
    status: 'pending',
    riskLevel: 'high',
    reviewReason: 'suspicious_activity',
    submittedAt: new Date('2024-01-14T15:45:00Z'),
    identityInfo: {
      dateOfBirth: '1985-08-22',
      documentType: 'drivers_license',
      documentNumber: 'DL987654321',
      country: 'US'
    },
    verificationChecks: {
      documentAuthenticity: true,
      biometricMatch: true,
      watchlistMatch: true,
      addressVerification: false
    },
    auditHistory: [
      {
        id: 'AUDIT-002',
        action: 'assigned',
        userId: '2',
        userName: 'Priya Shah',
        timestamp: new Date('2024-01-14T15:45:00Z'),
        details: { assignedTo: 'queue' }
      }
    ]
  },
  {
    id: 'KYC-003',
    customerId: 'CUST-003',
    customerName: 'Carol Davis',
    customerEmail: 'carol.davis@email.com',
    status: 'info_requested',
    riskLevel: 'low',
    reviewReason: 'incomplete_info',
    submittedAt: new Date('2024-01-13T09:15:00Z'),
    reviewedAt: new Date('2024-01-13T14:30:00Z'),
    reviewedBy: '2',
    reviewerNotes: 'Please provide additional proof of address',
    identityInfo: {
      dateOfBirth: '1992-11-30',
      documentType: 'national_id',
      documentNumber: 'ID456789123',
      country: 'CA'
    },
    verificationChecks: {
      documentAuthenticity: true,
      biometricMatch: true,
      watchlistMatch: false,
      addressVerification: false
    },
    auditHistory: [
      {
        id: 'AUDIT-003',
        action: 'assigned',
        userId: '2',
        userName: 'Priya Shah',
        timestamp: new Date('2024-01-13T09:15:00Z'),
        details: { assignedTo: 'queue' }
      },
      {
        id: 'AUDIT-004',
        action: 'info_requested',
        userId: '2',
        userName: 'Priya Shah',
        timestamp: new Date('2024-01-13T14:30:00Z'),
        notes: 'Please provide additional proof of address'
      }
    ]
  },
  {
    id: 'KYC-004',
    customerId: 'CUST-004',
    customerName: 'David Wilson',
    customerEmail: 'david.wilson@email.com',
    status: 'pending',
    riskLevel: 'high',
    reviewReason: 'high_risk_country',
    submittedAt: new Date('2024-01-12T16:20:00Z'),
    identityInfo: {
      dateOfBirth: '1988-03-10',
      documentType: 'passport',
      documentNumber: 'P987654321',
      country: 'XX'
    },
    verificationChecks: {
      documentAuthenticity: true,
      biometricMatch: true,
      watchlistMatch: false,
      addressVerification: true
    },
    auditHistory: [
      {
        id: 'AUDIT-005',
        action: 'assigned',
        userId: '2',
        userName: 'Priya Shah',
        timestamp: new Date('2024-01-12T16:20:00Z'),
        details: { assignedTo: 'queue' }
      }
    ]
  },
  {
    id: 'KYC-005',
    customerId: 'CUST-005',
    customerName: 'Eva Martinez',
    customerEmail: 'eva.martinez@email.com',
    status: 'approved',
    riskLevel: 'low',
    reviewReason: 'age_verification',
    submittedAt: new Date('2024-01-10T11:00:00Z'),
    reviewedAt: new Date('2024-01-10T13:45:00Z'),
    reviewedBy: '2',
    reviewerNotes: 'Age verified successfully',
    identityInfo: {
      dateOfBirth: '1995-07-20',
      documentType: 'national_id',
      documentNumber: 'ID123456789',
      country: 'ES'
    },
    verificationChecks: {
      documentAuthenticity: true,
      biometricMatch: true,
      watchlistMatch: false,
      addressVerification: true
    },
    auditHistory: [
      {
        id: 'AUDIT-006',
        action: 'assigned',
        userId: '2',
        userName: 'Priya Shah',
        timestamp: new Date('2024-01-10T11:00:00Z'),
        details: { assignedTo: 'queue' }
      },
      {
        id: 'AUDIT-007',
        action: 'approved',
        userId: '2',
        userName: 'Priya Shah',
        timestamp: new Date('2024-01-10T13:45:00Z'),
        notes: 'Age verified successfully'
      }
    ]
  }
];

// Mock Payments
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'PAY-001',
    customerId: 'CUST-001',
    customerName: 'Alice Johnson',
    customerEmail: 'alice.johnson@email.com',
    amount: 150.00,
    currency: 'USD',
    transactionId: 'TXN-001',
    paymentDate: new Date('2024-01-15T10:00:00Z'),
    status: 'completed',
    refundableAmount: 150.00,
    refundHistory: []
  },
  {
    id: 'PAY-002',
    customerId: 'CUST-002',
    customerName: 'Bob Smith',
    customerEmail: 'bob.smith@email.com',
    amount: 750.00,
    currency: 'USD',
    transactionId: 'TXN-002',
    paymentDate: new Date('2024-01-14T14:00:00Z'),
    status: 'completed',
    refundableAmount: 750.00,
    refundHistory: []
  },
  {
    id: 'PAY-003',
    customerId: 'CUST-003',
    customerName: 'Carol Davis',
    customerEmail: 'carol.davis@email.com',
    amount: 300.00,
    currency: 'USD',
    transactionId: 'TXN-003',
    paymentDate: new Date('2024-01-13T08:00:00Z'),
    status: 'completed',
    refundableAmount: 300.00,
    refundHistory: []
  },
  {
    id: 'PAY-004',
    customerId: 'CUST-004',
    customerName: 'David Wilson',
    customerEmail: 'david.wilson@email.com',
    amount: 1200.00,
    currency: 'USD',
    transactionId: 'TXN-004',
    paymentDate: new Date('2024-01-12T15:00:00Z'),
    status: 'completed',
    refundableAmount: 1200.00,
    refundHistory: []
  },
  {
    id: 'PAY-005',
    customerId: 'CUST-005',
    customerName: 'Eva Martinez',
    customerEmail: 'eva.martinez@email.com',
    amount: 200.00,
    currency: 'USD',
    transactionId: 'TXN-005',
    paymentDate: new Date('2024-01-10T09:00:00Z'),
    status: 'completed',
    refundableAmount: 50.00,
    refundHistory: [
      {
        id: 'REF-001',
        paymentId: 'PAY-005',
        amount: 150.00,
        status: 'processed',
        requestedBy: '1',
        requestedAt: new Date('2024-01-11T10:00:00Z'),
        processedAt: new Date('2024-01-11T14:00:00Z'),
        reason: 'Customer requested partial refund',
        risk: 'low',
        auditHistory: [
          {
            id: 'AUDIT-008',
            action: 'requested',
            userId: '1',
            userName: 'Jordan Lee',
            timestamp: new Date('2024-01-11T10:00:00Z'),
            amount: 150.00,
            reason: 'Customer requested partial refund'
          },
          {
            id: 'AUDIT-009',
            action: 'processed',
            userId: '3',
            userName: 'Morgan Chen',
            timestamp: new Date('2024-01-11T14:00:00Z'),
            amount: 150.00,
            reason: 'Customer requested partial refund'
          }
        ]
      }
    ]
  }
];

// Mock Feature Flags
export const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'FF-001',
    name: 'new_dashboard_ui',
    description: 'Enable new dashboard UI for all users',
    environment: 'development',
    state: 'enabled',
    rolloutPercentage: 100,
    lastModifiedBy: '3',
    lastModifiedAt: new Date('2024-01-15T09:00:00Z'),
    auditHistory: [
      {
        id: 'AUDIT-010',
        action: 'enabled',
        userId: '3',
        userName: 'Morgan Chen',
        timestamp: new Date('2024-01-15T09:00:00Z'),
        newState: {
          state: 'enabled',
          rolloutPercentage: 100,
          environment: 'development'
        },
        reason: 'Testing new dashboard UI in development'
      }
    ]
  },
  {
    id: 'FF-002',
    name: 'advanced_analytics',
    description: 'Enable advanced analytics features',
    environment: 'staging',
    state: 'rollout',
    rolloutPercentage: 50,
    lastModifiedBy: '3',
    lastModifiedAt: new Date('2024-01-14T16:00:00Z'),
    auditHistory: [
      {
        id: 'AUDIT-011',
        action: 'rollout_updated',
        userId: '3',
        userName: 'Morgan Chen',
        timestamp: new Date('2024-01-14T16:00:00Z'),
        previousState: {
          state: 'rollout',
          rolloutPercentage: 25,
          environment: 'staging'
        },
        newState: {
          state: 'rollout',
          rolloutPercentage: 50,
          environment: 'staging'
        },
        reason: 'Increasing rollout to 50% for further testing'
      }
    ]
  },
  {
    id: 'FF-003',
    name: 'payment_flow_v2',
    description: 'Enable new payment flow',
    environment: 'production',
    state: 'disabled',
    rolloutPercentage: 0,
    lastModifiedBy: '3',
    lastModifiedAt: new Date('2024-01-13T10:00:00Z'),
    auditHistory: [
      {
        id: 'AUDIT-012',
        action: 'disabled',
        userId: '3',
        userName: 'Morgan Chen',
        timestamp: new Date('2024-01-13T10:00:00Z'),
        previousState: {
          state: 'enabled',
          rolloutPercentage: 100,
          environment: 'production'
        },
        newState: {
          state: 'disabled',
          rolloutPercentage: 0,
          environment: 'production'
        },
        reason: 'Rolling back due to performance issues'
      }
    ]
  },
  {
    id: 'FF-004',
    name: 'kyc_automation',
    description: 'Enable automated KYC verification',
    environment: 'development',
    state: 'rollout',
    rolloutPercentage: 25,
    lastModifiedBy: '3',
    lastModifiedAt: new Date('2024-01-12T14:00:00Z'),
    auditHistory: [
      {
        id: 'AUDIT-013',
        action: 'rollout_updated',
        userId: '3',
        userName: 'Morgan Chen',
        timestamp: new Date('2024-01-12T14:00:00Z'),
        newState: {
          state: 'rollout',
          rolloutPercentage: 25,
          environment: 'development'
        },
        reason: 'Testing automated KYC with small percentage'
      }
    ]
  },
  {
    id: 'FF-005',
    name: 'real_time_notifications',
    description: 'Enable real-time notification system',
    environment: 'staging',
    state: 'enabled',
    rolloutPercentage: 100,
    lastModifiedBy: '3',
    lastModifiedAt: new Date('2024-01-11T11:00:00Z'),
    auditHistory: [
      {
        id: 'AUDIT-014',
        action: 'enabled',
        userId: '3',
        userName: 'Morgan Chen',
        timestamp: new Date('2024-01-11T11:00:00Z'),
        previousState: {
          state: 'disabled',
          rolloutPercentage: 0,
          environment: 'staging'
        },
        newState: {
          state: 'enabled',
          rolloutPercentage: 100,
          environment: 'staging'
        },
        reason: 'Enabled for staging testing'
      }
    ]
  }
];
