import { refundService } from '../services/refund-service';
import { MOCK_PAYMENTS } from '../services/mock-data';
import { MOCK_USERS } from '../types/user';

const SUPPORT = MOCK_USERS[0];
const COMPLIANCE = MOCK_USERS[1];
const ADMIN = MOCK_USERS[2];

const PRISTINE_PAYMENTS = MOCK_PAYMENTS.map(payment => ({
  refundableAmount: payment.refundableAmount,
  refundHistory: [...payment.refundHistory]
}));

describe('Refund Validation', () => {
  beforeEach(() => {
    MOCK_PAYMENTS.forEach((payment, index) => {
      payment.refundableAmount = PRISTINE_PAYMENTS[index].refundableAmount;
      payment.refundHistory = [...PRISTINE_PAYMENTS[index].refundHistory];
    });
  });

  describe('Refund amount validation', () => {
    it('should prevent refunding more than refundable amount', async () => {
      const payment = MOCK_PAYMENTS[0]; // $150 refundable
      await expect(
        refundService.requestRefund(payment.id, 200, ADMIN, 'Test reason')
      ).rejects.toThrow('Refund amount exceeds refundable amount');
    });

    it('should allow refunding exactly the refundable amount', async () => {
      const payment = MOCK_PAYMENTS[0]; // $150 refundable
      const refund = await refundService.requestRefund(payment.id, 150, SUPPORT, 'Test reason');
      expect(refund.amount).toBe(150);
    });

    it('should allow partial refunds', async () => {
      const payment = MOCK_PAYMENTS[1]; // $750 refundable
      const refund = await refundService.requestRefund(payment.id, 100, SUPPORT, 'Partial refund');
      expect(refund.amount).toBe(100);
    });
  });

  describe('Refund authorization', () => {
    it('should reject support requests above the $500 limit', async () => {
      const payment = MOCK_PAYMENTS[1]; // $750 refundable
      await expect(
        refundService.requestRefund(payment.id, 600, SUPPORT, 'Over limit')
      ).rejects.toThrow('Support agents may only refund up to $500');
    });

    it('should reject requests from roles without refund permission', async () => {
      const payment = MOCK_PAYMENTS[1];
      await expect(
        refundService.requestRefund(payment.id, 100, COMPLIANCE, 'Not permitted')
      ).rejects.toThrow('not permitted to process refunds');
    });

    it('should not mutate refundable amount when authorization fails', async () => {
      const payment = MOCK_PAYMENTS[1];
      const before = payment.refundableAmount;
      await expect(
        refundService.requestRefund(payment.id, 600, SUPPORT, 'Over limit')
      ).rejects.toThrow();
      expect(payment.refundableAmount).toBe(before);
    });

    it('should reject approval of a refund above the approver limit', async () => {
      const payment = MOCK_PAYMENTS[3]; // $1200 refundable
      const refund = await refundService.requestRefund(payment.id, 900, ADMIN, 'Large refund');

      await expect(
        refundService.processRefundAction(refund.id, 'approve', SUPPORT, 'Approving over limit')
      ).rejects.toThrow('Support agents may only refund up to $500');

      const stored = payment.refundHistory.find(r => r.id === refund.id);
      expect(stored?.status).toBe('pending');
    });

    it('should allow admin to approve a refund above the support limit', async () => {
      const payment = MOCK_PAYMENTS[1]; // $750 refundable
      const refund = await refundService.requestRefund(payment.id, 600, ADMIN, 'Large refund');
      const processed = await refundService.processRefundAction(refund.id, 'approve', ADMIN, 'Approved');
      expect(processed.status).toBe('processed');
    });
  });

  describe('Refund risk calculation', () => {
    it('should mark high amounts as high risk', async () => {
      const payment = MOCK_PAYMENTS[3]; // $1200 refundable
      const refund = await refundService.requestRefund(payment.id, 1100, ADMIN, 'Test reason');
      expect(refund.risk).toBe('high');
    });

    it('should mark medium amounts as medium risk', async () => {
      const payment = MOCK_PAYMENTS[1]; // $750 refundable
      const refund = await refundService.requestRefund(payment.id, 600, ADMIN, 'Test reason');
      expect(refund.risk).toBe('medium');
    });

    it('should mark low amounts as low risk', async () => {
      const payment = MOCK_PAYMENTS[4]; // $50 refundable
      const refund = await refundService.requestRefund(payment.id, 25, SUPPORT, 'Test reason');
      expect(refund.risk).toBe('low');
    });
  });

  describe('Refundable amount tracking', () => {
    it('should decrement refundable amount on request and restore it on rejection', async () => {
      const payment = MOCK_PAYMENTS[1]; // $750 refundable
      const refund = await refundService.requestRefund(payment.id, 200, SUPPORT, 'Test reason');
      expect(payment.refundableAmount).toBe(550);

      await refundService.processRefundAction(refund.id, 'reject', SUPPORT, 'Not valid');
      expect(payment.refundableAmount).toBe(750);
    });
  });
});
