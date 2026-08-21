import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// D14: FULL FRAMEWORK + BUILD — React + TypeScript + Vite + vite-plugin-singlefile.
// Dev-server entry is this app's own index.html (Vite's default resolution).
// Build output is written to ../../src (the leapfi-dashboards `src/` dir that
// publish.py serves from) as index.html, then renamed to
// `leapfi-platform-v2.html` by scripts/rename-output.mjs, invoked from the
// "build" npm script — never overwriting src/leapfi-platform.html (D8, D11).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: '../../src',
    // src/ holds sibling twin/legacy HTML files (leapfi-platform.html, etc.)
    // that this build must never delete or disturb.
    emptyOutDir: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
