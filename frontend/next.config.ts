import path from "node:path";
import type { NextConfig } from "next";

const workspaceRoot = path.resolve(process.cwd(), "..");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // NOTE: the standalone server nests under standalone/<project-dir>/ when
  // the tracing root is an ancestor (local monorepo layout). Docker builds
  // set NEXT_STANDALONE_TRACING_ROOT to flatten it; scripts/e2e.mjs probes
  // both layouts.
  outputFileTracingRoot:
    process.env.NEXT_STANDALONE_TRACING_ROOT ?? workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
