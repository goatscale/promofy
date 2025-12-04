import { describe, it, expect } from 'vitest';
import { run } from './run';

describe('product discounts function', () => {
  it('returns no discounts for less than 4 items', () => {
    const result = run({
      cart: {
        lines: [
          { id: '1', quantity: 1, cost: { amountPerQuantity: { amount: '10.0', currencyCode: 'USD' } } },
          { id: '2', quantity: 1, cost: { amountPerQuantity: { amount: '10.0', currencyCode: 'USD' } } },
          { id: '3', quantity: 1, cost: { amountPerQuantity: { amount: '10.0', currencyCode: 'USD' } } }
        ]
      }
    });
    expect(result.discounts).toHaveLength(0);
  });

  it('discounts 2 cheapest items for 4 items', () => {
    const result = run({
      discountNode: { metafield: { value: "{}" } },
      cart: {
        lines: [
          { id: '1', quantity: 1, cost: { amountPerQuantity: { amount: '10.0', currencyCode: 'USD' } } },
          { id: '2', quantity: 1, cost: { amountPerQuantity: { amount: '20.0', currencyCode: 'USD' } } },
          { id: '3', quantity: 1, cost: { amountPerQuantity: { amount: '30.0', currencyCode: 'USD' } } },
          { id: '4', quantity: 1, cost: { amountPerQuantity: { amount: '40.0', currencyCode: 'USD' } } }
        ]
      }
    });
    expect(result.discounts).toHaveLength(2);
  });

  it('discounts 4 cheapest items for 8 items if enabled', () => {
    const result = run({
      discountNode: { metafield: { value: JSON.stringify({ enableBuy8: true }) } },
      cart: {
        lines: [
          { id: '1', quantity: 8, cost: { amountPerQuantity: { amount: '10.0', currencyCode: 'USD' } } }
        ]
      }
    });
    // 8 items. Buy 8 enabled. 4 free.
    // Total discount = 4 * 10 = 40.
    expect(result.discounts).toHaveLength(1);
    expect(result.discounts[0].value.fixedAmount.amount).toBe('40');
  });

  it('discounts only 2 items for 8 items if tier disabled', () => {
    const result = run({
      discountNode: { metafield: { value: JSON.stringify({ enableBuy8: false }) } },
      cart: {
        lines: [
          { id: '1', quantity: 8, cost: { amountPerQuantity: { amount: '10.0', currencyCode: 'USD' } } }
        ]
      }
    });
    // 8 items. Buy 8 disabled. Fallback to Buy 4 (2 free).
    // Total discount = 2 * 10 = 20.
    expect(result.discounts).toHaveLength(1);
    expect(result.discounts[0].value.fixedAmount.amount).toBe('20');
  });

  it('discounts 6 cheapest items for 12 items if enabled', () => {
    const result = run({
      discountNode: { metafield: { value: JSON.stringify({ enableBuy12: true }) } },
      cart: {
        lines: [
          { id: '1', quantity: 12, cost: { amountPerQuantity: { amount: '10.0', currencyCode: 'USD' } } }
        ]
      }
    });
    // 12 items. Buy 12 enabled. 6 free.
    // Total discount = 6 * 10 = 60.
    expect(result.discounts).toHaveLength(1);
    expect(result.discounts[0].value.fixedAmount.amount).toBe('60');
  });
});