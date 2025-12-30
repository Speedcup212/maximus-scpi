// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { copyFileSync, existsSync } from "fs";
import { resolve } from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    {
      name: "async-optimization",
      transformIndexHtml(html) {
        html = html.replace(
          /<link rel="stylesheet" crossorigin href="([^"]*\.css)">/g,
          `<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" crossorigin href="$1"></noscript>`
        );
        html = html.replace(
          /<script type="module" crossorigin src="([^"]*)"><\/script>/g,
          (match, src) => {
            if (src.includes("/main") || src.includes("/index")) {
              return match;
            }
            return `<script type="module" crossorigin src="${src}" defer></script>`;
          }
        );
        return html;
      }
    },
    {
      name: "copy-static-files",
      closeBundle() {
        const distDir = resolve(__vite_injected_original_dirname, "dist");
        if (!existsSync(distDir)) {
          console.warn("dist directory not found, skipping file copy");
          return;
        }
        const redirectsPath = resolve(__vite_injected_original_dirname, "public/_redirects");
        if (existsSync(redirectsPath)) {
          copyFileSync(redirectsPath, resolve(distDir, "_redirects"));
        }
        const headersPath = resolve(__vite_injected_original_dirname, "public/_headers");
        if (existsSync(headersPath)) {
          copyFileSync(headersPath, resolve(distDir, "_headers"));
        }
        const logoPath = resolve(__vite_injected_original_dirname, "public/Maximus logo 250x50 4.svg");
        if (existsSync(logoPath)) {
          copyFileSync(logoPath, resolve(distDir, "Maximus logo 250x50 4.svg"));
        }
      }
    }
  ],
  optimizeDeps: {
    include: ["react", "react-dom", "lucide-react"]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("lucide-react")) {
              return "icons";
            }
            if (id.includes("jspdf") || id.includes("html2canvas")) {
              return "pdf-generator";
            }
            if (id.includes("@supabase")) {
              return "supabase";
            }
            return "vendor";
          }
          if (id.includes("PieChart")) {
            return "charts";
          }
          if (id.includes("thematicLandingPages")) {
            return "thematic-data";
          }
          if (id.includes("educationArticles")) {
            return "education-data";
          }
          if (id.includes("SCPI_complet") || id.includes("SCPI_comparateur") || id.includes("SCPI_REFERENCE")) {
            return "scpi-data";
          }
          if (id.includes("src/data/")) {
            return "data";
          }
          if (id.includes("src/components/landing/")) {
            return "landing-components";
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    minify: "esbuild",
    target: "es2020",
    sourcemap: false,
    reportCompressedSize: false
  },
  server: {
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIGV4aXN0c1N5bmMsIHJlYWRkaXJTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHtcbiAgICAgIG5hbWU6ICdhc3luYy1vcHRpbWl6YXRpb24nLFxuICAgICAgdHJhbnNmb3JtSW5kZXhIdG1sKGh0bWwpIHtcbiAgICAgICAgLy8gQ29udmVydCBDU1MgdG8gcHJlbG9hZCBmb3IgZmFzdGVyIGxvYWRpbmdcbiAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShcbiAgICAgICAgICAvPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGNyb3Nzb3JpZ2luIGhyZWY9XCIoW15cIl0qXFwuY3NzKVwiPi9nLFxuICAgICAgICAgICc8bGluayByZWw9XCJwcmVsb2FkXCIgaHJlZj1cIiQxXCIgYXM9XCJzdHlsZVwiIG9ubG9hZD1cInRoaXMub25sb2FkPW51bGw7dGhpcy5yZWw9XFwnc3R5bGVzaGVldFxcJ1wiPlxcbiAgICA8bm9zY3JpcHQ+PGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGNyb3Nzb3JpZ2luIGhyZWY9XCIkMVwiPjwvbm9zY3JpcHQ+J1xuICAgICAgICApO1xuXG4gICAgICAgIC8vIERlZmVyIG5vbi1jcml0aWNhbCBKU1xuICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC88c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiBjcm9zc29yaWdpbiBzcmM9XCIoW15cIl0qKVwiPjxcXC9zY3JpcHQ+L2csXG4gICAgICAgICAgKG1hdGNoLCBzcmMpID0+IHtcbiAgICAgICAgICAgIC8vIEtlZXAgbWFpbiBlbnRyeSBwb2ludCB3aXRoIG5vcm1hbCBsb2FkaW5nXG4gICAgICAgICAgICBpZiAoc3JjLmluY2x1ZGVzKCcvbWFpbicpIHx8IHNyYy5pbmNsdWRlcygnL2luZGV4JykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRGVmZXIgb3RoZXIgc2NyaXB0c1xuICAgICAgICAgICAgcmV0dXJuIGA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiBjcm9zc29yaWdpbiBzcmM9XCIke3NyY31cIiBkZWZlcj48L3NjcmlwdD5gO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdjb3B5LXN0YXRpYy1maWxlcycsXG4gICAgICBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgICAgY29uc3QgZGlzdERpciA9IHJlc29sdmUoX19kaXJuYW1lLCAnZGlzdCcpO1xuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoZGlzdERpcikpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rpc3QgZGlyZWN0b3J5IG5vdCBmb3VuZCwgc2tpcHBpbmcgZmlsZSBjb3B5Jyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29weSByZWRpcmVjdHMgaWYgZXhpc3RzXG4gICAgICAgIGNvbnN0IHJlZGlyZWN0c1BhdGggPSByZXNvbHZlKF9fZGlybmFtZSwgJ3B1YmxpYy9fcmVkaXJlY3RzJyk7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKHJlZGlyZWN0c1BhdGgpKSB7XG4gICAgICAgICAgY29weUZpbGVTeW5jKHJlZGlyZWN0c1BhdGgsIHJlc29sdmUoZGlzdERpciwgJ19yZWRpcmVjdHMnKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb3B5IGhlYWRlcnMgaWYgZXhpc3RzXG4gICAgICAgIGNvbnN0IGhlYWRlcnNQYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMvX2hlYWRlcnMnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoaGVhZGVyc1BhdGgpKSB7XG4gICAgICAgICAgY29weUZpbGVTeW5jKGhlYWRlcnNQYXRoLCByZXNvbHZlKGRpc3REaXIsICdfaGVhZGVycycpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvcHkgbG9nbyBTVkcgaWYgZXhpc3RzXG4gICAgICAgIGNvbnN0IGxvZ29QYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMvTWF4aW11cyBsb2dvIDI1MHg1MCA0LnN2ZycpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhsb2dvUGF0aCkpIHtcbiAgICAgICAgICBjb3B5RmlsZVN5bmMobG9nb1BhdGgsIHJlc29sdmUoZGlzdERpciwgJ01heGltdXMgbG9nbyAyNTB4NTAgNC5zdmcnKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIF0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IChpZCkgPT4ge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QnKSB8fCBpZC5pbmNsdWRlcygncmVhY3QtZG9tJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdyZWFjdC12ZW5kb3InO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsdWNpZGUtcmVhY3QnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2ljb25zJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnanNwZGYnKSB8fCBpZC5pbmNsdWRlcygnaHRtbDJjYW52YXMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3BkZi1nZW5lcmF0b3InO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAc3VwYWJhc2UnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3N1cGFiYXNlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gU3BsaXQgUGllQ2hhcnQgY29tcG9uZW50IHNlcGFyYXRlbHlcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ1BpZUNoYXJ0JykpIHtcbiAgICAgICAgICAgIHJldHVybiAnY2hhcnRzJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gU3BsaXQgZGF0YSBmaWxlcyBpbnRvIHNlcGFyYXRlIGNodW5rc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygndGhlbWF0aWNMYW5kaW5nUGFnZXMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd0aGVtYXRpYy1kYXRhJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdlZHVjYXRpb25BcnRpY2xlcycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2VkdWNhdGlvbi1kYXRhJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdTQ1BJX2NvbXBsZXQnKSB8fCBpZC5pbmNsdWRlcygnU0NQSV9jb21wYXJhdGV1cicpIHx8IGlkLmluY2x1ZGVzKCdTQ1BJX1JFRkVSRU5DRScpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3NjcGktZGF0YSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2RhdGEvJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnZGF0YSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2NvbXBvbmVudHMvbGFuZGluZy8nKSkge1xuICAgICAgICAgICAgcmV0dXJuICdsYW5kaW5nLWNvbXBvbmVudHMnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDYwMCxcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiBmYWxzZSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaG1yOiB7XG4gICAgICBvdmVybGF5OiBmYWxzZVxuICAgIH0sXG4gICAgd2F0Y2g6IHtcbiAgICAgIHVzZVBvbGxpbmc6IHRydWUsXG4gICAgICBpbnRlcnZhbDogMTAwXG4gICAgfVxuICB9XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsY0FBYyxrQkFBK0I7QUFDdEQsU0FBUyxlQUFxQjtBQUg5QixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEs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
