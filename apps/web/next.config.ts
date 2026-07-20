import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async rewrites() {
    const api = process.env.API_INTERNAL_ORIGIN ?? "http://localhost:4000";
    return [
      { source: "/agencia-rosano", destination: "/agencia-rosano/index.html" },
      { source: "/api/conversions/:path*", destination: `${api}/conversions/:path*` },
    ];
  },
};
export default config;
