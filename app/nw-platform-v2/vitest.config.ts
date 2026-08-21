/**
 * Vitest config for nw-platform-v2 (test-infra dispatch).
 *
 * Deliberately a SEPARATE file from vite.config.ts: that file carries the
 * singlefile production build (outDir ../../src, viteSingleFile) and must
 * never gain test-only concerns. This config is self-contained — it does
 * not import or extend vite.config.ts, so `vitest` can never trigger the
 * singlefile plugin or write into the served src/ directory.
 */
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
