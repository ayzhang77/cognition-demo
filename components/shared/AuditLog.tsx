import { formatDate, cn } from '@/lib/utils';

interface AuditEvent {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: Date;
  notes?: string;
  details?: Record<string, any>;
}

interface AuditLogProps {
  events: AuditEvent[];
  className?: string;
}

export function AuditLog({ events, className }: AuditLogProps) {
  if (events.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500 text-sm', className)}>
        No audit history available
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {event.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
            </div>
            <p className="text-sm text-gray-600">{event.userName}</p>
            {event.notes && (
              <p className="mt-1 text-sm text-gray-700 italic">{event.notes}</p>
            )}
            {event.details && (
              <div className="mt-2 text-xs text-gray-500">
                <pre className="bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
