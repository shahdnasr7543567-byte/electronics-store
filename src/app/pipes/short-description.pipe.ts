import { Pipe, PipeTransform } from '@angular/core';

/**
 * Truncates text down to its first 3 words, appending an ellipsis if
 * anything was cut. Used to keep product descriptions a consistent
 * height inside product cards.
 */
@Pipe({
  name: 'shortDescription',
  standalone: true,
})
export class ShortDescriptionPipe implements PipeTransform {
  /** Returns the first 3 words of `value`, with "..." appended if anything was cut. */
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const words = value.trim().split(/\s+/);

    if (words.length <= 3) {
      return value;
    }

    return `${words.slice(0, 3).join(' ')}...`;
  }
}
