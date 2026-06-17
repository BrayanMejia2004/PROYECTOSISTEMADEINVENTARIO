import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function getErrorMessage(err: unknown, fallback = 'Error desconocido'): string {
  if (err && typeof err === 'object') {
    const axiosError = err as Record<string, any>;
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
    if (axiosError.message) return axiosError.message;
  }
  return fallback;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number): string => {
  if (amount == null || Number.isNaN(amount)) return '$0';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatNumber = (value: number, decimals = 0): string => {
  if (value == null || Number.isNaN(value)) return '0';
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
