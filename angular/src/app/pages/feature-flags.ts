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
import { cn, formatDate } from '../lib/utils';
import { AuthService } from '../services/auth-service';
import { FeatureFlagService } from '../services/feature-flag-service';
import { Environment, FeatureFlag, FlagAction } from '../types/feature-flag';
import { MOCK_USERS, User } from '../types/user';

interface FlagFilters {
  environment: string;
  state: string;
}

interface EditModalState {
  isOpen: boolean;
  action: FlagAction;
  enabledUserIds: string[];
  environment: Environment;
  reason: string;
}

const CLOSED_EDIT_MODAL: EditModalState = {
  isOpen: false,
  action: 'enable',
  enabledUserIds: [],
  environment: 'development',
  reason: '',
};

function environmentColor(environment: Environment | string): string {
  return environment === 'production'
    ? 'bg-red-50 text-red-700 border-red-200'
    : environment === 'staging'
      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';
}

@Component({
  selector: 'app-feature-flags',
  imports: [AuditLog, Button, Card, Modal, ModalFooter, StatusBadge, Table],
  templateUrl: './feature-flags.html',
})
export class FeatureFlags implements OnInit {
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterChanges = new Subject<void>();

  @ViewChild('descriptionCell', { static: true })
  descriptionCell!: TemplateRef<TableCellContext<FeatureFlag>>;
  @ViewChild('environmentCell', { static: true })
  environmentCell!: TemplateRef<TableCellContext<FeatureFlag>>;
  @ViewChild('stateCell', { static: true })
  stateCell!: TemplateRef<TableCellContext<FeatureFlag>>;
  @ViewChild('enabledUsersCell', { static: true })
  enabledUsersCell!: TemplateRef<TableCellContext<FeatureFlag>>;
  @ViewChild('lastModifiedCell', { static: true })
  lastModifiedCell!: TemplateRef<TableCellContext<FeatureFlag>>;

  readonly currentUser = this.authService.currentUser;
  readonly users = MOCK_USERS;

  flags: FeatureFlag[] = [];
  loading = true;
  selectedFlag: FeatureFlag | null = null;
  editModal: EditModalState = { ...CLOSED_EDIT_MODAL };
  error: string | null = null;
  filters: FlagFilters = {
    environment: '',
    state: '',
  };

  columns: TableColumn<FeatureFlag>[] = [];

  ngOnInit(): void {
    this.columns = [
      {
        key: 'name',
        header: 'Flag Name',
        className: 'font-medium',
      },
      {
        key: 'description',
        header: 'Description',
        cell: this.descriptionCell,
      },
      {
        key: 'environment',
        header: 'Environment',
        cell: this.environmentCell,
      },
      {
        key: 'state',
        header: 'State',
        cell: this.stateCell,
      },
      {
        key: 'enabledUserIds',
        header: 'Enabled Users',
        cell: this.enabledUsersCell,
      },
      {
        key: 'lastModifiedAt',
        header: 'Last Modified',
        cell: this.lastModifiedCell,
      },
    ];

    this.filterChanges
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.loading = true;
          return from(
            this.featureFlagService.getFlags({
              environment: this.filters.environment || undefined,
              state: this.filters.state || undefined,
            })
          ).pipe(
            catchError(() => {
              this.error = 'Failed to load feature flags';
              this.loading = false;
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(flags => {
        this.flags = flags;
        this.loading = false;
      });
  }

  loadFlags(): void {
    this.filterChanges.next();
  }

  updateFilter<K extends keyof FlagFilters>(key: K, value: string): void {
    this.filters = { ...this.filters, [key]: value };
    this.loadFlags();
  }

  async handleFlagAction(): Promise<void> {
    const currentUser = this.currentUser();
    if (!this.selectedFlag || !currentUser) return;

    try {
      // Check authorization for production changes
      if (
        this.editModal.environment === 'production' &&
        !this.authService.canModifyProductionFlags()
      ) {
        this.error = 'Production changes require Admin role';
        return;
      }

      if (this.editModal.environment === 'production' && !this.editModal.reason.trim()) {
        this.error = 'Production changes require a reason';
        return;
      }

      await this.featureFlagService.performAction(
        this.selectedFlag.id,
        this.editModal.action,
        currentUser.id,
        currentUser.name,
        this.editModal.reason,
        {
          enabledUserIds: this.editModal.enabledUserIds,
          environment: this.editModal.environment,
        }
      );

      this.editModal = { ...CLOSED_EDIT_MODAL };
      this.selectedFlag = null;
      this.error = null;
      this.loadFlags();
    } catch {
      this.error = 'Failed to update feature flag';
    }
  }

  openEditModal(action: FlagAction): void {
    if (!this.selectedFlag) return;
    this.editModal = {
      isOpen: true,
      action,
      enabledUserIds: this.selectedFlag.enabledUserIds,
      environment: this.selectedFlag.environment,
      reason: '',
    };
  }

  closeEditModal(): void {
    this.editModal = { ...CLOSED_EDIT_MODAL };
  }

  toggleUser(userId: string, checked: boolean): void {
    this.editModal = {
      ...this.editModal,
      enabledUserIds: checked
        ? [...this.editModal.enabledUserIds, userId]
        : this.editModal.enabledUserIds.filter(id => id !== userId),
    };
  }

  updateEnvironment(environment: Environment): void {
    this.editModal = { ...this.editModal, environment };
  }

  get selectedFlagProductionBlocked(): boolean {
    return (
      this.selectedFlag?.environment === 'production' &&
      !this.authService.canModifyProductionFlags()
    );
  }

  get editProductionBlocked(): boolean {
    return (
      this.editModal.environment === 'production' && !this.authService.canModifyProductionFlags()
    );
  }

  get editModalTitle(): string {
    return `${this.formatLabel(this.editModal.action)} Flag`;
  }

  get reasonPlaceholder(): string {
    return this.editModal.environment === 'production'
      ? 'Required for production changes...'
      : 'Enter reason (optional)...';
  }

  enabledUsers(flag: FeatureFlag): User[] {
    return flag.enabledUserIds
      .map(userId => MOCK_USERS.find(u => u.id === userId))
      .filter((user): user is User => user !== undefined);
  }

  enabledUsersLabel(userIds: string[], flag: FeatureFlag): string {
    if (flag.state === 'enabled') return 'All Users';
    if (flag.state === 'disabled') return 'None';
    return this.getUserNames(userIds);
  }

  environmentPillClasses(environment: Environment): string {
    return cn('px-2 py-1 text-xs font-medium rounded-full border', environmentColor(environment));
  }

  environmentBadgeClasses(environment: Environment): string {
    return cn(
      'inline-block px-3 py-1 text-sm font-medium rounded-full border',
      environmentColor(environment)
    );
  }

  formatDate(date: Date): string {
    return formatDate(date);
  }

  private getUserNames(userIds: string[]): string {
    return userIds.map(id => MOCK_USERS.find(u => u.id === id)?.name || 'Unknown').join(', ');
  }

  private formatLabel(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
