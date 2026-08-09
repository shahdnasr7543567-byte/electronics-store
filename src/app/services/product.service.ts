import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, of } from 'rxjs';

import { Product } from '../models/product.interface';
import { Category } from '../models/category.interface';
import { mockCategories, mockProducts } from '../data/mock-products';
import { environment } from '../../environments/environment';

/**
 * Added to every DummyJSON product id before it enters app state, so a
 * live-API id can never collide with a local mock-data id (both source
 * ranges start at 1).
 */
const API_ID_OFFSET = 100_000;

/**
 * DummyJSON category slugs that map cleanly onto this store's own
 * taxonomy. DummyJSON has no equivalent for wearables, gaming
 * accessories, computer components, networking, or smart-home
 * products, so those categories are always served from
 * {@link mockProducts} — pulling DummyJSON's full, unfiltered catalog
 * would otherwise mix in irrelevant items like skincare and groceries.
 */
const API_CATEGORY_SLUGS: ReadonlyMap<string, number> = new Map([
  ['laptops', 1],
  ['smartphones', 2],
  ['tablets', 2],
]);

/** Shape of a single product object as returned by dummyjson.com. */
interface DummyJsonProduct {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly price: number;
  readonly discountPercentage: number;
  readonly rating: number;
  readonly stock: number;
  readonly brand?: string;
  readonly thumbnail: string;
  readonly images: readonly string[];
}

/** Shape of a DummyJSON `/products/category/:slug` response. */
interface DummyJsonListResponse {
  readonly products: readonly DummyJsonProduct[];
}

/**
 * Owns the product catalog and category list for the whole app.
 *
 * Data strategy: try DummyJSON first for the categories it actually has
 * (laptops, smartphones, tablets); always fill in the remaining
 * categories from local mock data; fall back to the full mock catalog
 * if the API is unreachable. Results are cached in memory for the
 * lifetime of the app so repeat calls to {@link loadProducts} are free.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly productsSignal = signal<Product[]>([]);
  private readonly categoriesSignal = signal<Category[]>([...mockCategories]);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  /** Guards against re-fetching once a successful (or fallback) load has completed. */
  private hasLoaded = false;

  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  /**
   * Loads the catalog if it hasn't been loaded yet. Safe to call from
   * every component that needs products (e.g. both `Home` and
   * `ProductDetail` on a direct deep link) — subsequent calls are a
   * no-op thanks to the in-memory cache.
   */
  loadProducts(): void {
    if (this.hasLoaded) {
      return;
    }
    this.fetchProducts();
  }

  /**
   * Forces a fresh fetch, bypassing the in-memory cache. Intended for
   * a manual "refresh catalog" action.
   */
  refreshProducts(): void {
    this.hasLoaded = false;
    this.fetchProducts();
  }

  /**
   * Synchronously reads a single product out of the already-loaded
   * catalog. Returns `null` if the catalog hasn't loaded yet or the id
   * doesn't exist — callers should ensure {@link loadProducts} has been
   * called first.
   */
  getProductById(id: number): Product | null {
    return this.productsSignal().find((product) => product.id === id) ?? null;
  }

  /**
   * Returns up to `limit` other products sharing the same category,
   * excluding the product itself. Used for "related products" on the
   * detail page.
   */
  getRelatedProducts(product: Product, limit = 4): Product[] {
    return this.productsSignal()
      .filter((candidate) => candidate.categoryId === product.categoryId && candidate.id !== product.id)
      .slice(0, limit);
  }

  private fetchProducts(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const categoryRequests = [...API_CATEGORY_SLUGS.entries()].map(([slug, categoryId]) =>
      this.http.get<DummyJsonListResponse>(`${environment.apiUrl}/products/category/${slug}`).pipe(
        map((response) => response.products.map((product) => this.mapApiProduct(product, categoryId))),
        // A single category endpoint failing shouldn't take down the others —
        // treat it as "no products from this category" and keep going.
        catchError(() => of<Product[]>([])),
      ),
    );

    forkJoin(categoryRequests).subscribe((resultsPerCategory) => {
      const apiProducts = resultsPerCategory.flat();
      const mockOnlyCategoryProducts = mockProducts.filter(
        (product) => !API_CATEGORY_SLUGS.has(this.slugForCategoryId(product.categoryId)),
      );

      const hasAnyApiData = apiProducts.length > 0;

      this.productsSignal.set(hasAnyApiData ? [...apiProducts, ...mockOnlyCategoryProducts] : [...mockProducts]);

      if (!hasAnyApiData) {
        this.errorSignal.set('Could not reach the product API — showing the offline catalog instead.');
      }

      this.isLoadingSignal.set(false);
      this.hasLoaded = true;
    });
  }

  /** Reverse lookup from a categoryId back to its DummyJSON slug (if any), used to exclude API-covered categories from the mock fallback merge. */
  private slugForCategoryId(categoryId: number): string {
    for (const [slug, id] of API_CATEGORY_SLUGS) {
      if (id === categoryId) {
        return slug;
      }
    }
    return '';
  }

  /** Normalizes a raw DummyJSON product into this app's {@link Product} shape. */
  private mapApiProduct(apiProduct: DummyJsonProduct, categoryId: number): Product {
    return {
      id: apiProduct.id + API_ID_OFFSET,
      title: apiProduct.title,
      description: apiProduct.description,
      price: apiProduct.price,
      discountPercentage: apiProduct.discountPercentage,
      rating: apiProduct.rating,
      stock: apiProduct.stock,
      brand: apiProduct.brand ?? 'Generic',
      categoryId,
      thumbnail: apiProduct.thumbnail,
      images: apiProduct.images.length > 0 ? apiProduct.images : [apiProduct.thumbnail],
    };
  }
}
