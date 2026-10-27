import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  // 1. Determine the true public origin behind reverse proxies (Render, Vercel, Cloudflare, etc.)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  let targetOrigin = '';

  if (forwardedHost) {
    // Render/Vercel sets x-forwarded-host to the actual public domain (e.g. myapp.onrender.com)
    targetOrigin = `${forwardedProto}://${forwardedHost}`;
  } else if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes(':10000')) {
    targetOrigin = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  } else {
    targetOrigin = requestUrl.origin;
    // Guard: Render internal container port is 10000. Never redirect client to localhost:10000!
    if (targetOrigin.includes(':10000') || targetOrigin.includes('localhost:10000')) {
      if (process.env.NEXT_PUBLIC_APP_URL) {
        targetOrigin = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
      } else {
        const hostHeader = request.headers.get('host');
        if (hostHeader && !hostHeader.includes(':10000')) {
          targetOrigin = `https://${hostHeader}`;
        } else {
          // If all else fails on local dev, fallback to standard port 3000
          targetOrigin = 'http://localhost:3000';
        }
      }
    }
  }

  // Ensure safe local path for redirect
  const safeNext = next.startsWith('/') ? next : `/${next}`;
  const finalRedirectUrl = `${targetOrigin}${safeNext}`;

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(finalRedirectUrl);
      }
      console.error('Supabase exchangeCodeForSession error:', error);
    } catch (err) {
      console.error('Failed to exchange code for session:', err);
    }
  }

  // Redirect to target origin dashboard or home
  return NextResponse.redirect(finalRedirectUrl);
}
