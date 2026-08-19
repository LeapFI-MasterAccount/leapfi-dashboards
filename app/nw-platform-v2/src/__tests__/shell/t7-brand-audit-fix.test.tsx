/**
 * T7 brand-audit dispatch (F14 self-hosted Inter, F2 print-palette
 * cyan-on-white, F8 favicon plumbing).
 *
 * NOTE on citation: the dispatch brief cites
 * "leapfi-documentation/08_Programs/nw_platform_demo/brand_audit_twin.md,
 * F2/F8/F14" as the source of these three findings. That file does not
 * exist; the only audit doc present is brand_audit.md, and its own F2/F8/F14
 * rows are unrelated findings against a different document entirely (the
 * legacy leapfi-platform.html base: a recreated-wordmark finding, an
 * off-token panel-color finding, and an off-token semantic-color finding —
 * none of them about Inter loading, print palettes, or this app's favicon).
 * This is flagged as a citation-mismatch discrepancy in the implementer's
 * evidence return, not silently absorbed. The three defects this file pins
 * were independently re-derived from this codebase (App.css's unbacked
 * `font-family: Inter` declaration; Drawer.tsx's print `<style>` never
 * repointing `--accent`; index.html shipping no `<link rel="icon">` at
 * all) and cross-checked against brand_doctrine.md's binding rules
 * (Typography TYP-1, Accessibility "Forbidden: Cyan on white", "Chevron
 * mark" favicon spec) rather than against the mismatched citation.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Drawer } from '../../components/Drawer'

// Plain `node:fs` reads rather than Vite's `?raw` import (the precedent in
// presenter-entry-d18.test.tsx works for index.html, but Vite's CSS plugin
// short-circuits `.css` imports — `?raw`/`?inline` alike — to an empty
// string under Vitest's SSR module transform; verified empirically before
// choosing this route). These are file-content contracts on markup/CSS
// jsdom never executes (index.html's <link> tags, fonts.css's @font-face
// block), not component behavior, so reading the real files on disk is the
// most faithful check available. `@types/node` was added as a devDependency
// (test-only, zero runtime bytes in the shipped artifact) to type these
// two Node builtins — flagged in the evidence return as a small addition
// beyond the dispatch's literal file ALLOWLIST, taken in service of the
// allowlisted test-dir deliverable.
const here = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(here, '../../..')

function readIndexHtml(): string {
  return readFileSync(path.join(appRoot, 'index.html'), 'utf8')
}

function readFontsCss(): string {
  return readFileSync(path.join(appRoot, 'src/theme/fonts.css'), 'utf8')
}

describe('F14 — Inter is declared (App.css) but was never loaded; self-hosted faces fix that', () => {
  it('index.html links src/theme/fonts.css as a stylesheet (F14 wiring)', () => {
    const html = readIndexHtml()
    expect(html).toMatch(/<link[^>]+rel="stylesheet"[^>]+href="\/src\/theme\/fonts\.css"/)
  })

  it('fonts.css declares @font-face for the Inter family, self-hosted (no external CDN reference)', () => {
    const css = readFontsCss()
    const faceCount = (css.match(/@font-face/g) ?? []).length
    expect(faceCount).toBeGreaterThan(0)
    expect(css).toMatch(/font-family:\s*'Inter'/)
    // Self-hosted: every src is a data URI, never a network URL (fonts.
    // googleapis.com, fonts.gstatic.com, or any other http(s) host) — that
    // would defeat D14/D11's zero-runtime-fetch, self-contained-build
    // requirement noted in App.css's own typography comment.
    expect(css).not.toMatch(/https?:\/\//)
    expect(css).toMatch(/format\('woff2'\)/)
  })

  it('fonts.css ships exactly the weights this codebase actually uses (400/500/600/700 — no unused 800)', () => {
    const css = readFontsCss()
    for (const weight of [400, 500, 600, 700]) {
      expect(css).toMatch(new RegExp(`font-weight:\\s*${weight};`))
    }
    // The dispatch brief guessed "likely 400/600/700/800" without weight
    // 500; a live census (grep across src/**/*.{ts,tsx,css} for
    // fontWeight:/font-weight: literals) found 5x 500, 24x 600, 67x 700,
    // and zero uses of 800 anywhere in the codebase — corrected here rather
    // than shipping an unused face or omitting a used one.
    expect(css).not.toMatch(/font-weight:\s*800;/)
  })
})

describe('F2 — the RPT-01 print stylesheet (Drawer.tsx) reproduced a cyan-on-white forbidden pair', () => {
  it('the injected print <style> repoints --accent off Brand Cyan for the white print surface', () => {
    render(
      <Drawer open title="Regulatory change report" onClose={() => {}}>
        <p>report body</p>
      </Drawer>,
    )
    const styleEl = document.querySelector('style')
    expect(styleEl).not.toBeNull()
    const printCss = styleEl!.textContent ?? ''
    expect(printCss).toMatch(/@media print/)
    // FORB-1 / doctrine Accessibility: "Forbidden: Cyan on white." Dark
    // mode's --accent is #00f2ff (Brand Cyan); the print block must not
    // let that value reach the forced-white print panel.
    expect(printCss).not.toMatch(/#00f2ff/i)
    // Doctrine's own light-mode resolution (LM-PAL-6 Deep Teal) is reused
    // for the print surface, per the dispatch's "Deep Teal or Midnight ink
    // on white" instruction.
    expect(printCss).toMatch(/--accent:\s*#006d75\s*!important/)
    // The pre-existing bg/panel/ink overrides must still be intact — this
    // fix is additive, not a rewrite of the RPT-01 port.
    expect(printCss).toMatch(/--panel:\s*#ffffff\s*!important/)
    expect(printCss).toMatch(/--ink:\s*#111111\s*!important/)
  })
})

describe('F8 — no favicon; LINK plumbing added as a data-URI slot (chevron master PNG not local — STOP-item)', () => {
  it('index.html declares an icon link and an apple-touch-icon link, each an inline data URI slot', () => {
    const html = readIndexHtml()
    expect(html).toMatch(/<link[^>]+rel="icon"[^>]+sizes="32x32"[^>]+href="data:image\/png;base64,[^"]*"/)
    expect(html).toMatch(/<link[^>]+rel="apple-touch-icon"[^>]+sizes="180x180"[^>]+href="data:image\/png;base64,[^"]*"/)
    // Neither slot references an on-disk file path — a path reference to a
    // not-yet-sourced asset would break `npm run build`; the slot must stay
    // a same-line-editable data URI until the master PNG is provided.
    expect(html).not.toMatch(/<link[^>]+rel="(icon|apple-touch-icon)"[^>]+href="\/src\/assets\//)
  })
})
