import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Builds into the hub at /courses/insights/ with relative paths,
// so the site works from any folder or GitHub Pages URL.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "../../courses/insights",
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  },
});
