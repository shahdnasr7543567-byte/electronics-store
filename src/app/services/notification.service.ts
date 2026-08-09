import { Injectable, signal } from '@angular/core';

/** Visual/semantic category of a notification, drives the toast's color and icon. */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/** A single toast notification. */
export interface AppNotification {
  readonly id: number;
  readonly type: NotificationType;
  readonly message: string;
}

/** How long a notification stays visible before it auto-dismisses, in milliseconds. */
const AUTO_DISMISS_MS = 3500;

/**
 * Drives the app's toast notifications (e.g. "Added to cart").
 *
 * Components don't render anything themselves — they call one of the
 * `show*` methods, and the `NotificationToast` component (subscribed to
 * {@link notifications}) is responsible for displaying and dismissing them.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notificationsSignal = signal<AppNotification[]>([]);
  private nextId = 1;

  readonly notifications = this.notificationsSignal.asReadonly();

  /** Shows a success toast (e.g. a completed action). */
  showSuccess(message: string): void {
    this.push('success', message);
  }

  /** Shows an error toast (e.g. a failed request). */
  showError(message: string): void {
    this.push('error', message);
  }

  /** Shows a neutral, informational toast. */
  showInfo(message: string): void {
    this.push('info', message);
  }

  /** Shows a warning toast (e.g. low stock). */
  showWarning(message: string): void {
    this.push('warning', message);
  }

  /** Removes a notification before its auto-dismiss timer fires, e.g. on manual close. */
  dismiss(id: number): void {
    this.notificationsSignal.update((list) => list.filter((notification) => notification.id !== id));
  }

  private push(type: NotificationType, message: string): void {
    const id = this.nextId++;
    this.notificationsSignal.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }
}
