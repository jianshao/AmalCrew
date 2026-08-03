import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const routeLocale = request.nextUrl.pathname.match(/^\/(en|ar)(?:\/|$)/)?.[1];
  if (routeLocale) requestHeaders.set("x-amalcrew-route-locale", routeLocale);
  return updateSession(request, requestHeaders);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
