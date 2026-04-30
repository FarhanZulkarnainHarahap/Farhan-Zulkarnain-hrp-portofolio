import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/home',    // URL yang diketik di browser
        destination: '/dashboard/user', // Folder asli di kodingan
      },
      {
        source: '/about',
        destination: '/dashboard/user',
      },
      {
        source: '/contact',
        destination: '/dashboard/user',
      },
      {
        source: '/documents',
        destination: '/dashboard/user',
      },
      {
        source: '/skills',
        destination: '/dashboard/user',
      },
      {
        source: '/portfolio',
        destination: '/dashboard/user',
      },
      {
        source: '/admin/home',    // URL yang diketik di browser
        destination: '/dashboard/admin/home', // Folder asli di kodingan
      },
      {
        source: '/admin/skill',    // URL yang diketik di browser
        destination: '/dashboard/admin/skill', // Folder asli di kodingan
      },
      {
        source: '/admin/skill/manage',    // URL yang diketik di browser
        destination: '/dashboard/admin/skill/manage', // Folder asli di kodingan
      },
      {
        source: '/admin/portofolio',    // URL yang diketik di browser
        destination: '/dashboard/admin/portofolio', // Folder asli di kodingan
      },
      {
        source: '/admin/portofolio/upload',    // URL yang diketik di browser
        destination: '/dashboard/admin/portofolio/upload', // Folder asli di kodingan
      },
      {
        source: '/admin/document',    // URL yang diketik di browser
        destination: '/dashboard/admin/document', // Folder asli di kodingan
      },
       {
        source: '/admin/document/upload',    // URL yang diketik di browser
        destination: '/dashboard/admin/document/upload', // Folder asli di kodingan
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
