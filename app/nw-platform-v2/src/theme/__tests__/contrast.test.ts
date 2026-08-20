/**
 * Programmatic WCAG contrast regression — hostile-review fix wave, Class C
 * (contrast/brand). Computes contrast ratios directly from the values
 * this file reads out of tokens.css (never hand-copied), so a future edit
 * to a token's hex silently re-opens or silently "fixes" a pairing this
 * suite will catch either way.
 *
 * Two layers:
 *  1. Token-math (`describe('token contrast (WCAG 2.1)')`): pins the
 *     numbers behind C1 (`--ink2` on `--panel`, light theme, fails 4.5:1)
 *     and C2 (`var(--bg)` on the semantic fills, light theme, fails
 *     4.5:1), and proves the brand authority's prescribed substitutes
 *     (`--chart-axis`, `--sem-ink`) clear 4.5:1 in BOTH themes.
 *  2. Static source sweep (`describe('C1 regression sweep')`): scans every
 *     .ts/.tsx file under src/ for a style object literal that carries
 *     `var(--panel)` and `var(--ink2)` together — the literal co-located
 *     shape C1's confirmed sites (PosturePillBar.tsx, OnSideDocuments.tsx
 *     COUNT_BADGE_STYLE, DomainsAccordion.tsx pillSoftStyle, ...) had
 *     before this fix wave. This catches re-introduction of that specific
 *     shape; it does NOT (and cannot, without a real DOM) catch a
 *     background inherited from an ANCESTOR many lines away (e.g.
 *     CaseDetail.tsx's CITE_STYLE, whose panel background lives in a
 *     sibling CARD_STYLE const) — those sites are pinned individually in
 *     `__tests__/components/panel-seated-contrast.test.tsx` and by this
 *     file's own code comments citing the DOM trace at each site.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_CSS_PATH = join(__dirname, '../tokens.css');
const SRC_ROOT = join(__dirname, '../../');

// ---------------------------------------------------------------------
// WCAG 2.1 relative luminance / contrast ratio (SC 1.4.3), computed from
// hex, not hand-asserted numbers.
// ---------------------------------------------------------------------
function srgbChannelToLinear(c8: number): number {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const R = srgbChannelToLinear(r);
  const G = srgbChannelToLinear(g);
  const B = srgbChannelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

const AA_TEXT_FLOOR = 4.5;

// ---------------------------------------------------------------------
// tokens.css parsing — extracts `--name: #hexhex;` pairs from the dark
// (`:root, [data-theme='dark']`) and light (`[data-theme='light']`)
// blocks. Deliberately reads the real file (not a hand-copied fixture)
// so this suite tracks tokens.css, not a snapshot of it.
// ---------------------------------------------------------------------
function extractBlock(css: string, blockOpenPattern: RegExp): string {
  const openMatch = blockOpenPattern.exec(css);
  if (!openMatch) throw new Error(`tokens.css block not found for pattern: ${blockOpenPattern}`);
  const braceStart = css.indexOf('{', openMatch.index);
  let depth = 0;
  for (let i = braceStart; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) return css.slice(braceStart, i + 1);
    }
  }
  throw new Error('unterminated tokens.css block');
}

function extractTokens(block: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const re = /--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const name = m[1];
    const hex = m[2];
    if (name === undefined || hex === undefined) continue;
    tokens[name] = hex.toLowerCase();
  }
  return tokens;
}

const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf8');
const darkBlock = extractBlock(tokensCss, /:root,\s*\[data-theme=['"]dark['"]\]\s*\{/);
const lightBlock = extractBlock(tokensCss, /\[data-theme=['"]light['"]\]\s*\{/);
const dark = extractTokens(darkBlock);
const light = extractTokens(lightBlock);

describe('theme/tokens.css parsing — sanity (the sweep below is only trustworthy if these are real)', () => {
  it('extracted the expected hex values for the tokens this suite depends on', () => {
    expect(dark['panel']).toBe('#0d1525');
    expect(dark['ink2']).toBe('#9ba0a6');
    expect(dark['chart-axis']).toBe('#7c8ca3');
    expect(dark['sem-ink']).toBe('#000000');
    expect(light['panel']).toBe('#f1f5f9');
    expect(light['ink2']).toBe('#64748b');
    expect(light['chart-axis']).toBe('#5a6b82');
    expect(light['bg']).toBe('#ffffff');
    expect(light['sem-ink']).toBe('#000000');
  });
});

describe('token contrast (WCAG 2.1, 4.5:1 AA text floor) — C1: --ink2 on --panel', () => {
  it('FORBIDDEN PAIR — light theme: --ink2 on --panel fails 4.5:1 (this is the bug C1 exists to keep off --panel)', () => {
    const ratio = contrastRatio(light['ink2']!, light['panel']!);
    expect(ratio).toBeLessThan(AA_TEXT_FLOOR);
    expect(ratio).toBeCloseTo(4.344, 2);
  });

  it('dark theme: --ink2 on --panel already clears 4.5:1 (not broken; C1 is light-theme-only)', () => {
    const ratio = contrastRatio(dark['ink2']!, dark['panel']!);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT_FLOOR);
  });

  it('PRESCRIBED SUBSTITUTE — --chart-axis on --panel clears 4.5:1 in BOTH themes (the fix is theme-agnostic, no branching needed)', () => {
    const lightRatio = contrastRatio(light['chart-axis']!, light['panel']!);
    const darkRatio = contrastRatio(dark['chart-axis']!, dark['panel']!);
    expect(lightRatio).toBeGreaterThanOrEqual(AA_TEXT_FLOOR);
    expect(darkRatio).toBeGreaterThanOrEqual(AA_TEXT_FLOOR);
  });
});

describe('token contrast (WCAG 2.1, 4.5:1 AA text floor) — C2: Tag status-variant text on the semantic fills', () => {
  // EXT-3 semantic hexes are theme-invariant ("Hexes unchanged across
  // themes") — pull once, from either block, and confirm both blocks
  // agree (guards the "invariant" assumption itself).
  it('sem-positive/caution/alert hexes really are identical across both theme blocks', () => {
    expect(dark['sem-positive']).toBe(light['sem-positive']);
    expect(dark['sem-caution']).toBe(light['sem-caution']);
    expect(dark['sem-alert']).toBe(light['sem-alert']);
  });

  const fills = ['sem-positive', 'sem-caution', 'sem-alert'] as const;

  it.each(fills)('FORBIDDEN PAIR — light-theme --bg (white) on %s fails 4.5:1 (the pre-fix Tag.tsx bug, reproduced from tokens)', (fillKey) => {
    const ratio = contrastRatio(light['bg']!, light[fillKey]!);
    expect(ratio).toBeLessThan(AA_TEXT_FLOOR);
  });

  it.each(fills)('PRESCRIBED SUBSTITUTE — --sem-ink (fixed black) on %s clears 4.5:1', (fillKey) => {
    const ratio = contrastRatio(dark['sem-ink']!, dark[fillKey]!);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT_FLOOR);
    // sem-ink is pinned identically in both blocks (not a per-theme
    // value) — confirm the light block agrees, and that the fill itself
    // is the same hex either way (already asserted above).
    expect(light['sem-ink']).toBe(dark['sem-ink']);
  });
});

// ---------------------------------------------------------------------
// Static source sweep — catches literal `var(--panel)` + `var(--ink2)`
// co-located inside the SAME style-object-literal brace pair, anywhere
// under src/ (excluding this test tree and node_modules-style dirs).
// ---------------------------------------------------------------------
function extractEnclosingBraces(text: string, matchIndex: number): string | null {
  let depth = 0;
  let start = -1;
  for (let i = matchIndex; i >= 0; i--) {
    const ch = text[i];
    if (ch === '}') depth++;
    else if (ch === '{') {
      if (depth === 0) {
        start = i;
        break;
      }
      depth--;
    }
  }
  if (start === -1) return null;
  depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function findCoLocatedPanelInk2Violations(fileText: string): string[] {
  const violations: string[] = [];
  const re = /var\(--ink2\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(fileText)) !== null) {
    const enclosing = extractEnclosingBraces(fileText, m.index);
    if (enclosing && enclosing.includes('var(--panel)')) {
      violations.push(enclosing.replace(/\s+/g, ' ').trim());
    }
  }
  return violations;
}

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if ((entry.endsWith('.ts') || entry.endsWith('.tsx')) && !entry.endsWith('.test.ts') && !entry.endsWith('.test.tsx')) {
      out.push(full);
    }
  }
  return out;
}

describe('C1 regression sweep — the utility function itself discriminates (proof it is not a no-op check)', () => {
  it('flags a synthetic co-located violation', () => {
    const violating = `const x = { background: 'var(--panel)', color: 'var(--ink2)' };`;
    expect(findCoLocatedPanelInk2Violations(violating)).toHaveLength(1);
  });

  it('does NOT flag --ink2 on a non-panel background (no false positive)', () => {
    const compliant = `const x = { background: 'var(--bg)', color: 'var(--ink2)' };`;
    expect(findCoLocatedPanelInk2Violations(compliant)).toHaveLength(0);
  });

  it('does NOT flag the prescribed --chart-axis substitute on --panel', () => {
    const fixed = `const x = { background: 'var(--panel)', color: 'var(--chart-axis)' };`;
    expect(findCoLocatedPanelInk2Violations(fixed)).toHaveLength(0);
  });
});

describe('C1 regression sweep — src/ (real files, "cannot silently return")', () => {
  it('zero literal var(--panel) + var(--ink2) co-locations anywhere under src/', () => {
    const files = listSourceFiles(SRC_ROOT);
    expect(files.length).toBeGreaterThan(50); // sanity: the sweep is actually walking the tree
    const allViolations: { file: string; snippet: string }[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const snippet of findCoLocatedPanelInk2Violations(text)) {
        allViolations.push({ file, snippet });
      }
    }
    expect(allViolations).toEqual([]);
  });
});
