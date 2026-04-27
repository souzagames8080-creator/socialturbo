import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: any) {
  if (!date) return 'N/A';
  if (date.toDate) return date.toDate().toLocaleString();
  return new Date(date).toLocaleString();
}
