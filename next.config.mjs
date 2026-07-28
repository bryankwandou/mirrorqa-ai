/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true, poweredByHeader: false, experimental: { serverComponentsExternalPackages: ["playwright-core", "@sparticuz/chromium"], outputFileTracingIncludes: { "/api/browser/run": ["./node_modules/@sparticuz/chromium/bin/**"] } } };

export default nextConfig;
