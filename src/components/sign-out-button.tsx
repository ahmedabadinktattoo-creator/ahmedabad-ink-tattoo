"use client";
import { createClient } from "@/lib/supabase/client";
export function SignOutButton() { return <button className="dashboard-signout" type="button" onClick={async () => { await createClient().auth.signOut(); window.location.assign("/"); }}>Sign out ↗</button>; }
