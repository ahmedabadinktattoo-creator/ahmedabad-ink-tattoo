import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code"); const requestedNext = url.searchParams.get("next") ?? "/dashboard";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const safeNext = requestedNext.startsWith("/") ? requestedNext : "/dashboard";
      const destination = safeNext === "/dashboard" && user?.app_metadata?.role === "admin" ? "/admin" : safeNext;
      return NextResponse.redirect(new URL(destination, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
