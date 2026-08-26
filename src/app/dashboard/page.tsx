import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient, hasPublicSupabase, requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Tattoo Dashboard", robots: { index: false, follow: false } };
const demoBookings = [{ id: "demo", reference: "AIT-8F31A2C4", tattoo_style: "Fine Line", artist_slug: "mira", appointment_date: "2026-09-12", appointment_time: "15:00:00", status: "confirmed", deposit_amount: 100000, razorpay_payment_id: "pay_preview" }];

export default async function CustomerDashboard() {
  const configured = hasPublicSupabase(); const user = await requireUser();
  if (configured && !user) redirect("/login");
  let bookings = demoBookings;
  if (configured && user) { const { data } = await (await createClient()).from("consultation_bookings").select("id,reference,tattoo_style,artist_slug,appointment_date,appointment_time,status,deposit_amount,razorpay_payment_id").eq("user_id", user.id).order("appointment_date", { ascending: false }); bookings = data ?? []; }
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "Client";
  return <div className="dashboard-shell"><DashboardTop label="Client portal" title={`Welcome, ${firstName}.`} preview={!configured} signOut={configured} /><div className="dashboard-grid"><section className="dashboard-main"><div className="dashboard-section-title"><div><p className="eyebrow gold-text">Appointments</p><h2>Your tattoo journey</h2></div><Link className="button gold" href="/book">New consultation</Link></div>{bookings.length ? <div className="booking-list">{bookings.map((booking) => <article key={booking.id}><div className="booking-date"><strong>{new Date(`${booking.appointment_date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit" })}</strong><span>{new Date(`${booking.appointment_date}T00:00:00`).toLocaleDateString("en-IN", { month: "short" })}</span></div><div><span className={`status status-${booking.status}`}>{String(booking.status).replace("_", " ")}</span><h3>{booking.tattoo_style} consultation</h3><p>{booking.artist_slug === "studio" ? "Studio recommendation" : `With ${capitalize(booking.artist_slug)}`} · {formatTime(booking.appointment_time)}</p><small>{booking.reference}</small></div><div className="receipt"><span>Deposit</span><strong>₹{(booking.deposit_amount / 100).toLocaleString("en-IN")}</strong><small>{booking.razorpay_payment_id ? "Receipt available" : "Awaiting payment"}</small></div></article>)}</div> : <div className="empty-state"><h3>No appointments yet.</h3><p>When you reserve a consultation, the details will appear here.</p></div>}</section><aside className="dashboard-side"><p className="eyebrow gold-text">Aftercare essentials</p><h2>Protect the work.</h2><ol><li><span>01</span>Keep the wrap on for the time advised by your artist.</li><li><span>02</span>Wash gently with clean hands and fragrance-free soap.</li><li><span>03</span>Apply a very thin layer of recommended aftercare.</li><li><span>04</span>Avoid swimming, direct sun and scratching while healing.</li></ol><p className="dashboard-help">Questions about healing? <a href="mailto:hello@ahmedabadink.com">Contact the studio ↗</a></p></aside></div></div>;
}

function DashboardTop({ label, title, preview, signOut }: { label: string; title: string; preview: boolean; signOut: boolean }) { return <header className="dashboard-top"><div><p className="eyebrow gold-text">{label}</p><h1>{title}</h1></div><div>{preview && <span className="preview-pill">Preview data</span>}{signOut && <SignOutButton />}</div></header>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
function formatTime(value: string) { const [hour, minute] = value.split(":").map(Number); return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(2020, 0, 1, hour, minute)); }
