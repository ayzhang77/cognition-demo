import {
  Component,
  DestroyRef,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, from, startWith, switchMap } from 'rxjs';

import { AuditLog } from '../shared/audit-log';
import { Button } from '../shared/button';
import { Card } from '../shared/card';
import { Modal, ModalFooter } from '../shared/modal';
import { StatusBadge } from '../shared/status-badge';
import { Table, TableCellContext, TableColumn } from '../shared/table';
import { cn, formatDate, getRiskColor } from '../lib/utils';
import { AuthService } from '../services/auth-service';
import { KycService } from '../services/kyc-service';
import { KYCAction, KYCCase } from '../types/kyc';

interface KycFilters {
  search: string;
  status: string;
  riskLevel: string;
  reviewReason: string;
}

interface VerificationCheck {
  key: string;
  label: string;
  value: boolean;
}

@Component({
  selector: 'app-kyc',
  imports: [AuditLog, Button, Card, Modal, ModalFooter, StatusBadge, Table],
  templateUrl: './kyc.html',
})
export class Kyc implements OnInit {
  private readonly kycService = inject(KycService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterChanges = new Subject<void>();

  @ViewChild('customerCell', { static: true })
  customerCell!: TemplateRef<TableCellContext<KYCCase>>;
  @ViewChild('statusCell', { static: true })
  statusCell!: TemplateRef<TableCellContext<KYCCase>>;
  @ViewChild('riskCell', { static: true })
  riskCell!: TemplateRef<TableCellContext<KYCCase>>;
  @ViewChild('reasonCell', { static: true })
  reasonCell!: TemplateRef<TableCellContext<KYCCase>>;
  @ViewChild('submittedCell', { static: true })
  submittedCell!: TemplateRef<TableCellContext<KYCCase>>;

  readonly currentUser = this.authService.currentUser;

  cases: KYCCase[] = [];
  loading = true;
  selectedCase: KYCCase | null = null;
  actionModal: { isOpen: boolean; action: KYCAction } = { isOpen: false, action: 'approve' };
  notes = '';
  error: string | null = null;
  filters: KycFilters = {
    search: '',
    status: '',
    riskLevel: '',
    reviewReason: '',
  };

  columns: TableColumn<KYCCase>[] = [];

  ngOnInit(): void {
    this.columns = [
      {
        key: 'id',
        header: 'Case ID',
        className: 'font-medium',
      },
      {
        key: 'customerName',
        header: 'Customer',
        cell: this.customerCell,
      },
      {
        key: 'status',
        header: 'Status',
        cell: this.statusCell,
      },
      {
        key: 'riskLevel',
        header: 'Risk',
        cell: this.riskCell,
      },
      {
        key: 'reviewReason',
        header: 'Reason',
        cell: this.reasonCell,
      },
      {
        key: 'submittedAt',
        header: 'Submitted',
        cell: this.submittedCell,
      },
    ];

    this.filterChanges
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.loading = true;
          return from(this.kycService.getCases(this.filters)).pipe(
            catchError(() => {
              this.error = 'Failed to load KYC cases';
              this.loading = false;
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(cases => {
        this.cases = cases;
        this.loading = false;
      });
  }

  loadCases(): void {
    this.filterChanges.next();
  }

  updateFilter<K extends keyof KycFilters>(key: K, value: string): void {
    this.filters = { ...this.filters, [key]: value };
    this.loadCases();
  }

  async handleAction(): Promise<void> {
    const currentUser = this.currentUser();
    if (!this.selectedCase || !currentUser) return;

    try {
      // Check authorization for high-risk cases
      if (this.selectedCase.riskLevel === 'high' && this.actionModal.action === 'approve') {
        if (!this.authService.canApproveKYCHighRisk()) {
          this.error = 'High-risk cases can only be approved by Compliance reviewers or Admins';
          return;
        }
      }

      if (!this.notes.trim()) {
        this.error = 'Please provide a reason for this action';
        return;
      }

      await this.kycService.performAction(
        this.selectedCase.id,
        this.actionModal.action,
        currentUser.id,
        currentUser.name,
        this.notes
      );
      this.actionModal = { isOpen: false, action: 'approve' };
      this.notes = '';
      this.selectedCase = null;
      this.error = null;
      this.loadCases();
    } catch {
      this.error = 'Failed to perform action';
    }
  }

  openActionModal(action: KYCAction): void {
    this.actionModal = { isOpen: true, action };
  }

  closeActionModal(): void {
    this.actionModal = { isOpen: false, action: 'approve' };
  }

  canApproveHighRisk(): boolean {
    return this.authService.canApproveKYCHighRisk();
  }

  /** Mirrors `disabled={selectedCase?.riskLevel === 'high' && actionModal.action === 'approve' && !canApproveKYCHighRisk()}`. */
  get highRiskApprovalBlocked(): boolean {
    return (
      this.selectedCase?.riskLevel === 'high' &&
      this.actionModal.action === 'approve' &&
      !this.authService.canApproveKYCHighRisk()
    );
  }

  get actionModalTitle(): string {
    return `${this.formatLabel(this.actionModal.action)} Case`;
  }

  get actionModalActionLabel(): string {
    return this.actionModal.action.replace(/_/g, ' ');
  }

  verificationChecks(kycCase: KYCCase): VerificationCheck[] {
    return Object.entries(kycCase.verificationChecks).map(([key, value]) => ({
      key,
      label: key.replace(/_/g, ' '),
      value,
    }));
  }

  riskPillClasses(risk: string): string {
    return cn('px-2 py-1 text-xs font-medium rounded-full border', getRiskColor(risk));
  }

  riskBadgeClasses(risk: string): string {
    return cn(
      'inline-block px-3 py-1 text-sm font-medium rounded-full border',
      getRiskColor(risk)
    );
  }

  checkDotClasses(passed: boolean): string {
    return cn('w-3 h-3 rounded-full', passed ? 'bg-green-500' : 'bg-red-500');
  }

  formatLabel(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDate(date: Date): string {
    return formatDate(date);
  }
}
