import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';

import { Product } from '../models/product.interface';
import { ProductCard } from '../components/product-card/product-card';

/**
 * Presentational product grid: renders a `ProductCard` per product and
 * bubbles up the "add to cart" intent — it holds no cart, catalog, or
 * form state of its own. `Home` (and later the related-products
 * section on `ProductDetail`) own the data and decide what an
 * add-to-cart click actually does.
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  /** The (already filtered/paginated) products to render. */
  readonly products = input.required<Product[]>();

  /** Emitted when any card's "Add to Cart" button is clicked. */
  @Output() readonly addToCart = new EventEmitter<Product>();

  /** Re-emits a card's add-to-cart click to this component's own consumer. */
  onAddToCart(product: Product): void {
    this.addToCart.emit(product);
  }
}
