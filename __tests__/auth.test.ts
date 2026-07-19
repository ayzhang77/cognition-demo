import { authService } from '../lib/auth';
import { MOCK_USERS } from '../types/user';

describe('AuthService', () => {
  beforeEach(() => {
    authService.setCurrentUser(MOCK_USERS[0]); // Reset to support agent
  });

  describe('Role-based access control', () => {
    it('should allow admin to refund any amount', () => {
      authService.setCurrentUser(MOCK_USERS[2]); // Admin
      expect(authService.canRefundAmount(1000)).toBe(true);
      expect(authService.canRefundAmount(500)).toBe(true);
      expect(authService.canRefundAmount(100)).toBe(true);
    });

    it('should allow support agent to refund up to $500', () => {
      authService.setCurrentUser(MOCK_USERS[0]); // Support
      expect(authService.canRefundAmount(500)).toBe(true);
      expect(authService.canRefundAmount(100)).toBe(true);
      expect(authService.canRefundAmount(501)).toBe(false);
      expect(authService.canRefundAmount(1000)).toBe(false);
    });

    it('should allow compliance and admin to approve high-risk KYC', () => {
      authService.setCurrentUser(MOCK_USERS[1]); // Compliance
      expect(authService.canApproveKYCHighRisk()).toBe(true);
      
      authService.setCurrentUser(MOCK_USERS[2]); // Admin
      expect(authService.canApproveKYCHighRisk()).toBe(true);
    });

    it('should not allow support agent to approve high-risk KYC', () => {
      authService.setCurrentUser(MOCK_USERS[0]); // Support
      expect(authService.canApproveKYCHighRisk()).toBe(false);
    });

    it('should only allow admin to modify production flags', () => {
      authService.setCurrentUser(MOCK_USERS[2]); // Admin
      expect(authService.canModifyProductionFlags()).toBe(true);
      
      authService.setCurrentUser(MOCK_USERS[0]); // Support
      expect(authService.canModifyProductionFlags()).toBe(false);
      
      authService.setCurrentUser(MOCK_USERS[1]); // Compliance
      expect(authService.canModifyProductionFlags()).toBe(false);
    });
  });

  describe('User management', () => {
    it('should set and get current user', () => {
      authService.setCurrentUser(MOCK_USERS[1]);
      expect(authService.getCurrentUser()?.name).toBe('Priya Shah');
    });

    it('should check specific roles', () => {
      authService.setCurrentUser(MOCK_USERS[0]);
      expect(authService.hasRole('support')).toBe(true);
      expect(authService.hasRole('admin')).toBe(false);
    });

    it('should check if user has any of specified roles', () => {
      authService.setCurrentUser(MOCK_USERS[1]);
      expect(authService.hasAnyRole(['compliance', 'admin'])).toBe(true);
      expect(authService.hasAnyRole(['support', 'admin'])).toBe(false);
    });
  });
});
