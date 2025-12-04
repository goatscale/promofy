// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}"
  );
  const enableBuy8 = configuration.enableBuy8 === true;
  const enableBuy12 = configuration.enableBuy12 === true;

  const lines = input.cart.lines;

  // 1. Flatten lines into individual items
  const items = [];
  for (const line of lines) {
    const price = parseFloat(line.cost.amountPerQuantity.amount);
    for (let i = 0; i < line.quantity; i++) {
      items.push({
        lineId: line.id,
        price: price,
        originalLine: line
      });
    }
  }

  const totalItems = items.length;
  let itemsToDiscount = 0;

  // 2. Determine how many items to discount based on tiers
  if (totalItems >= 12 && enableBuy12) {
    itemsToDiscount = 6;
  } else if (totalItems >= 8 && enableBuy8) {
    itemsToDiscount = 4;
  } else if (totalItems >= 4) {
    itemsToDiscount = 2;
  } else {
    return EMPTY_DISCOUNT;
  }

  // 3. Sort by price ascending
  items.sort((a, b) => a.price - b.price);

  // 4. Take the cheapest items
  const freeItems = items.slice(0, itemsToDiscount);

  // 5. Group discounts by line
  const discountMap = new Map();

  for (const item of freeItems) {
    const currentDiscount = discountMap.get(item.lineId) || 0;
    discountMap.set(item.lineId, currentDiscount + item.price);
  }

  // 6. Create discount objects
  const discounts = [];
  for (const [lineId, amount] of discountMap.entries()) {
    if (amount > 0) {
      discounts.push({
        targets: [
          {
            cartLine: {
              id: lineId
            }
          }
        ],
        value: {
          fixedAmount: {
            amount: amount.toString()
          }
        },
        message: "Buy 4 Pay 2 (Cheapest Free)"
      });
    }
  }

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.All,
    discounts: discounts,
  };
};