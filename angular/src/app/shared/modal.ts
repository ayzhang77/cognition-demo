import { ContentChild, Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import { cn } from '../lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg';

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/** Marks projected content as the modal footer; the footer bar renders only when present. */
@Directive({ selector: '[modalFooter]' })
export class ModalFooter {}

@Component({
  selector: 'app-modal',
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black bg-opacity-50" (click)="closed.emit()"></div>
        <div [class]="panelClasses">
          <div class="flex items-center justify-between p-6 border-b">
            <h2 class="text-xl font-semibold">{{ title }}</h2>
            <button
              type="button"
              (click)="closed.emit()"
              class="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <ng-content />
          </div>
          @if (hasFooter) {
            <div class="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
              <ng-content select="[modalFooter]" />
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class Modal {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: ModalSize = 'md';
  @Output() closed = new EventEmitter<void>();
  @ContentChild(ModalFooter, { static: true }) protected footer?: ModalFooter;

  protected get hasFooter(): boolean {
    return this.footer !== undefined;
  }

  get panelClasses(): string {
    return cn('relative bg-white rounded-lg shadow-xl w-full mx-4', SIZES[this.size]);
  }
}
