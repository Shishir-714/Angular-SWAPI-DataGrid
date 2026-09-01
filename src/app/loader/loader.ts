import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center justify-center gap-3 py-8 text-sky-700"
      role="status"
      aria-live="polite"
    >
      <span
        class="size-7 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"
        aria-hidden="true"
      ></span>
    </div>
  `,
})
export class LoaderComponent {}
