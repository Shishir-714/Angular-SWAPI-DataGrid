import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const ICONS: Record<string, string> = {
  search: `<circle cx="8.5" cy="8.5" r="4.75"/><path d="m12 12 4 4"/>`,
  edit: `<path d="M2 12.5V17h4.5l11-11L13 2.5l-11 11Z" fill="gray"/><path d="M14.5 2.5 17.5 5.5"/>`,
  star: `<path d="M10 1.5 12.4721 7.52786 19.0211 8.23607 14.5105 12.9721 15.9442 19.2639 10 16.25 4.05576 19.2639 5.48947 12.9721 0.97887 8.23607 7.52786 7.52786L10 1.5Z" fill="gray"/>`,
};

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.viewBox]="'0 0 20 20'"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      aria-hidden="true"
      [innerHTML]="safePath()"
    ></svg>
  `,
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);
  name = input.required<keyof typeof ICONS>();
  size = input<number>(16);
  safePath = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name()] ?? ''),
  );
}