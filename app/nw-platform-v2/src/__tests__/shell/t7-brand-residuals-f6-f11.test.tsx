/**
 * T7 brand-audit residuals — F6 (primary-button pressed-state contrast)
 * and F11 (ALL-CAPS letter-spacing drift), per
 * .../nw_platform_demo/brand_audit_twin.md and brand_doctrine.md's
 * Accessibility / Typography sections (TYP-4).
 *
 * jsdom performs no layout and no color compositing (precedent:
 * shell/topbar.test.tsx's own header comment — jsdom does not resolve
 * `var()` inside `getComputedStyle()`). This suite therefore asserts the
 * STYLE CONTRACT — the literal `var(--x)` / `'0.05em'` strings each
 * component places on its inline style object, and the literal hex
 * tokens.css pins those custom properties to — never a rendered pixel.
 *
 * The F6 half also runs a real, independent WCAG 2.1 relative-luminance
 * computation against whatever hex tokens.css currently declares, rather
 * than hardcoding "it passes": if a future edit to --accent2 or
 * --accent2-ink regresses the pressed-state ratio below 4.5:1, or if the
 * ORIGINAL defect pairing's own ratio stops reproducing at ~4.05:1 (proving
 * this check can actually discriminate pass from fail), this suite fails.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { Button } from '../../components/primitives/Button'

const here = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(here, '../../..')
const srcRoot = path.join(appRoot, 'src')

function readSrc(relPath: string): string {
  return readFileSync(path.join(srcRoot, relPath), 'utf8')
}

function readTokensCss(): string {
  return readSrc('theme/tokens.css')
}

// ---- WCAG 2.1 relative luminance / contrast — independent implementation,
// not imported from app code, so it cannot silently agree with a bug there.
function srgbToLinear(c: number): number {
  const cs = c / 255
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
}
function relativeLuminance(hex: string): number {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim())
  if (!m) throw new Error(`not a 6-digit hex color: ${hex}`)
  const int = parseInt(m[1]!, 16)
  const r = srgbToLinear((int >> 16) & 0xff)
  const g = srgbToLinear((int >> 8) & 0xff)
  const b = srgbToLinear(int & 0xff)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA)
  const lB = relativeLuminance(hexB)
  const lighter = Math.max(lA, lB)
  const darker = Math.min(lA, lB)
  return (lighter + 0.05) / (darker + 0.05)
}

function tokenValue(css: string, block: 'dark' | 'light', name: string): string {
  const blockStart = block === 'dark' ? css.indexOf("[data-theme='dark']") : css.indexOf("[data-theme='light']")
  if (blockStart < 0) throw new Error(`could not locate the ${block} block in tokens.css`)
  const openBrace = css.indexOf('{', blockStart)
  const closeBrace = css.indexOf('}', openBrace)
  const blockText = css.slice(openBrace, closeBrace)
  const re = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`)
  const m = re.exec(blockText)
  if (!m) throw new Error(`--${name} not found in the ${block} block`)
  return m[1]!
}

describe('F6 — Button primary-variant pressed-state contrast (A11Y-1, doctrine Accessibility)', () => {
  it('active (pressed/mousedown) state fills with --accent2 and labels with --accent2-ink, not --bg', () => {
    render(<Button label="Continue" variant="primary" onPress={() => {}} />)
    const button = screen.getByRole('button', { name: 'Continue' })
    fireEvent.mouseDown(button)
    expect(button.style.background).toBe('var(--accent2)')
    expect(button.style.color).toBe('var(--accent2-ink)')
  })

  it('default/hover (non-pressed) state is untouched: still --bg text on --accent — the resting brand pairing this fix must not alter', () => {
    render(<Button label="Continue" variant="primary" onPress={() => {}} />)
    const button = screen.getByRole('button', { name: 'Continue' })
    expect(button.style.background).toBe('var(--accent)')
    expect(button.style.color).toBe('var(--bg)')
    fireEvent.mouseEnter(button)
    expect(button.style.background).toBe('var(--accent)')
    expect(button.style.color).toBe('var(--bg)')
  })

  it('mouseup/mouseleave clears the pressed state back to --bg on --accent', () => {
    render(<Button label="Continue" variant="primary" onPress={() => {}} />)
    const button = screen.getByRole('button', { name: 'Continue' })
    fireEvent.mouseDown(button)
    expect(button.style.color).toBe('var(--accent2-ink)')
    fireEvent.mouseUp(button)
    expect(button.style.background).toBe('var(--accent)')
    expect(button.style.color).toBe('var(--bg)')
  })

  it('tokens.css dark block: --accent2-ink on --accent2 computes to ~5.18:1, clearing the 4.5:1 AA floor', () => {
    const css = readTokensCss()
    const accent2 = tokenValue(css, 'dark', 'accent2')
    const accent2Ink = tokenValue(css, 'dark', 'accent2-ink')
    expect(accent2).toBe('#2d5bff')
    expect(accent2Ink).toBe('#ffffff')
    const ratio = contrastRatio(accent2, accent2Ink)
    expect(ratio).toBeCloseTo(5.18, 1)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('discriminates: the ORIGINAL defect pairing (dark --bg #000000 on --accent2 #2d5bff) genuinely reproduces at ~4.05:1 and fails AA — this check is not vacuous', () => {
    const css = readTokensCss()
    const accent2 = tokenValue(css, 'dark', 'accent2')
    const bg = tokenValue(css, 'dark', 'bg')
    expect(bg).toBe('#000000')
    const ratio = contrastRatio(accent2, bg)
    expect(ratio).toBeCloseTo(4.05, 1)
    expect(ratio).toBeLessThan(4.5)
  })

  it('tokens.css light block: --accent2-ink on --accent2 also clears AA — the fix does not rely on --bg happening to equal white in light mode', () => {
    const css = readTokensCss()
    const accent2 = tokenValue(css, 'light', 'accent2')
    const accent2Ink = tokenValue(css, 'light', 'accent2-ink')
    expect(accent2Ink).toBe('#ffffff')
    const ratio = contrastRatio(accent2, accent2Ink)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
})

describe('F11 — ALL-CAPS letter-spacing at doctrine TYP-4 (+0.05em), every known site', () => {
  const SITES: Array<{ file: string; label: string }> = [
    { file: 'components/primitives/Label.tsx', label: 'Label eyebrow variant' },
    { file: 'components/PlanTable.tsx', label: 'PlanTable thStyle' },
    { file: 'components/PresenterRail.tsx', label: 'PresenterRail RULES_HEADING_STYLE' },
    { file: 'components/SliderControlRow.tsx', label: 'SliderControlRow eyebrowStyle' },
    { file: 'screens/InvestmentDesign.tsx', label: 'InvestmentDesign miniThStyle' },
    { file: 'screens/Roadmap.tsx', label: 'Roadmap kpiLabelStyle + quarterHeadStyle (2 sites)' },
    { file: 'screens/StudioAsk.tsx', label: 'StudioAsk SOURCES_HEADING_STYLE' },
    { file: 'views/NotificationBellPanel.tsx', label: 'NotificationBellPanel headerStyle' },
  ]

  it.each(SITES)('$label ($file): every letterSpacing declaration is exactly 0.05em', ({ file }) => {
    const src = readSrc(file)
    const matches = [...src.matchAll(/letterSpacing:\s*'([^']+)'/g)].map((m) => m[1])
    expect(matches.length).toBeGreaterThan(0)
    for (const value of matches) {
      expect(value).toBe('0.05em')
    }
  })

  it('project-wide sweep: no inline letterSpacing value anywhere in src/ (outside __tests__) is 0.06em/0.07em/0.08em or anything other than 0.05em', () => {
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === '__tests__') continue
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(full)
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
          const text = readFileSync(full, 'utf8')
          for (const m of text.matchAll(/letterSpacing:\s*'([^']+)'/g)) {
            if (m[1] !== '0.05em') {
              offenders.push(`${path.relative(srcRoot, full)}: letterSpacing '${m[1]}'`)
            }
          }
        }
      }
    }
    walk(srcRoot)
    expect(offenders).toEqual([])
  })

  it('project-wide sweep: exactly 10 inline letterSpacing declarations exist in src/ — the full F11 site count (9 original + DataTable.tsx groupCellStyle, brought into TYP-4 compliance at 0.05em rather than exempted); a silent 11th site (compliant or not) fails this canary', () => {
    let count = 0
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === '__tests__') continue
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(full)
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
          const text = readFileSync(full, 'utf8')
          count += [...text.matchAll(/letterSpacing:\s*'[^']+'/g)].length
        }
      }
    }
    walk(srcRoot)
    expect(count).toBe(10)
  })
})
