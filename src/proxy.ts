import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  LOCALE_COOKIE,
  defaultLocale,
  isLocale,
  localeFromPathname,
} from "@/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (localeFromPathname(pathname)) return;

  // A deliberate earlier choice wins; otherwise Bahasa Indonesia.
  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(preferred) ? preferred : defaultLocale;

  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, API routes, and files with an extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
