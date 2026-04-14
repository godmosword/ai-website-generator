import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@webomate/site-spec": path.join(root, "packages/site-spec/src/index.ts"),
      "@webomate/renderer": path.join(root, "packages/renderer/src/index.ts")
    }
  },
  test: {
    include: ["packages/**/*.test.ts"],
    environment: "node"
  }
});
