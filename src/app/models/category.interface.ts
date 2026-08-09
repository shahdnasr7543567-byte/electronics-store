/**
 * Represents one of the store's fixed product categories, used to
 * populate the category filter dropdown and to group related products.
 */
export interface Category {
  /** Unique category identifier. Matches {@link Product.categoryId}. */
  readonly id: number;

  /** Human-readable category name shown in the UI. */
  readonly name: string;

  /** Font Awesome icon class (e.g. `'fa-solid fa-laptop'`) shown next to the name. */
  readonly icon: string;
}
