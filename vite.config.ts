import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://44.197.228.204:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/products-api": {
        target: "https://stg2.rhnonprod.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/products-api/, "/rh/api"),
      },
    },
  },
});
