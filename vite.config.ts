
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
