import { defineConfig } from "tsup";

export default defineConfig((options) => ({
    entry: ["src/index.ts"],
    outDir: "lib",
    target: "node16",
    format: ["esm"],
    clean: true,
    splitting: false,
}));
