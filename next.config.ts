import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.100"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "pub-f4e60981bd7348ea97ea5678e78ec6dc.r2.dev" },
    ],
  },
};

export default nextConfig;
