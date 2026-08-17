import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['postgres', 'ioredis', 'bullmq', 'bcryptjs'],
};

export default nextConfig;
