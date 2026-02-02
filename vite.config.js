// Vite config for the storefront builder (root under src/, assets served from asset_packages/).
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  envDir: process.cwd(),
  publicDir: "../asset_packages",
  build: {
    outDir: "../dist",
    emptyOutDir: true
  }
});
