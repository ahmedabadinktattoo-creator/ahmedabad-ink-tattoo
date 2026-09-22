import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) { return updateSession(request); }
// Refresh sessions only for account flows and APIs, not public pages or image files.
export const config = { matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/auth/:path*", "/api/:path*"] };
