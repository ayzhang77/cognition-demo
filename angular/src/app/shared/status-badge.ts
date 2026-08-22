import { Component, Input } from '@angular/core';
import { cn, getStatusColor } from '../lib/utils';

@Component({
  selector: 'app-status-badge',
  template: `<span [class]="classes">{{ label }}</span>`,
})
export class StatusBadge {
  @Input({ required: true }) status!: string;
  @Input() className?: string;

  get classes(): string {
    return cn(
      'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border',
      getStatusColor(this.status),
      this.className
    );
  }

  get label(): string {
    return this.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
