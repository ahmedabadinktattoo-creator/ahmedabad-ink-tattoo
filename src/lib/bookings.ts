import { artists, portfolioCategories } from "@/data/studio";

export const bookingTimes = ["11:00", "13:00", "15:00", "17:00", "19:00"] as const;
export const depositPaise = Number(process.env.BOOKING_DEPOSIT_PAISE ?? 100000);

export type BookingInput = {
  name: string;
  email: string;
  phone: string;
  artistSlug: string;
  style: string;
  appointmentDate: string;
  appointmentTime: string;
  placement: string;
  size: string;
  idea: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s()-]{7,17}$/;

export function parseBookingForm(formData: FormData): BookingInput {
  const value = (key: string) => String(formData.get(key) ?? "").trim();
  const input = {
    name: value("name"), email: value("email").toLowerCase(), phone: value("phone"),
    artistSlug: value("artistSlug"), style: value("style"), appointmentDate: value("appointmentDate"),
    appointmentTime: value("appointmentTime"), placement: value("placement"), size: value("size"), idea: value("idea"),
  };

  if (input.name.length < 2 || input.name.length > 80) throw new Error("Please enter your full name.");
  if (!emailPattern.test(input.email)) throw new Error("Please enter a valid email address.");
  if (!phonePattern.test(input.phone)) throw new Error("Please enter a valid phone number.");
  if (input.artistSlug !== "studio" && !artists.some((artist) => artist.slug === input.artistSlug)) throw new Error("Please choose an artist.");
  if (!portfolioCategories.includes(input.style as (typeof portfolioCategories)[number]) || input.style === "All") throw new Error("Please choose a tattoo style.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.appointmentDate)) throw new Error("Please choose an appointment date.");
  if (!bookingTimes.includes(input.appointmentTime as (typeof bookingTimes)[number])) throw new Error("Please choose an appointment time.");
  if (input.idea.length < 10 || input.idea.length > 1500) throw new Error("Tell us a little more about your tattoo idea.");
  if (input.placement.length < 2 || input.placement.length > 80) throw new Error("Please enter the placement.");
  if (input.size.length < 1 || input.size.length > 80) throw new Error("Please enter an approximate size.");

  const requested = new Date(`${input.appointmentDate}T${input.appointmentTime}:00+05:30`);
  if (Number.isNaN(requested.valueOf()) || requested.valueOf() < Date.now() + 23 * 60 * 60 * 1000) throw new Error("Please select a future slot with at least 24 hours’ notice.");
  return input;
}

export function validateReference(file: File | null) {
  if (!file || file.size === 0) return null;
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowed.has(file.type)) throw new Error("Reference must be a JPG, PNG or WebP image.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Reference image must be smaller than 8 MB.");
  return file;
}

export function bookingReference(id: string) { return `AIT-${id.replaceAll("-", "").slice(0, 8).toUpperCase()}`; }
