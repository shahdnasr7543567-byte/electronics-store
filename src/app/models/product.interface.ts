/**
 * Represents a single sellable item in the store.
 *
 * Shaped to be a superset of what DummyJSON's `/products` endpoint returns,
 * so API data and local mock data can be normalized into the exact same
 * object without any component needing to know which source it came from.
 */
export interface Product {
  /** Unique product identifier. */
  readonly id: number;

  /** Display name of the product. */
  readonly title: string;

  /** Full marketing/description text. */
  readonly description: string;

  /** Current selling price, in USD. */
  readonly price: number;

  /**
   * Discount percentage (0–100) used to derive a "was" price for display.
   * `0` means no discount is shown.
   */
  readonly discountPercentage: number;

  /** Average customer rating, 0–5. */
  readonly rating: number;

  /** Units currently available. `0` means out of stock. */
  readonly stock: number;

  /** Brand or manufacturer name. */
  readonly brand: string;

  /** Foreign key into {@link Category.id} — which category this product belongs to. */
  readonly categoryId: number;

  /** Primary image shown in cards and thumbnails. */
  readonly thumbnail: string;

  /** Additional gallery images (falls back to `[thumbnail]` when a source has none). */
  readonly images: readonly string[];
}
