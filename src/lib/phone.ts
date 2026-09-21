/** Local ten-digit numbers default to India; explicit international numbers are preserved. */
export function whatsappNumber(phone: string): string {
  const value = phone.trim();
  const digits = value.replace(/\D/g, "");
  if (value.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (/^0[6-9]\d{9}$/.test(digits)) return `91${digits.slice(1)}`;
  return /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : digits;
}
