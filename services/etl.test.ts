import { ETLService } from './etl';

// Mock supabase to avoid initialization errors
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

describe('ETLService', () => {
  describe('parseWhatsAppMessage', () => {
    it('should parse products with dash separator', async () => {
      const message = 'Cemento Argos - 35000\nVarilla 1/2 - 25000';
      const vendorId = 'vendor-123';
      const products = await ETLService.parseWhatsAppMessage(message, vendorId);

      expect(products).toHaveLength(2);
      expect(products[0]).toEqual({
        name: 'Cemento Argos',
        price: 35000,
        stock: 0,
        unit_measure: 'unid',
        category: 'otros'
      });
    });

    it('should parse products with colon separator', async () => {
      const message = 'Ladrillo: 1200\nArena: 50000';
      const products = await ETLService.parseWhatsAppMessage('', 'v1'); // message is ignored in loop if empty but let's test correctly
      const results = await ETLService.parseWhatsAppMessage(message, 'v1');

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Ladrillo');
      expect(results[0].price).toBe(1200);
    });

    it('should handle empty or invalid lines', async () => {
      const message = 'Invalid line\n\nAnother invalid: abc';
      const products = await ETLService.parseWhatsAppMessage(message, 'v1');
      expect(products).toHaveLength(0);
    });
  });
});
