import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "is5-ssl.mzstatic.com",
        port: "",
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "www.usthb.dz",
      },
    ],
  },
};

export default nextConfig;
