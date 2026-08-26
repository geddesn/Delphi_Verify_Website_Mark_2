import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { "/api": "https://delphiverify.com" },
  },
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
            /* Leaflet is imported dynamically, and only by the location-privacy
               panels on /trust. Naming a chunk here would override that and
               pull ~150 kB of mapping library into the eager vendor bundle on
               every page — which is what happened the first time. Returning
               undefined lets Rollup keep it in its own async chunk, fetched
               when that section mounts and never anywhere else. */
            if (/[\\/]node_modules[\\/]leaflet[\\/]/.test(id)) {
              return undefined;
            }
            /* PostHog is consent-gated through a dynamic import. Keep its SDK
               and private dependencies out of the shared vendor chunk so the
               browser does not even download analytics code before opt-in. */
            if (/[\\/]node_modules[\\/](posthog-js|@posthog)[\\/]/.test(id)) {
              return undefined;
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
