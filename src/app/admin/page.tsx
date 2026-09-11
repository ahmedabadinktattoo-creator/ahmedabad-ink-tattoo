import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { getSupabaseAdmin, hasBookingBackend } from "@/lib/supabase-admin";
import { createClient, hasPublicSupabase, requireAdmin, requireUser } from "@/lib/supabase/server";
import { addBlogPost, addPortfolioEntry, updateBookingStatus, updateEnquiryStatus, retryEnquiryDelivery } from "./actions";

export const metadata: Metadata = { title: "Studio Admin", robots: { index: false, follow: false } };

type AdminBooking = {
  id: string; reference: string; customer_name: string; email: string; phone: string;
  tattoo_style: string; artist_slug: string; appointment_date: string; appointment_time: string;
  status: string; deposit_amount: number; placement: string; approximate_size: string; idea: string;
  reference_path: string | null; reference_url?: string | null;
};

type AdminEnquiry = {
  id: string; reference: string; created_at: string; customer_name: string; email: string; phone: string;
  tattoo_style: string; placement: string; approximate_size: string; idea: string; status: string;
  notification_delivery: { customer?: boolean; studio?: boolean } | null;
  marketing_event_id?: string | null;
  marketing_delivery?: { crm?: string; meta?: string; attempts?: number };
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
  let enquiries: AdminEnquiry[] = [];
  let portfolioCount = 9;
  let postCount = 3;

  if (configured) {
    const supabase = await createClient();
    const [bookingsResult, enquiriesResult, portfolioResult, postsResult] = await Promise.all([
      supabase.from("consultation_bookings").select("id,reference,customer_name,email,phone,tattoo_style,artist_slug,appointment_date,appointment_time,status,deposit_amount,placement,approximate_size,idea,reference_path").order("appointment_date", { ascending: true }).limit(50),
      supabase.from("consultation_enquiries").select("id,reference,created_at,customer_name,email,phone,tattoo_style,placement,approximate_size,idea,status,notification_delivery,marketing_event_id,marketing_delivery").order("created_at", { ascending: false }).limit(100),
      supabase.from("portfolio_entries").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    ]);
    bookings = (bookingsResult.data ?? []) as AdminBooking[];
    enquiries = (enquiriesResult.data ?? []) as AdminEnquiry[];
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

  return <div className="admin-shell" data-clarity-mask="true">
    <header className="admin-top"><div><p className="eyebrow gold-text">Studio control room</p><h1>Booking command centre.</h1><p>Customer details, references and appointment status in one place.</p></div><div>{!configured && <span className="preview-pill">Preview data</span>}{configured && <SignOutButton />}</div></header>
    <nav className="admin-nav"><a href="#overview">Overview</a><a href="#enquiries">Enquiries</a><a href="#bookings">Bookings</a><a href="#content">Content studio</a><Link href="/">View website ↗</Link></nav>
    <section className="metric-grid" id="overview"><article><span>New enquiries</span><strong>{enquiries.filter((item) => item.status === "new").length}</strong><small>{enquiries.length} total</small></article><article><span>Upcoming consultations</span><strong>{bookings.length}</strong><small>Latest 50</small></article><article><span>Deposits collected</span><strong>₹{revenue.toLocaleString("en-IN")}</strong><small>{confirmed.length} confirmed</small></article><article><span>Portfolio pieces</span><strong>{portfolioCount}</strong><small>Published work</small></article><article><span>Blog drafts</span><strong>{postCount}</strong><small>Content pipeline</small></article></section>
    <section className="admin-panel" id="enquiries"><div className="admin-heading"><div><p className="eyebrow gold-text">Lead inbox</p><h2>Website enquiries</h2></div><p>Every completed enquiry form is stored here, even if an email notification has a delivery problem.</p></div>
      <div className="admin-table"><div className="table-row table-head enquiry-expanded"><span>Client</span><span>Received</span><span>Tattoo request</span><span>Idea</span><span>Status</span></div>
        {enquiries.length ? enquiries.map((enquiry) => <div className="table-row enquiry-expanded" key={enquiry.id}>
          <span><strong>{enquiry.customer_name}</strong><small>{enquiry.reference}<br /><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a><br /><a href={`https://wa.me/${enquiry.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{enquiry.phone} ↗</a></small></span>
          <span>{new Date(enquiry.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}<small>{new Date(enquiry.created_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}<br />Email: {enquiry.notification_delivery?.customer && enquiry.notification_delivery?.studio ? "delivered" : "dashboard only"}<br />CRM: {enquiry.marketing_delivery?.crm ?? "not recorded"}<br />Meta: {enquiry.marketing_delivery?.meta ?? "not recorded"}</small>{enquiry.marketing_event_id && (enquiry.marketing_delivery?.crm !== "sent" || !["sent", "no_consent", "expired"].includes(enquiry.marketing_delivery?.meta ?? "")) && <form action={retryEnquiryDelivery}><input type="hidden" name="reference" value={enquiry.reference} /><button>Retry incomplete deliveries</button><small>Retries CRM/Meta only, not customer emails.</small></form>}</span>
          <span>{enquiry.tattoo_style}<small>{enquiry.placement} · {enquiry.approximate_size}</small></span>
          <span><small className="booking-detail">{enquiry.idea}</small></span>
          <span><form action={updateEnquiryStatus}><input type="hidden" name="id" value={enquiry.id} /><select name="status" defaultValue={enquiry.status}><option value="new">New</option><option value="contacted">Contacted</option><option value="booked">Booked</option><option value="closed">Closed</option></select><button>Save</button></form></span>
        </div>) : <div className="empty-state"><h3>No enquiries yet.</h3><p>New customer forms will appear here immediately.</p></div>}
      </div>
    </section>
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
