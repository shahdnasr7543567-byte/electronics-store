import { Injectable, computed, signal } from '@angular/core';

import { CartItem } from '../models/cart-item.interface';
import { Product } from '../models/product.interface';

/** localStorage key the cart is persisted under. */
const CART_STORAGE_KEY = 'electronics_cart';

/**
 * Owns the shopping cart state for the whole app.
 *
 * State lives in a signal and is mirrored to `localStorage` on every
 * change, so the cart survives page reloads without needing a backend.
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartItemsSignal = signal<CartItem[]>(this.loadFromLocalStorage());

  readonly items = this.cartItemsSignal.asReadonly();

  /** Total number of units across all line items (not just distinct products). */
  readonly totalItems = computed(() => this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0));

  /** Total price across all line items, using each product's discounted price where one applies. */
  readonly totalPrice = computed(() =>
    this.cartItemsSignal().reduce((sum, item) => sum + this.effectiveUnitPrice(item.product) * item.quantity, 0),
  );

  readonly isEmpty = computed(() => this.cartItemsSignal().length === 0);

  /**
   * Adds a product to the cart, or increases its quantity if it's
   * already present.
   */
  addToCart(product: Product, quantity = 1): void {
    const items = this.cartItemsSignal();
    const existingIndex = items.findIndex((item) => item.product.id === product.id);

    if (existingIndex === -1) {
      this.setItems([...items, { product, quantity }]);
      return;
    }

    const updated = [...items];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + quantity,
    };
    this.setItems(updated);
  }

  /** Removes a product from the cart entirely, regardless of quantity. */
  removeFromCart(productId: number): void {
    this.setItems(this.cartItemsSignal().filter((item) => item.product.id !== productId));
  }

  /**
   * Sets a line item's quantity directly (e.g. from a quantity input).
   * A quantity of 0 or less removes the item.
   */
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const updated = this.cartItemsSignal().map((item) => (item.product.id === productId ? { ...item, quantity } : item));
    this.setItems(updated);
  }

  /** Empties the cart. */
  clearCart(): void {
    this.setItems([]);
  }

  /** Looks up a single line item by product id, if it's in the cart. */
  getItem(productId: number): CartItem | undefined {
    return this.cartItemsSignal().find((item) => item.product.id === productId);
  }

  /** The price actually charged per unit, after applying `discountPercentage`. */
  private effectiveUnitPrice(product: Product): number {
    return product.discountPercentage > 0 ? product.price * (1 - product.discountPercentage / 100) : product.price;
  }

  private setItems(items: CartItem[]): void {
    this.cartItemsSignal.set(items);
    this.saveToLocalStorage(items);
  }

  private saveToLocalStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage can be unavailable (private browsing, storage quota).
      // The cart keeps working in-memory for the rest of the session.
    }
  }

  private loadFromLocalStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }
}
