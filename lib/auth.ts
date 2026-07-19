import { User, UserRole } from '../types/user';

class AuthService {
  private currentUser: User | null = null;

  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
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

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();
