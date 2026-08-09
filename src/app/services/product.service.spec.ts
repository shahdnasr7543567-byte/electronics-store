import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProductService } from './product.service';
import { environment } from '../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('merges live API results with the mock-only categories on success', () => {
    service.loadProducts();

    const requests = httpMock.match((req) => req.url.startsWith(`${environment.apiUrl}/products/category/`));
    expect(requests.length).toBe(3);

    requests.forEach((req) => req.flush({ products: [] }));

    // Every API category returned zero products, so the whole catalog
    // should fall back to the full mock set.
    expect(service.products().length).toBeGreaterThanOrEqual(40);
    expect(service.isLoading()).toBe(false);
  });

  it('falls back to the full mock catalog and surfaces an error when the API is unreachable', () => {
    service.loadProducts();

    const requests = httpMock.match((req) => req.url.startsWith(`${environment.apiUrl}/products/category/`));
    requests.forEach((req) => req.flush(null, { status: 500, statusText: 'Server Error' }));

    expect(service.products().length).toBeGreaterThanOrEqual(40);
    expect(service.error()).toBeTruthy();
  });

  it('caches results and does not re-fetch on a second loadProducts() call', () => {
    service.loadProducts();
    const firstBatch = httpMock.match((req) => req.url.startsWith(`${environment.apiUrl}/products/category/`));
    firstBatch.forEach((req) => req.flush({ products: [] }));

    service.loadProducts();
    httpMock.expectNone((req) => req.url.startsWith(`${environment.apiUrl}/products/category/`));
  });
});
