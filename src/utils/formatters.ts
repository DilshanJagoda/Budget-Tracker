/**
 * Financial and date formatting utilities adhering strictly to German student standards.
 * Currency is stored in integer cents to completely avoid floating-point math issues.
 */

export function formatEuro(cents: number, showSign: boolean = false): string {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const euros = (absCents / 100).toFixed(2);
  
  // Format with German thousands separator (.) and decimal comma (,)
  const [whole, decimal] = euros.split('.');
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formattedAmount = `${formattedWhole},${decimal} €`;

  if (isNegative) {
    return `-${formattedAmount}`;
  }
  if (showSign && cents > 0) {
    return `+${formattedAmount}`;
  }
  return formattedAmount;
}

export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function parseEuroInputToCents(val: string | number): number {
  if (typeof val === 'number') {
    return Math.round(val * 100);
  }
  if (!val) return 0;
  // Replace German comma with dot and clean non-numerical except dot/minus
  const cleaned = val.replace(/\s+/g, '').replace('€', '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

export function formatDateGerman(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

export function getRelativeDateLabel(dateStr: string, lang: 'en' | 'de' = 'en'): string {
  if (!dateStr) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return lang === 'de' ? 'Heute' : 'Today';
  if (diffDays === 1) return lang === 'de' ? 'Morgen' : 'Tomorrow';
  if (diffDays === -1) return lang === 'de' ? 'Gestern' : 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return lang === 'de' ? `In ${diffDays} Tagen` : `In ${diffDays} days`;
  if (diffDays < -1) return lang === 'de' ? `${Math.abs(diffDays)} Tage überfällig` : `${Math.abs(diffDays)} days overdue`;

  return formatDateGerman(dateStr);
}

export function getMonthYearLabel(monthStr: string, lang: 'en' | 'de' = 'en'): string {
  // format "2026-10"
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function getCurrentMonthStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getRemainingDaysInMonth(monthStartDay: number = 1): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  // If planning cycle is standard 1st of month to last day of month
  const lastDay = new Date(year, month + 1, 0).getDate();
  const remaining = lastDay - todayDate + 1;
  return Math.max(1, remaining);
}
