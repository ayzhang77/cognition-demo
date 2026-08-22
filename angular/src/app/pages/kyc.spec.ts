import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kyc } from './kyc';
import { AuthService } from '../services/auth-service';
import { KycService } from '../services/kyc-service';
import { KYCCase } from '../types/kyc';
import { MOCK_USERS } from '../types/user';

function highRiskPendingCase(): KYCCase {
  return {
    id: 'KYC-TEST',
    customerId: 'CUST-TEST',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    status: 'pending',
    riskLevel: 'high',
    reviewReason: 'suspicious_activity',
    submittedAt: new Date('2024-01-01T00:00:00Z'),
    identityInfo: {
      dateOfBirth: '1990-01-01',
      documentType: 'passport',
      documentNumber: 'P123',
      country: 'US',
    },
    verificationChecks: {
      documentAuthenticity: true,
      biometricMatch: true,
      watchlistMatch: false,
      addressVerification: true,
    },
    auditHistory: [],
  };
}

describe('Kyc', () => {
  let fixture: ComponentFixture<Kyc>;
  let component: Kyc;
  let performAction: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Kyc] }).compileComponents();

    // Spied so the shared root-provided service's case list is never mutated by tests.
    performAction = spyOn(TestBed.inject(KycService), 'performAction').and.resolveTo(
      highRiskPendingCase()
    );
    TestBed.inject(AuthService).setCurrentUser(MOCK_USERS[0]); // Support
    fixture = TestBed.createComponent(Kyc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads cases from the service', async () => {
    const cases = await TestBed.inject(KycService).getCases({});
    expect(component.cases.length).toBe(cases.length);
  });

  it('blocks high-risk approval for a support agent before checking notes', async () => {
    component.selectedCase = highRiskPendingCase();
    component.openActionModal('approve');
    component.notes = '';

    await component.handleAction();

    expect(component.error).toBe(
      'High-risk cases can only be approved by Compliance reviewers or Admins'
    );
    expect(performAction).not.toHaveBeenCalled();
  });

  it('requires notes once the reviewer may approve high-risk cases', async () => {
    TestBed.inject(AuthService).setCurrentUser(MOCK_USERS[1]); // Compliance
    component.selectedCase = highRiskPendingCase();
    component.openActionModal('approve');
    component.notes = '   ';

    await component.handleAction();

    expect(component.error).toBe('Please provide a reason for this action');
    expect(performAction).not.toHaveBeenCalled();
  });

  it('performs the action and resets modal state', async () => {
    TestBed.inject(AuthService).setCurrentUser(MOCK_USERS[2]); // Admin
    component.selectedCase = highRiskPendingCase();
    component.openActionModal('approve');
    component.notes = 'Verified documents';

    await component.handleAction();

    expect(performAction).toHaveBeenCalledWith(
      'KYC-TEST',
      'approve',
      MOCK_USERS[2].id,
      MOCK_USERS[2].name,
      'Verified documents'
    );
    expect(component.actionModal).toEqual({ isOpen: false, action: 'approve' });
    expect(component.notes).toBe('');
    expect(component.selectedCase).toBeNull();
    expect(component.error).toBeNull();
  });

  it('disables high-risk approval confirmation for unauthorized reviewers', () => {
    component.selectedCase = highRiskPendingCase();
    component.openActionModal('approve');
    expect(component.highRiskApprovalBlocked).toBe(true);

    TestBed.inject(AuthService).setCurrentUser(MOCK_USERS[1]); // Compliance
    expect(component.highRiskApprovalBlocked).toBe(false);
  });

  it('formats the review reason and action labels', () => {
    expect(component.formatLabel('document_mismatch')).toBe('Document Mismatch');
    component.openActionModal('request_info');
    expect(component.actionModalTitle).toBe('Request Info Case');
    expect(component.actionModalActionLabel).toBe('request info');
  });
});
