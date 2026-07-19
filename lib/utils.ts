import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'high':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-green-700 bg-green-50 border-green-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'approved':
    case 'processed':
    case 'enabled':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'rejected':
    case 'failed':
    case 'disabled':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'pending':
    case 'info_requested':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'escalated':
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'rollout':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}
