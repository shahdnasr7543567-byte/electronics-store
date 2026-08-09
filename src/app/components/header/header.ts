import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../services/cart.service';
import { ThemeService } from '../../services/theme.service';

/**
 * App-wide top bar: store logo/link home, a cart button showing the
 * live item count, and the dark-mode toggle. Cart open/close state is
 * owned by the root `App` component — this only reports the click.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly cartService = inject(CartService);
  private readonly themeService = inject(ThemeService);

  readonly cartItemCount = this.cartService.totalItems;
  readonly isDarkMode = this.themeService.isDark;

  @Output() readonly cartClick = new EventEmitter<void>();

  /** Flips the app between light and dark mode via ThemeService. */
  onToggleTheme(): void {
    this.themeService.toggle();
  }
}
