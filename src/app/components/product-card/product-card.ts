import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Product } from '../../models/product.interface';
import { ShortDescriptionPipe } from '../../pipes/short-description.pipe';
import { ZoomDirective } from '../../directives/zoom.directive';
import { getDiscountedPrice, getRatingStars } from '../../utils/rating-price.util';

/**
 * Renders a single product as a card: image, discount badge, stock
 * status, star rating, price, and an "Add to Cart" button.
 *
 * Deliberately has no knowledge of `CartService` or `NotificationService`
 * — it only reports intent via {@link addToCart}. That keeps this
 * component reusable anywhere a product needs to be shown (grid,
 * related products, wishlist) without dragging cart side-effects along.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ShortDescriptionPipe, ZoomDirective],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  /** The product to render. Required — this component has no meaningful empty state. */
  readonly product = input.required<Product>();

  /** Emitted when the shopper clicks "Add to Cart", carrying the product to add. */
  @Output() readonly addToCart = new EventEmitter<Product>();

  readonly isInStock = computed(() => this.product().stock > 0);

  readonly hasDiscount = computed(() => this.product().discountPercentage > 0);

  /** Price after applying `discountPercentage`, rounded to 2 decimals. */
  readonly discountedPrice = computed(() => getDiscountedPrice(this.product().price, this.product().discountPercentage));

  /** Five booleans (filled/empty) driving the star-rating display, rounded to the nearest whole star. */
  readonly ratingStars = computed(() => getRatingStars(this.product().rating));

  /**
   * Handles the Add to Cart click. Stops propagation so the click
   * doesn't also trigger the card's `routerLink` navigation to the
   * product detail page.
   */
  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }
}
