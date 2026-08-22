export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'info_requested';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ReviewReason = 'document_mismatch' | 'suspicious_activity' | 'incomplete_info' | 'high_risk_country' | 'age_verification';

export interface KYCCase {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: KYCStatus;
  riskLevel: RiskLevel;
  reviewReason: ReviewReason;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewerNotes?: string;
  identityInfo: {
    dateOfBirth: string;
    documentType: string;
    documentNumber: string;
    country: string;
  };
  verificationChecks: {
    documentAuthenticity: boolean;
    biometricMatch: boolean;
    watchlistMatch: boolean;
    addressVerification: boolean;
  };
  auditHistory: KYCAuditEvent[];
}

export interface KYCAuditEvent {
  id: string;
  action: 'approved' | 'rejected' | 'escalated' | 'info_requested' | 'assigned';
  userId: string;
  userName: string;
  timestamp: Date;
  notes?: string;
  details?: Record<string, any>;
}

export type KYCAction = 'approve' | 'reject' | 'request_info' | 'escalate';
