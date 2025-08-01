import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// --- DÁN TỪ ĐÂY TRỞ XUỐNG ---

import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number | null) {
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getStatusColor(status: string): 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' | 'bg-blue-500/20 text-blue-400 border-blue-500/30' | 'bg-green-500/20 text-green-400 border-green-500/30' | 'bg-red-500/20 text-red-400 border-red-500/30' | 'bg-gray-500/20 text-gray-400 border-gray-500/30' {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'approved':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'issued':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'rejected':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

export function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return Clock;
    case 'approved':
    case 'issued':
      return CheckCircle;
    case 'rejected':
      return XCircle;
    default:
      return AlertCircle;
  }
}
