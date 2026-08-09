import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../services/notification.service';

/**
 * Fixed-position stack of toast notifications, sourced entirely from
 * {@link NotificationService}. Drop `<app-notification-toast />` once
 * near the root of the app (e.g. in `app.html`) — every service call
 * like `notificationService.showSuccess(...)` will surface here.
 */
@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.html',
  styleUrl: './notification-toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationToast {
  private readonly notificationService = inject(NotificationService);

  readonly notifications = this.notificationService.notifications;

  /** Maps a notification type to its Font Awesome icon class. */
  iconFor(type: string): string {
    switch (type) {
      case 'success':
        return 'fa-solid fa-circle-check';
      case 'error':
        return 'fa-solid fa-circle-exclamation';
      case 'warning':
        return 'fa-solid fa-triangle-exclamation';
      default:
        return 'fa-solid fa-circle-info';
    }
  }

  /** Dismisses a notification immediately, e.g. from its close button. */
  dismiss(id: number): void {
    this.notificationService.dismiss(id);
  }
}
