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
import { formatCurrency, formatDate } from '../lib/utils';
import { AuthService } from '../services/auth-service';
import { RefundService } from '../services/refund-service';
import { Payment, Refund, RefundAction } from '../types/refund';

interface RefundFilters {
  search: string;
  refundStatus: string;
  minAmount: string;
  maxAmount: string;
  risk: string;
}

@Component({
  selector: 'app-refunds',
  imports: [AuditLog, Button, Card, Modal, ModalFooter, StatusBadge, Table],
  templateUrl: './refunds.html',
})
export class Refunds implements OnInit {
  private readonly refundService = inject(RefundService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterChanges = new Subject<void>();

  @ViewChild('customerCell', { static: true })
  customerCell!: TemplateRef<TableCellContext<Payment>>;
  @ViewChild('amountCell', { static: true })
  amountCell!: TemplateRef<TableCellContext<Payment>>;
  @ViewChild('refundableCell', { static: true })
  refundableCell!: TemplateRef<TableCellContext<Payment>>;
  @ViewChild('refundHistoryCell', { static: true })
  refundHistoryCell!: TemplateRef<TableCellContext<Payment>>;
  @ViewChild('paymentDateCell', { static: true })
  paymentDateCell!: TemplateRef<TableCellContext<Payment>>;

  readonly currentUser = this.authService.currentUser;

  payments: Payment[] = [];
  loading = true;
  selectedPayment: Payment | null = null;
  refundModal = { isOpen: false, amount: '', reason: '' };
  actionModal: { isOpen: boolean; action: RefundAction; refundId: string } = {
    isOpen: false,
    action: 'approve',
    refundId: '',
  };
  notes = '';
  error: string | null = null;
  filters: RefundFilters = {
    search: '',
    refundStatus: '',
    minAmount: '',
    maxAmount: '',
    risk: '',
  };

  columns: TableColumn<Payment>[] = [];

  ngOnInit(): void {
    this.columns = [
      {
        key: 'id',
        header: 'Payment ID',
        className: 'font-medium',
      },
      {
        key: 'customerName',
        header: 'Customer',
        cell: this.customerCell,
      },
      {
        key: 'amount',
        header: 'Amount',
        cell: this.amountCell,
      },
      {
        key: 'refundableAmount',
        header: 'Refundable',
        cell: this.refundableCell,
      },
      {
        key: 'refundHistory',
        header: 'Refunds',
        cell: this.refundHistoryCell,
      },
      {
        key: 'paymentDate',
        header: 'Payment Date',
        cell: this.paymentDateCell,
      },
    ];

    this.filterChanges
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.loading = true;
          return from(
            this.refundService.getPayments({
              search: this.filters.search || undefined,
              refundStatus: this.filters.refundStatus || undefined,
              minAmount: this.filters.minAmount ? parseFloat(this.filters.minAmount) : undefined,
              maxAmount: this.filters.maxAmount ? parseFloat(this.filters.maxAmount) : undefined,
              risk: this.filters.risk || undefined,
            })
          ).pipe(
            catchError(() => {
              this.error = 'Failed to load payments';
              this.loading = false;
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(payments => {
        this.payments = payments;
        this.loading = false;
      });
  }

  loadPayments(): void {
    this.filterChanges.next();
  }

  updateFilter<K extends keyof RefundFilters>(key: K, value: string): void {
    this.filters = { ...this.filters, [key]: value };
    this.loadPayments();
  }

  async handleRequestRefund(): Promise<void> {
    const currentUser = this.currentUser();
    if (!this.selectedPayment || !currentUser) return;

    try {
      const amount = parseFloat(this.refundModal.amount);

      // UX hint only - authorization is enforced inside RefundService
      if (!this.authService.canRefundAmount(amount)) {
        this.error =
          'Support agents may only refund up to $500. Amounts above $500 require Finance admin approval.';
        return;
      }

      if (amount > this.selectedPayment.refundableAmount) {
        this.error = 'Refund amount exceeds refundable amount';
        return;
      }

      if (!this.refundModal.reason.trim()) {
        this.error = 'Please provide a reason for the refund';
        return;
      }

      await this.refundService.requestRefund(
        this.selectedPayment.id,
        amount,
        this.refundModal.reason
      );

      this.refundModal = { isOpen: false, amount: '', reason: '' };
      this.selectedPayment = null;
      this.error = null;
      this.loadPayments();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to request refund';
    }
  }

  async handleRefundAction(): Promise<void> {
    const currentUser = this.currentUser();
    if (!this.actionModal.refundId || !currentUser) return;

    try {
      if (!this.notes.trim()) {
        this.error = 'Please provide a reason for this action';
        return;
      }

      await this.refundService.processRefundAction(
        this.actionModal.refundId,
        this.actionModal.action,
        this.notes
      );

      this.actionModal = { isOpen: false, action: 'approve', refundId: '' };
      this.notes = '';
      this.selectedPayment = null;
      this.error = null;
      this.loadPayments();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to process action';
    }
  }

  openRefundModal(): void {
    if (!this.selectedPayment) return;
    this.refundModal = {
      isOpen: true,
      amount: this.selectedPayment.refundableAmount.toString(),
      reason: '',
    };
  }

  closeRefundModal(): void {
    this.refundModal = { isOpen: false, amount: '', reason: '' };
  }

  openActionModal(action: RefundAction, refundId: string): void {
    this.actionModal = { isOpen: true, action, refundId };
  }

  closeActionModal(): void {
    this.actionModal = { isOpen: false, action: 'approve', refundId: '' };
  }

  canRefundAmount(amount: number): boolean {
    return this.authService.canRefundAmount(amount);
  }

  /** Mirrors `disabled={!authService.canRefundAmount(parseFloat(refundModal.amount) || 0)}`. */
  get requestRefundDisabled(): boolean {
    return !this.authService.canRefundAmount(parseFloat(this.refundModal.amount) || 0);
  }

  get requestRefundOverLimit(): boolean {
    return parseFloat(this.refundModal.amount) > 500 && this.currentUser()?.role === 'support';
  }

  get requestRefundBlockedByLimit(): boolean {
    return (
      !!this.selectedPayment &&
      this.selectedPayment.refundableAmount > 500 &&
      this.currentUser()?.role === 'support'
    );
  }

  get actionModalRefund(): Refund | undefined {
    return this.selectedPayment?.refundHistory.find(r => r.id === this.actionModal.refundId);
  }

  get actionModalTitle(): string {
    return `${this.formatAction(this.actionModal.action)} Refund`;
  }

  get actionModalActionLabel(): string {
    return this.actionModal.action.replace(/_/g, ' ');
  }

  /** Mirrors the compound `disabled` expression on the action modal's confirm button. */
  get actionConfirmDisabled(): boolean {
    if (this.actionModal.action !== 'approve') return false;
    const refund = this.actionModalRefund;
    if (!refund) return false;
    return !this.authService.canRefundAmount(refund.amount);
  }

  get actionModalOverLimit(): boolean {
    if (this.actionModal.action !== 'approve') return false;
    const refund = this.actionModalRefund;
    return !!refund && !this.authService.canRefundAmount(refund.amount);
  }

  formatCurrency(amount: number, currency?: string): string {
    return formatCurrency(amount, currency);
  }

  formatDate(date: Date): string {
    return formatDate(date);
  }

  private formatAction(action: string): string {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
