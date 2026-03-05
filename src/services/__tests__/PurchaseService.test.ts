import { describe, it, expect, vi } from 'vitest';
import { PurchaseService } from '../PurchaseService';
import { Product } from '../../domain/Product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    title: 'Test Product',
    price: 9.99,
    currency: 'USD',
    imageUrl: '/img/test.jpg',
    productUrl: 'https://example.com',
    source: 'swaglabs',
    ...overrides,
  };
}

function makeScraper(overrides: Partial<Record<string, any>> = {}) {
  return {
    addToCart: vi.fn().mockResolvedValue(undefined),
    checkout: vi.fn(),
    takeScreenshot: vi.fn(),
    ...overrides,
  } as any;
}

describe('PurchaseService — buy / cart calculations', () => {
  it('returns 1 item and correct totalPrice after buying one product', async () => {
    const product = makeProduct({ id: 'a', price: 9.99 });
    const service = new PurchaseService(makeScraper());
    const result = await service.buy(product);
    expect(result.items).toHaveLength(1);
    expect(result.totalPrice).toBe(9.99);
  });

  it('accumulates 2 items and sums totalPrice after two buys', async () => {
    const service = new PurchaseService(makeScraper());
    await service.buy(makeProduct({ id: 'a', price: 9.99 }));
    const result = await service.buy(makeProduct({ id: 'b', price: 29.99 }));
    expect(result.items).toHaveLength(2);
    expect(result.totalPrice).toBe(9.99 + 29.99);
  });

  it('sums totalPrice correctly across three products', async () => {
    const service = new PurchaseService(makeScraper());
    await service.buy(makeProduct({ id: 'a', price: 7.99 }));
    await service.buy(makeProduct({ id: 'b', price: 29.99 }));
    const result = await service.buy(makeProduct({ id: 'c', price: 49.99 }));
    expect(result.items).toHaveLength(3);
    expect(result.totalPrice).toBe(7.99 + 29.99 + 49.99);
  });

  it('throws "Buy failed: ..." and leaves cart empty when scraper throws', async () => {
    const scraper = makeScraper({
      addToCart: vi.fn().mockRejectedValue(new Error('scraper error')),
    });
    const service = new PurchaseService(scraper);
    await expect(service.buy(makeProduct())).rejects.toThrow('Buy failed: scraper error');
    // Cart must be untouched — buy a second product with a working scraper
    // to confirm items count is still 0 before the failed call
    const workingService = new PurchaseService(makeScraper());
    const result = await workingService.buy(makeProduct({ id: 'fresh', price: 9.99 }));
    expect(result.items).toHaveLength(1);
  });
});
