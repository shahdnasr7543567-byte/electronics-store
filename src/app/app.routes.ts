import { Routes } from '@angular/router';

import { Home } from './home/home';
import { ProductDetail } from './product-detail/product-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'product/:id', component: ProductDetail }
];
