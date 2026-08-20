import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    // The previous site shipped a single 1.03 MB chunk. Routes are lazy-loaded
    // in App.tsx, and the vendor split below keeps React cacheable across
    // content deploys — so a copy change no longer invalidates the framework.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
              return "react-vendor";
            }
            return "vendor";
          }
          return undefined;
        },
      },
    },
    // Fail loudly if any single chunk creeps back toward the old bundle size.
    chunkSizeWarningLimit: 220,
    cssCodeSplit: true,
    sourcemap: false,
  },
});
