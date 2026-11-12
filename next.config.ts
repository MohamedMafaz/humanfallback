import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  // Ship the OpenAPI contract with the /api/openapi function so it survives
  // bundling on serverless hosts.
  outputFileTracingIncludes: {
    "/api/openapi": ["./openapi/**/*"],
  },
};

export default nextConfig;
