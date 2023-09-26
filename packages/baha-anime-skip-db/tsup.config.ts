import { defineConfig } from "tsup";

export default defineConfig((options) => ({
    entry: ["src/index.ts"],
    outDir: "lib",
    target: "node16",
    format: ["cjs", "esm"],
    shims: true,
    clean: true,
    splitting: false,
    dts: true,
    minify: !options.watch,
}));
