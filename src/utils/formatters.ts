/**
 * Standard Formatting Utilities for SSM ERP (DRY Architecture)
 * Centralizes Indian currency formatting, date helpers, and numeric parsing.
 */

/**
 * Returns today's date formatted as YYYY-MM-DD for standard HTML date inputs.
 */
export function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Formats a Date or ISO date string into Indian standard display format (DD/MM/YYYY).
 */
export function formatDateIndian(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats a number into Indian Rupee representation (e.g. ₹12,500 or 12,500).
 */
export function formatCurrencyInr(amount: number | string | null | undefined, includeSymbol: boolean = true): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || '0')) || 0;
  const formatted = num.toLocaleString('en-IN');
  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Safely parses any input value to a bounded number with an optional fallback.
 */
export function parseNumeric(value: any, fallback: number = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}

