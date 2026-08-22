import { Component, Input } from '@angular/core';
import { cn, formatDate } from '../lib/utils';

export interface AuditLogEvent {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: Date;
  notes?: string;
  details?: Record<string, unknown>;
}

@Component({
  selector: 'app-audit-log',
  template: `
    @if (events.length === 0) {
      <div [class]="emptyClasses">No audit history available</div>
    } @else {
      <div [class]="listClasses">
        @for (event of events; track event.id) {
          <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">{{ formatAction(event.action) }}</p>
                <span class="text-xs text-gray-500">{{ formatTimestamp(event.timestamp) }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ event.userName }}</p>
              @if (event.notes) {
                <p class="mt-1 text-sm text-gray-700 italic">{{ event.notes }}</p>
              }
              @if (event.details) {
                <div class="mt-2 text-xs text-gray-500">
                  <pre class="bg-white p-2 rounded border overflow-x-auto">{{ formatDetails(event.details) }}</pre>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class AuditLog {
  @Input() events: AuditLogEvent[] = [];
  @Input() className?: string;

  get emptyClasses(): string {
    return cn('text-center py-8 text-gray-500 text-sm', this.className);
  }

  get listClasses(): string {
    return cn('space-y-3', this.className);
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatTimestamp(timestamp: Date): string {
    return formatDate(timestamp);
  }

  formatDetails(details: Record<string, unknown>): string {
    return JSON.stringify(details, null, 2);
  }
}
