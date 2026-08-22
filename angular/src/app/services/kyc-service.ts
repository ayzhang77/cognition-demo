import { Injectable } from '@angular/core';
import { KYCCase, KYCAction, KYCAuditEvent } from '../types/kyc';
import { MOCK_KYC_CASES } from './mock-data';

@Injectable({ providedIn: 'root' })
export class KycService {
  private cases: KYCCase[] = [...MOCK_KYC_CASES];

  async getCases(filters?: {
    search?: string;
    status?: string;
    riskLevel?: string;
    reviewReason?: string;
  }): Promise<KYCCase[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.cases;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.customerName.toLowerCase().includes(search) ||
        c.customerEmail.toLowerCase().includes(search) ||
        c.id.toLowerCase().includes(search)
      );
    }

    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters?.riskLevel) {
      filtered = filtered.filter(c => c.riskLevel === filters.riskLevel);
    }

    if (filters?.reviewReason) {
      filtered = filtered.filter(c => c.reviewReason === filters.reviewReason);
    }

    return filtered.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async getCaseById(id: string): Promise<KYCCase | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.cases.find(c => c.id === id) || null;
  }

  async performAction(
    caseId: string,
    action: KYCAction,
    userId: string,
    userName: string,
    notes: string
  ): Promise<KYCCase> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const kycCase = this.cases.find(c => c.id === caseId);
    if (!kycCase) {
      throw new Error('KYC case not found');
    }

    // Create audit event
    const auditEvent: KYCAuditEvent = {
      id: `AUDIT-${Date.now()}`,
      action: action === 'request_info' ? 'info_requested' :
              action === 'approve' ? 'approved' :
              action === 'reject' ? 'rejected' :
              action === 'escalate' ? 'escalated' : action,
      userId,
      userName,
      timestamp: new Date(),
      notes,
      details: { previousStatus: kycCase.status }
    };

    // Update case based on action
    switch (action) {
      case 'approve':
        kycCase.status = 'approved';
        kycCase.reviewedAt = new Date();
        kycCase.reviewedBy = userId;
        kycCase.reviewerNotes = notes;
        break;
      case 'reject':
        kycCase.status = 'rejected';
        kycCase.reviewedAt = new Date();
        kycCase.reviewedBy = userId;
        kycCase.reviewerNotes = notes;
        break;
      case 'request_info':
        kycCase.status = 'info_requested';
        kycCase.reviewedAt = new Date();
        kycCase.reviewedBy = userId;
        kycCase.reviewerNotes = notes;
        break;
      case 'escalate':
        kycCase.status = 'escalated';
        kycCase.reviewedAt = new Date();
        kycCase.reviewedBy = userId;
        kycCase.reviewerNotes = notes;
        break;
    }

    kycCase.auditHistory.push(auditEvent);

    return kycCase;
  }
}
