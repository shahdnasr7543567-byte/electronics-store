import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { Products } from '../products/products';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';
import { Product } from '../models/product.interface';

/** Sort orders available in the "Sort by" dropdown. */
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

/** How many products are shown per page. */
const PRODUCTS_PER_PAGE = 6;

/** How long to wait after the shopper stops typing before the search actually filters. */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Storefront landing page: search, category filter, sort, and
 * pagination over the product catalog, delegating actual card
 * rendering to {@link Products}.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, Products],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = this.productService.isLoading;
  readonly loadError = this.productService.error;
  readonly categories = this.productService.categories;

  /** Raw search box value, updated on every keystroke via `ngModel`. */
  readonly searchTerm = signal('');

  /** `searchTerm`, debounced by {@link SEARCH_DEBOUNCE_MS} so filtering doesn't run on every keystroke. */
  private readonly debouncedSearchTerm = toSignal(
    toObservable(this.searchTerm).pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged()),
    { initialValue: '' },
  );

  /** `null` means "All categories". */
  readonly selectedCategoryId = signal<number | null>(null);

  readonly sortOption = signal<SortOption>('default');

  readonly currentPage = signal(1);

  /** Full catalog filtered by search term and category, then sorted. Recomputes only when an input signal actually changes. */
  readonly filteredProducts = computed<Product[]>(() => {
    const term = this.debouncedSearchTerm().trim().toLowerCase();
    const categoryId = this.selectedCategoryId();

    let result = this.productService.products();

    if (term) {
      result = result.filter((product) => product.title.toLowerCase().includes(term));
    }

    if (categoryId !== null) {
      result = result.filter((product) => product.categoryId === categoryId);
    }

    return this.applySort(result, this.sortOption());
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / PRODUCTS_PER_PAGE)));

  /** The single page of products actually handed to the grid. */
  readonly pagedProducts = computed(() => {
    const start = (this.currentPage() - 1) * PRODUCTS_PER_PAGE;
    return this.filteredProducts().slice(start, start + PRODUCTS_PER_PAGE);
  });

  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

  constructor() {
    this.productService.loadProducts();

    // Jump back to page 1 whenever the active filters change, so the
    // shopper never lands on a now-empty page after narrowing results.
    effect(() => {
      this.debouncedSearchTerm();
      this.selectedCategoryId();
      this.sortOption();
      this.currentPage.set(1);
    });
  }

  /** Applies a category selection from the dropdown (empty string means "All Categories"). */
  onCategoryChange(categoryId: string): void {
    this.selectedCategoryId.set(categoryId === '' ? null : Number(categoryId));
  }

  /** Applies a sort selection from the dropdown. */
  onSortChange(sort: SortOption): void {
    this.sortOption.set(sort);
  }

  /** Navigates to a given page number, ignoring out-of-range requests. */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
  }

  /**
   * Adds a product to the cart and confirms it with a toast. Guards
   * against out-of-stock products in case a stale card is somehow
   * still interactive.
   */
  onAddToCart(product: Product): void {
    if (product.stock <= 0) {
      this.notificationService.showWarning(`${product.title} is out of stock.`);
      return;
    }
    this.cartService.addToCart(product);
    this.notificationService.showSuccess(`${product.title} added to cart.`);
  }

  private applySort(products: Product[], sort: SortOption): Product[] {
    const sorted = [...products];

    switch (sort) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sorted;
    }
  }
}
