
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: "./client",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "client/index.html"),
        gomatoken: resolve(__dirname, "client/public/gomatoken.html")
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "client/src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
