/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'rvbfguamiityqlheqjnu.supabase.co',
                port: '',
                pathname: '/storage/**',
            },
        ],
    },
};

export default nextConfig;
