/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    output: 'export',
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
