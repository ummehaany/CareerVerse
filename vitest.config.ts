import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Minimal config for pure-logic unit tests (scoring engine, deterministic
// recommendation builder, AI-output guardrails). Deliberately does not spin
// up Next.js or Firebase — those modules are server-only / network-backed
// and out of scope for these tests. `vite-tsconfig-paths` resolves the same
// `@/*` alias used throughout the app so test files can import real source
// modules unmodified.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
