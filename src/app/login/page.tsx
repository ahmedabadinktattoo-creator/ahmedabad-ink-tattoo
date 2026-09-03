import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { hasPublicSupabase, requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Client Sign In", robots: { index: false, follow: false } };
export default async function LoginPage() {
  if (hasPublicSupabase()) {
    const user = await requireUser();
    if (user) redirect(user.app_metadata?.role === "admin" ? "/admin" : "/dashboard");
  }
  return <div className="login-page"><div><p className="eyebrow gold-text">Ahmedabad Ink clients</p><h1>Your ink,<br /><em>in one place.</em></h1><p>Access appointments, deposit details and aftercare guidance with a secure eight-digit email code.</p>{hasPublicSupabase() ? <LoginForm /> : <div className="preview-notice"><strong>Dashboard preview mode</strong><p>Supabase Auth will activate after the database project is connected.</p><Link className="button gold" href="/dashboard">View customer preview</Link><Link className="text-link" href="/admin">View admin preview ↗</Link></div>}</div></div>;
}
