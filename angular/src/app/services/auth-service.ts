import { Injectable, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { User, UserRole } from '../types/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly currentUser$: Observable<User | null> = toObservable(this.currentUserSignal);
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  setCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  hasRole(role: UserRole): boolean {
    return this.currentUserSignal()?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserSignal();
    return user ? roles.includes(user.role) : false;
  }

  canApproveKYCHighRisk(): boolean {
    return this.hasAnyRole(['compliance', 'admin']);
  }

  canRefundAmount(amount: number): boolean {
    if (this.hasRole('admin')) return true;
    if (this.hasRole('support')) return amount <= 500;
    return false;
  }

  canModifyProductionFlags(): boolean {
    return this.hasRole('admin');
  }
}
