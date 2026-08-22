import { Component, Input } from '@angular/core';
import { cn } from '../lib/utils';

@Component({
  selector: 'app-card',
  template: `
    <div [class]="classes">
      <ng-content />
    </div>
  `,
})
export class Card {
  @Input() className?: string;

  get classes(): string {
    return cn('bg-white rounded-lg shadow-md border border-gray-200 p-6', this.className);
  }
}
