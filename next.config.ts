
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Added placehold.co
        port: '',
        pathname: '/**',
      },
      { // Added for Google Drive, though view links are problematic
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Add the allowed development origin for Cloud Workstations
  allowedDevOrigins: [
    'https://9003-firebase-studio-1747059624467.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev',
    '*.cloudworkstations.dev'
  ],
};

export default nextConfig;
