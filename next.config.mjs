/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true, poweredByHeader: false, serverExternalPackages: ["playwright-core", "@sparticuz/chromium"], outputFileTracingIncludes: { "/api/browser/run": ["./node_modules/@sparticuz/chromium/bin/**"] } };

export default nextConfig;
