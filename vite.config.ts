import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig(({ mode }) => {
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
