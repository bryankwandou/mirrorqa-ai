/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true, poweredByHeader: false, serverExternalPackages: ["@sparticuz/chromium"], outputFileTracingIncludes: { "/api/browser/run": ["./node_modules/@sparticuz/chromium/bin/**", "./node_modules/playwright-core/browsers.json"] } };

export default nextConfig;
