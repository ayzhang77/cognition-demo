import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({ data, columns, onRowClick, emptyMessage = 'No data available', className }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cn('text-center py-12 text-gray-500', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn('hover:bg-gray-50 cursor-pointer', onRowClick && 'cursor-pointer')}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', column.className)}
                >
                  {column.render ? column.render((row as any)[column.key], row) : (row as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
