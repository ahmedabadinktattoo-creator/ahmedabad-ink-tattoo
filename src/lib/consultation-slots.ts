// Preferred consultation start times, not a live availability/reservation calendar.
export const consultationSlots = Array.from({ length: 24 }, (_, index) => {
  const hour = 10 + Math.floor(index / 2);
  return `${hour.toString().padStart(2, "0")}:${index % 2 ? "30" : "00"}`;
});

export function indiaDate(now = Date.now()) {
  return new Date(now + 330 * 60_000).toISOString().slice(0, 10);
}

export function slotLabel(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

export function validatePreferredSlot(date: string, time: string, now = Date.now()) {
  if (!date && !time) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !consultationSlots.includes(time)) return "Please choose a valid date and time.";
  const timestamp = Date.parse(`${date}T${time}:00+05:30`);
  if (!Number.isFinite(timestamp) || indiaDate(timestamp) !== date) return "Please choose a valid date.";
  if (timestamp < now + 60 * 60_000) return "Please choose a time at least one hour from now, or call us for an immediate visit.";
  if (date > indiaDate(now + 90 * 86400_000)) return "Please choose a date within the next 90 days.";
  return "";
}
