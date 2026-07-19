import { cn, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border', getStatusColor(status), className)}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}
