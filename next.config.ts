import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactCompiler: false,
  compiler: {
    removeConsole: {
      exclude: ["error"],
    },
  },
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
  async headers() {
    return [
      {
        source: "/cyber-navbar-frame.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path(home|about|skills|projects|documents|contact)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/skills",
        destination: "/about",
        permanent: false,
      },
      {
        source: "/documents",
        destination: "/about",
        permanent: false,
      },
      {
        source: "/projects",
        destination: "/home#projects",
        permanent: false,
      },
      {
        source: "/contact",
        destination: "/home#contact",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/home',    // URL yang diketik di browser
        destination: '/dashboard/user', // Folder asli di kodingan
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
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [55, 65, 72, 75, 80],
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
