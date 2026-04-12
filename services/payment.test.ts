import { simulatePayment } from './payment';

describe('payment service', () => {
  it('should return a result with success boolean and optional transactionId/error', async () => {
    const result = await simulatePayment(10000);

    expect(typeof result.success).toBe('boolean');
    if (result.success) {
      expect(result.transactionId).toBeDefined();
      expect(result.transactionId).toMatch(/^TX-/);
    } else {
      expect(result.error).toBeDefined();
    }
  });

  it('should take some time to simulate network delay', async () => {
    const start = Date.now();
    await simulatePayment(100);
    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(1400); // 1500ms delay in code
  });
});
