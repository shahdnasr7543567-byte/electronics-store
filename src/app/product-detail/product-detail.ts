import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';
import { ProductCard } from '../components/product-card/product-card';
import { Product } from '../models/product.interface';
import { getDiscountedPrice, getRatingStars } from '../utils/rating-price.util';

/** How many related products to show below the main product. */
const RELATED_PRODUCTS_LIMIT = 4;

/**
 * Product detail page: full info for one product plus a related-products
 * row. Reads the id from the route, and relies on `ProductService`'s
 * in-memory cache — `loadProducts()` is a no-op if `Home` already
 * triggered a load, and fetches fresh if this page was opened directly.
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);

  private readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: NaN },
  );

  readonly isLoading = this.productService.isLoading;

  /** The product for the current route id, or `null` if not found (yet, or at all). */
  readonly product = computed<Product | null>(() => {
    const id = this.productId();
    return Number.isNaN(id) ? null : this.productService.getProductById(id);
  });

  readonly relatedProducts = computed(() => {
    const current = this.product();
    return current ? this.productService.getRelatedProducts(current, RELATED_PRODUCTS_LIMIT) : [];
  });

  readonly hasDiscount = computed(() => (this.product()?.discountPercentage ?? 0) > 0);

  readonly discountedPrice = computed(() => {
    const current = this.product();
    return current ? getDiscountedPrice(current.price, current.discountPercentage) : 0;
  });

  readonly ratingStars = computed(() => getRatingStars(this.product()?.rating ?? 0));

  readonly isInStock = computed(() => (this.product()?.stock ?? 0) > 0);

  constructor() {
    this.productService.loadProducts();
  }

  /** Adds the currently viewed product to the cart. */
  onAddToCart(): void {
    const current = this.product();
    if (!current) {
      return;
    }
    this.addProductToCart(current);
  }

  /** Adds a related product to the cart directly from its card. */
  onRelatedAddToCart(product: Product): void {
    this.addProductToCart(product);
  }

  private addProductToCart(product: Product): void {
    if (product.stock <= 0) {
      this.notificationService.showWarning(`${product.title} is out of stock.`);
      return;
    }
    this.cartService.addToCart(product);
    this.notificationService.showSuccess(`${product.title} added to cart.`);
  }
}
