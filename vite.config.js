import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // target: "https://hospital-callyzer-production-server.up.railway.app",
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
