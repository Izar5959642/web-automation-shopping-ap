import { describe, it, expect, vi } from 'vitest';
import { SearchService } from '../SearchService';
import { RawProduct } from '../../domain/RawProduct';

function makeRaw(overrides: Partial<RawProduct> = {}): RawProduct {
  return {
    id: 'test-product',
    title: 'Test Product',
    price: '$9.99',
    currency: 'USD',
    imageUrl: '/img/test.jpg',
    productUrl: 'https://example.com',
    source: 'swaglabs',
    ...overrides,
  };
}

function makeScraper(products: RawProduct[]) {
  return { search: vi.fn().mockResolvedValue(products) } as any;
}

// --- Price normalization ---

describe('SearchService — price normalization', () => {
  it('strips $ from "$7.99"', async () => {
    const service = new SearchService(makeScraper([makeRaw({ price: '$7.99' })]));
    const [product] = await service.search('Test');
    expect(product.price).toBe(7.99);
  });

  it('handles two-digit dollar amount "$29.99"', async () => {
    const service = new SearchService(makeScraper([makeRaw({ price: '$29.99' })]));
    const [product] = await service.search('Test');
    expect(product.price).toBe(29.99);
  });

  it('strips comma from "$1,299.00"', async () => {
    const service = new SearchService(makeScraper([makeRaw({ price: '$1,299.00' })]));
    const [product] = await service.search('Test');
    expect(product.price).toBe(1299.00);
  });

  it('handles plain number without symbol "10.00"', async () => {
    const service = new SearchService(makeScraper([makeRaw({ price: '10.00' })]));
    const [product] = await service.search('Test');
    expect(product.price).toBe(10.00);
  });

  it('returns NaN for non-numeric price "FREE"', async () => {
    const service = new SearchService(makeScraper([makeRaw({ price: 'FREE' })]));
    const [product] = await service.search('Test');
    expect(product.price).toBeNaN();
  });
});

// --- maxPrice filtering ---

describe('SearchService — maxPrice filtering', () => {
  it('returns only products at or below maxPrice', async () => {
    const scraper = makeScraper([
      makeRaw({ id: 'cheap', title: 'Cheap Product', price: '$7.99' }),
      makeRaw({ id: 'expensive', title: 'Expensive Product', price: '$29.99' }),
    ]);
    const service = new SearchService(scraper);
    const results = await service.search('Product', 10);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('cheap');
  });

  it('returns all products when maxPrice is undefined', async () => {
    const scraper = makeScraper([
      makeRaw({ id: 'a', title: 'Product A', price: '$7.99' }),
      makeRaw({ id: 'b', title: 'Product B', price: '$29.99' }),
    ]);
    const service = new SearchService(scraper);
    const results = await service.search('Product');
    expect(results).toHaveLength(2);
  });
});

// --- query filtering ---

describe('SearchService — query filtering', () => {
  it('filters by title case-insensitively', async () => {
    const scraper = makeScraper([
      makeRaw({ id: 'backpack', title: 'Sauce Labs Backpack', price: '$29.99' }),
      makeRaw({ id: 'fleece', title: 'Sauce Labs Fleece Jacket', price: '$49.99' }),
    ]);
    const service = new SearchService(scraper);
    const results = await service.search('backpack');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('backpack');
  });
});
