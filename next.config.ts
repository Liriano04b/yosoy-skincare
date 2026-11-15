import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permite que next/image optimice las fotos de productos guardadas en Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xopdzcdlhdpxjvowfsmt.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
