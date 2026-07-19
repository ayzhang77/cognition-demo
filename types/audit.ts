export interface AuditEvent {
  id: string;
  entityType: 'kyc' | 'refund' | 'feature_flag';
  entityId: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details?: Record<string, any>;
  reason?: string;
}

export interface AuditLog {
  events: AuditEvent[];
}
