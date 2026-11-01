import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { stickerPlugin } from "./server/stickerPlugin";

export default defineConfig({
  plugins: [react(), stickerPlugin()],
  server: { host: "127.0.0.1", watch: { ignored: ["**/.local-data/**"] } },
  build: { rollupOptions: { input: ["index.html", "compare/index.html"] } },
});
