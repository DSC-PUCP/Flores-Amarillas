import { defineConfig, loadEnv } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const isProd = mode === 'production'
  
  return {
    plugins: [
      devtools(),
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
      ...(isProd ? [cloudflare({
        viteEnvironment: {
          name: 'ssr'
        }
      })] : []),
      tanstackStart({
        prerender: {
          enabled: true,
        },
        sitemap: {
          enabled: true,
          host: env.VITE_SERVER_URL
        }
      }),
      viteReact({
        babel: {
          plugins: ["babel-plugin-react-compiler"],
        },
      }),
    ]
  }
});

export default config;