import { describe, it, expect } from 'vitest';
import { selectCheapest } from '../SelectionPolicy';
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

describe('selectCheapest', () => {
  it('returns the only product when array has one item', () => {
    const product = makeProduct({ id: 'only', price: 9.99 });
    expect(selectCheapest([product])).toBe(product);
  });

  it('returns the cheapest when it is last in the array', () => {
    const products = [
      makeProduct({ id: 'expensive', price: 49.99 }),
      makeProduct({ id: 'mid', price: 29.99 }),
      makeProduct({ id: 'cheap', price: 7.99 }),
    ];
    expect(selectCheapest(products).id).toBe('cheap');
  });

  it('returns the cheapest when it is first in the array', () => {
    const products = [
      makeProduct({ id: 'cheap', price: 7.99 }),
      makeProduct({ id: 'mid', price: 29.99 }),
      makeProduct({ id: 'expensive', price: 49.99 }),
    ];
    expect(selectCheapest(products).id).toBe('cheap');
  });

  it('returns the first product when two share the lowest price', () => {
    const products = [
      makeProduct({ id: 'first', price: 7.99 }),
      makeProduct({ id: 'second', price: 7.99 }),
    ];
    expect(selectCheapest(products).id).toBe('first');
  });

  it('throws with correct message when array is empty', () => {
    expect(() => selectCheapest([])).toThrow('Selection failed: No products to select from');
  });

  it('does not mutate the original array', () => {
    const products = [
      makeProduct({ id: 'expensive', price: 49.99 }),
      makeProduct({ id: 'cheap', price: 7.99 }),
    ];
    const originalOrder = products.map((p) => p.id);
    selectCheapest(products);
    expect(products.map((p) => p.id)).toEqual(originalOrder);
  });
});
