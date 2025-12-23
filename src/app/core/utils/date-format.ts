export function formatLocalDateTime(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;

  // Usa la zona horaria del navegador automáticamente
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d).replace(',', '');
}
