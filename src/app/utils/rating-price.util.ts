/**
 * Applies a product's `discountPercentage` to its `price`, rounded to
 * 2 decimal places. Returns the original price unchanged when there's
 * no discount.
 */
export function getDiscountedPrice(price: number, discountPercentage: number): number {
  if (discountPercentage <= 0) {
    return price;
  }
  return Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
}

/**
 * Converts a 0–5 numeric rating into 5 booleans (filled/empty),
 * rounded to the nearest whole star, for driving a star-icon display.
 */
export function getRatingStars(rating: number): boolean[] {
  const filledCount = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => index < filledCount);
}
