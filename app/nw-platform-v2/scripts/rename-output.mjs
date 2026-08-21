// Postbuild step: vite-plugin-singlefile emits a single inlined HTML file at
// the Vite build entry's basename (index.html) into build.outDir
// (../../src, i.e. leapfi-dashboards/src). D11 pins the twin's filename to
// src/leapfi-platform-v2.html, so this script renames the emitted file in
// place. It touches only that one file — never
// src/leapfi-platform.html (D8, read-only) or any other file in src/.
import { existsSync, renameSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(__dirname, '..', '..', '..', 'src')
const builtFile = resolve(srcDir, 'index.html')
const targetFile = resolve(srcDir, 'leapfi-platform-v2.html')
const forbiddenFile = resolve(srcDir, 'leapfi-platform.html')

if (!existsSync(builtFile)) {
  console.error(`[rename-output] Expected build output not found: ${builtFile}`)
  process.exit(1)
}

if (resolve(targetFile) === resolve(forbiddenFile)) {
  // Should be unreachable given the hardcoded literals above; defends against
  // accidental future edits pointing the target at the D8 read-only base page.
  console.error('[rename-output] Refusing to write over the D8 read-only base page.')
  process.exit(1)
}

renameSync(builtFile, targetFile)

const { size } = statSync(targetFile)
console.log(`[rename-output] ${builtFile} -> ${targetFile} (${size} bytes)`)
