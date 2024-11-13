import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './app/navigation';
import { NextRequest, NextResponse } from 'next/server';

const handleI18Routing = createMiddleware({
  defaultLocale: 'en',
  localePrefix,
  locales,
});

export default async function middleware(request: NextRequest) {
  const response = handleI18Routing(request);
  const { nextUrl, cookies } = request;

  return response;
}

export const config = {
  matcher: ['/', '/(tr|en)/:path*'],
};
