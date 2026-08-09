import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';

import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { CartItem } from '../../models/cart-item.interface';
import { getDiscountedPrice } from '../../utils/rating-price.util';

/**
 * Slide-in cart panel: lists line items with quantity controls, shows
 * the running total, and a (simulated — there's no backend) checkout
 * action. Open/closed state is owned by the root `App` component and
 * passed in, since the trigger button lives in the header, not here.
 */
@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSidebar {
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);

  readonly isOpen = input.required<boolean>();

  @Output() readonly close = new EventEmitter<void>();

  readonly items = this.cartService.items;
  readonly totalPrice = this.cartService.totalPrice;
  readonly isEmpty = this.cartService.isEmpty;

  /** The discounted line total (unit price × quantity) for one cart item. */
  lineTotal(item: CartItem): number {
    return getDiscountedPrice(item.product.price, item.product.discountPercentage) * item.quantity;
  }

  /** Increases a line item's quantity by one. */
  increment(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  /** Decreases a line item's quantity by one (removes it entirely once it reaches zero). */
  decrement(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity - 1);
  }

  /** Removes a line item from the cart regardless of its quantity. */
  remove(item: CartItem): void {
    this.cartService.removeFromCart(item.product.id);
  }

  /**
   * Simulates placing an order — there's no backend to submit to, so
   * this just confirms with a toast and empties the cart.
   */
  checkout(): void {
    if (this.isEmpty()) {
      return;
    }
    this.notificationService.showSuccess('Order placed! Thanks for shopping with us.');
    this.cartService.clearCart();
    this.close.emit();
  }

  /** Closes the sidebar when the shopper clicks outside it, on the dimmed backdrop. */
  onBackdropClick(): void {
    this.close.emit();
  }
}
