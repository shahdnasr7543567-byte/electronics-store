import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * Toggles a 1.5x CSS scale transform on its host element each time it's
 * clicked — used on product thumbnails to give a quick "zoom in" preview.
 */
@Directive({
  selector: '[appZoom]',
  standalone: true,
})
export class ZoomDirective {
  private isZoomed = false;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  /** Toggles the zoomed-in state and applies the corresponding CSS transform. */
  @HostListener('click')
  onClick(): void {
    this.isZoomed = !this.isZoomed;

    const style = this.elementRef.nativeElement.style;
    style.transform = this.isZoomed ? 'scale(1.5)' : 'scale(1)';
    style.transition = '0.3s';
  }
}
