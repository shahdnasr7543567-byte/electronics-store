import { Product } from './product.interface';

/**
 * One line item in the shopping cart: a snapshot of the product it
 * refers to plus the quantity the shopper has selected.
 *
 * Storing the full {@link Product} (rather than just an id) means the
 * cart sidebar and totals can render without a second lookup against
 * `ProductService`, and keeps working even if the product later
 * disappears from the catalog.
 */
export interface CartItem {
  /** The product this line item represents. */
  readonly product: Product;

  /** Number of units of this product in the cart. Always >= 1. */
  readonly quantity: number;
}
