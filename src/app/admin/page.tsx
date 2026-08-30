import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { getSupabaseAdmin, hasBookingBackend } from "@/lib/supabase-admin";
import { createClient, hasPublicSupabase, requireAdmin, requireUser } from "@/lib/supabase/server";
import { addBlogPost, addPortfolioEntry, updateBookingStatus } from "./actions";

export const metadata: Metadata = { title: "Studio Admin", robots: { index: false, follow: false } };

type AdminBooking = {
  id: string; reference: string; customer_name: string; email: string; phone: string;
  tattoo_style: string; artist_slug: string; appointment_date: string; appointment_time: string;
  status: string; deposit_amount: number; placement: string; approximate_size: string; idea: string;
  reference_path: string | null; reference_url?: string | null;
};

const demoBookings: AdminBooking[] = [{
  id: "1", reference: "AIT-8F31A2C4", customer_name: "Riya Shah", email: "riya@example.com", phone: "+91 98765 43210",
  tattoo_style: "Fine Line", artist_slug: "mira", appointment_date: "2026-09-12", appointment_time: "15:00:00",
  status: "confirmed", deposit_amount: 100000, placement: "Inner forearm", approximate_size: "12 cm",
  idea: "A delicate botanical piece with personal meaning.", reference_path: null,
}];

export default async function AdminDashboard() {
  const configured = hasPublicSupabase();
  const user = await requireUser();
  const admin = await requireAdmin();
  if (configured && !user) redirect("/login");
  if (configured && !admin) redirect("/dashboard");

  let bookings: AdminBooking[] = demoBookings;
  let portfolioCount = 9;
  let postCount = 3;

  if (configured) {
    const supabase = await createClient();
    const [bookingsResult, portfolioResult, postsResult] = await Promise.all([
      supabase.from("consultation_bookings").select("id,reference,customer_name,email,phone,tattoo_style,artist_slug,appointment_date,appointment_time,status,deposit_amount,placement,approximate_size,idea,reference_path").order("appointment_date", { ascending: true }).limit(50),
      supabase.from("portfolio_entries").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    ]);
    bookings = (bookingsResult.data ?? []) as AdminBooking[];
    portfolioCount = portfolioResult.count ?? 0;
    postCount = postsResult.count ?? 0;

    if (hasBookingBackend()) {
      const storage = getSupabaseAdmin().storage.from("booking-references");
      bookings = await Promise.all(bookings.map(async (booking) => {
        if (!booking.reference_path) return booking;
        const { data } = await storage.createSignedUrl(booking.reference_path, 3600);
        return { ...booking, reference_url: data?.signedUrl ?? null };
      }));
    }
  }

  const confirmed = bookings.filter((item) => item.status === "confirmed" || item.status === "completed");
  const revenue = confirmed.reduce((sum, item) => sum + item.deposit_amount, 0) / 100;

  return <div className="admin-shell">
    <header className="admin-top"><div><p className="eyebrow gold-text">Studio control room</p><h1>Booking command centre.</h1><p>Customer details, references and appointment status in one place.</p></div><div>{!configured && <span className="preview-pill">Preview data</span>}{configured && <SignOutButton />}</div></header>
    <nav className="admin-nav"><a href="#overview">Overview</a><a href="#bookings">Bookings</a><a href="#content">Content studio</a><Link href="/">View website ↗</Link></nav>
    <section className="metric-grid" id="overview"><article><span>Upcoming consultations</span><strong>{bookings.length}</strong><small>Latest 50</small></article><article><span>Deposits collected</span><strong>₹{revenue.toLocaleString("en-IN")}</strong><small>{confirmed.length} confirmed</small></article><article><span>Portfolio pieces</span><strong>{portfolioCount}</strong><small>Published work</small></article><article><span>Blog drafts</span><strong>{postCount}</strong><small>Content pipeline</small></article></section>
    <section className="admin-panel" id="bookings"><div className="admin-heading"><div><p className="eyebrow gold-text">Booking desk</p><h2>Appointments</h2></div><Link className="line-link" href="/book">Create booking ↗</Link></div>
      <div className="admin-table"><div className="table-row table-head booking-expanded"><span>Client</span><span>Appointment</span><span>Artist / style</span><span>Deposit</span><span>Status</span><span>Idea & reference</span></div>
        {bookings.length ? bookings.map((booking) => <div className="table-row booking-expanded" key={booking.id}>
          <span><strong>{booking.customer_name}</strong><small>{booking.reference}<br />{booking.email}<br /><a href={`https://wa.me/${booking.phone.replace(/\D/g, "")}`}>{booking.phone} ↗</a></small></span>
          <span>{formatDate(booking.appointment_date)}<small>{formatTime(booking.appointment_time)}<br />{booking.placement} · {booking.approximate_size}</small></span>
          <span>{capitalize(booking.artist_slug)}<small>{booking.tattoo_style}</small></span>
          <span>₹{(booking.deposit_amount / 100).toLocaleString("en-IN")}</span>
          <span>{configured ? <form action={updateBookingStatus}><input type="hidden" name="id" value={booking.id} /><select name="status" defaultValue={booking.status}><option value="pending_payment" disabled>Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><button>Save</button></form> : <i className={`status status-${booking.status}`}>{booking.status.replace("_", " ")}</i>}</span>
          <span><small className="booking-detail">{booking.idea}</small>{booking.reference_url ? <a className="booking-reference" href={booking.reference_url} target="_blank" rel="noreferrer"><Image unoptimized width={92} height={92} src={booking.reference_url} alt={`Reference from ${booking.customer_name}`} /></a> : <small>No reference image</small>}</span>
        </div>) : <div className="empty-state"><h3>No bookings yet.</h3><p>Completed booking requests will appear here.</p></div>}
      </div>
    </section>
    <section className="content-studio" id="content"><div className="admin-heading"><div><p className="eyebrow gold-text">CMS</p><h2>Content studio</h2></div><p>Publish new work and prepare studio stories without touching code.</p></div><div className="cms-grid">
      <CmsCard number="01" title="Portfolio manager" text="Add a new tattoo to the public gallery." disabled={!configured}><form action={addPortfolioEntry}><input name="title" placeholder="Piece title" required /><select name="category" required><option value="">Choose style</option>{["Realism","Fine Line","Mandala","Portrait","Geometric","Minimal","Blackwork","Cover Up"].map((item) => <option key={item}>{item}</option>)}</select><input name="imageUrl" type="url" placeholder="https:// image URL" required /><button className="button gold">Publish work</button></form></CmsCard>
      <CmsCard number="02" title="Blog manager" text="Create an article draft for review." disabled={!configured}><form action={addBlogPost}><input name="title" placeholder="Article title" required /><input name="slug" placeholder="article-url-slug" required /><textarea name="excerpt" placeholder="Short introduction" rows={4} required /><button className="button gold">Save draft</button></form></CmsCard>
      <CmsCard number="03" title="Artist manager" text="Artist records are ready for profiles and specialties." disabled={!configured}><div className="cms-coming"><strong>3</strong><span>Active artists</span><small>Full profile editor coming next.</small></div></CmsCard>
    </div></section>
  </div>;
}

function CmsCard({ number, title, text, disabled, children }: { number: string; title: string; text: string; disabled: boolean; children: React.ReactNode }) { return <article className={disabled ? "cms-card disabled" : "cms-card"}><span>{number}</span><h3>{title}</h3><p>{text}</p>{children}{disabled && <small className="preview-lock">Connect Supabase to activate</small>}</article>; }
function capitalize(value: string) { return value === "studio" ? "Studio match" : value.charAt(0).toUpperCase() + value.slice(1); }
function formatDate(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
function formatTime(value: string) { const [hour, minute] = value.split(":").map(Number); return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(2020, 0, 1, hour, minute)); }
