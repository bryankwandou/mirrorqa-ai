/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true, poweredByHeader: false, experimental: { serverComponentsExternalPackages: ["playwright-core", "@sparticuz/chromium"] } };

export default nextConfig;
