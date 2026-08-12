import type { NextConfig } from "next";

/**
 * Production security headers.
 *
 * The hardening headers below are enforced on every route. The Content Security
 * Policy is shipped in *Report-Only* mode first (per the pre-deployment review):
 * it surfaces violations in the console without blocking anything, so it can be
 * tuned against real Firebase Auth / Firestore traffic before being enforced.
 * connect-src / frame-src allow the Google + Firebase endpoints the client SDK
 * uses; img-src allows the logo CDN and data/blob URIs.
 */
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.firebaseio.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
