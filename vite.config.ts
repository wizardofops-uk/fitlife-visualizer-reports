import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    host: "localhost",
    port: 8080,
    https: {
      cert: './node_modules/.vite/cert.pem',
      key: './node_modules/.vite/key.pem'
    },
    hmr: {
      protocol: 'wss',
      host: 'localhost',
      port: 8080
    },
    proxy: {
      '/api/fitbit': {
        target: 'https://api.fitbit.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/fitbit/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Log the headers being sent
            console.log('Request Headers:', proxyReq.getHeaders());
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  plugins: [
    basicSsl(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // manualChunks: {
        //   'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        //   'ui-vendor': [
        //     '@radix-ui/react-accordion',
        //     '@radix-ui/react-alert-dialog',
        //     '@radix-ui/react-aspect-ratio',
        //     '@radix-ui/react-avatar',
        //     '@radix-ui/react-checkbox',
        //     '@radix-ui/react-collapsible',
        //     '@radix-ui/react-context-menu',
        //     '@radix-ui/react-dialog',
        //     '@radix-ui/react-dropdown-menu',
        //     '@radix-ui/react-hover-card',
        //     '@radix-ui/react-label',
        //     '@radix-ui/react-menubar',
        //     '@radix-ui/react-navigation-menu',
        //     '@radix-ui/react-popover',
        //     '@radix-ui/react-progress',
        //     '@radix-ui/react-radio-group',
        //     '@radix-ui/react-scroll-area',
        //     '@radix-ui/react-select',
        //     '@radix-ui/react-separator',
        //     '@radix-ui/react-slider',
        //     '@radix-ui/react-slot',
        //     '@radix-ui/react-switch',
        //     '@radix-ui/react-tabs',
        //     '@radix-ui/react-toast',
        //     '@radix-ui/react-toggle',
        //     '@radix-ui/react-toggle-group',
        //     '@radix-ui/react-tooltip',
        //     'class-variance-authority',
        //     'clsx',
        //     'tailwind-merge'
        //   ],
        //   'chart-vendor': ['recharts'],
        //   'utils-vendor': ['date-fns', 'sonner', 'lucide-react'],
        // },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    exclude: ['@react-pdf/renderer', 'electron']
  },
  ssr: {
    noExternal: ['@react-pdf/renderer', 'electron']
  }
}));
