import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { cn } from '../lib/utils';

export interface TableCellContext<T> {
  $implicit: unknown;
  row: T;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  /** Replaces the React `render` callback: an ng-template with `$implicit` = cell value, `row` = the row. */
  cell?: TemplateRef<TableCellContext<T>>;
  className?: string;
}

@Component({
  selector: 'app-table',
  imports: [NgTemplateOutlet],
  template: `
    @if (data.length === 0) {
      <div [class]="emptyClasses">{{ emptyMessage }}</div>
    } @else {
      <div [class]="wrapperClasses">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              @for (column of columns; track column.key) {
                <th [class]="headerClasses(column)">{{ column.header }}</th>
              }
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (row of data; track $index) {
              <tr [class]="rowClasses" (click)="rowClick.emit(row)">
                @for (column of columns; track column.key) {
                  <td [class]="cellClasses(column)">
                    @if (column.cell) {
                      <ng-container
                        [ngTemplateOutlet]="column.cell"
                        [ngTemplateOutletContext]="{ $implicit: value(row, column), row: row }"
                      />
                    } @else {
                      {{ value(row, column) }}
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class Table<T> {
  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Input() emptyMessage = 'No data available';
  @Input() className?: string;
  @Output() rowClick = new EventEmitter<T>();

  get emptyClasses(): string {
    return cn('text-center py-12 text-gray-500', this.className);
  }

  get wrapperClasses(): string {
    return cn('overflow-x-auto', this.className);
  }

  get rowClasses(): string {
    return cn('hover:bg-gray-50 cursor-pointer');
  }

  headerClasses(column: TableColumn<T>): string {
    return cn(
      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      column.className
    );
  }

  cellClasses(column: TableColumn<T>): string {
    return cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', column.className);
  }

  value(row: T, column: TableColumn<T>): unknown {
    return (row as Record<string, unknown>)[column.key];
  }
}
