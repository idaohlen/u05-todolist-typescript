import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/index.html")
      }
    }
  },
  optimizeDeps: {
    include: ["@supabase/supabase-js"]
  }
});