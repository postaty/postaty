import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
    ],
  },
  // @ts-expect-error - serverActions is valid but not in NextConfig type yet
  serverActions: {
    bodySizeLimit: "50mb",
  },
};

export default nextConfig;
