import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    root: path.resolve(__dirname),
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    exclude: ["node_modules", "dist"],
    setupFiles: [path.resolve(__dirname, "src/tests/setup.ts")],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/tests/**",
        "src/index.ts",
        "src/types/**",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    sequence: {
      shuffle: false,
    },
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
