import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './components/header/header';
import { CartSidebar } from './components/cart-sidebar/cart-sidebar';
import { NotificationToast } from './components/notification-toast/notification-toast';

/**
 * Root app shell: header, routed page content, the cart sidebar, and
 * the notification toast stack. Owns only the cart-sidebar's
 * open/closed state — everything else is delegated to its children.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, CartSidebar, NotificationToast],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly isCartOpen = signal(false);

  /** Opens the cart sidebar, triggered by the header's cart button. */
  onOpenCart(): void {
    this.isCartOpen.set(true);
  }

  /** Closes the cart sidebar, triggered by its backdrop, close button, or a completed checkout. */
  onCloseCart(): void {
    this.isCartOpen.set(false);
  }
}
