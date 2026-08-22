import { Component, ViewChild, TemplateRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Table, TableCellContext, TableColumn } from './table';

interface Row {
  id: string;
  amount: number;
}

@Component({
  imports: [Table],
  template: `
    <ng-template #amountCell let-value let-row="row">
      <span class="amount">{{ row.id }}:{{ value }}</span>
    </ng-template>
    <app-table [data]="data" [columns]="columns" (rowClick)="clicked = $event" />
  `,
})
class Host {
  @ViewChild('amountCell', { static: true }) amountCell!: TemplateRef<TableCellContext<Row>>;
  data: Row[] = [{ id: 'P-1', amount: 42 }];
  columns: TableColumn<Row>[] = [];
  clicked: Row | null = null;
}

describe('Table', () => {
  it('renders plain and templated cells and emits rowClick', () => {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    host.columns = [
      { key: 'id', header: 'ID' },
      { key: 'amount', header: 'Amount', cell: host.amountCell },
    ];
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('th')[0].textContent).toContain('ID');
    expect(element.querySelectorAll('td')[0].textContent).toContain('P-1');
    expect(element.querySelector('.amount')?.textContent).toBe('P-1:42');

    element.querySelector('tbody tr')!.dispatchEvent(new MouseEvent('click'));
    expect(host.clicked).toEqual(host.data[0]);
  });

  it('renders the empty message when there is no data', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.data = [];
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No data available');
  });
});
