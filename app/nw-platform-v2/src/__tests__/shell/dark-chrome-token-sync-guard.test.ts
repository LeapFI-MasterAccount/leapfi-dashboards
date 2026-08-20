/**
 * Dark-chrome token sync-guard — r13 A.3 / PI2-D10 (sync-guard half only;
 * the spec-amendment half of PI2-D10 lands separately in
 * `design_system_spec.md` §1.2, out of this dispatch's ALLOWLIST).
 *
 * Background (`implementation/03-token-and-template-decisions.md` §1;
 * `planning/r13_drift_retirement.md` §A.3; `implementation/DECISIONS.md`
 * PI2-D10): `Topbar.tsx`'s `TOPBAR_DARK_CHROME_CSS` and `Sidebar.tsx`'s
 * `SIDEBAR_DARK_CHROME_CSS` each duplicate a scoped block of core-palette
 * custom properties, copied verbatim from `theme/tokens.css`'s
 * `:root, [data-theme='dark']` block (Topbar additionally restores the
 * `[data-theme='light']` block for its ProfileMenu popover carve-out). A
 * brand audit ruled this duplication COMPLIANT-WITH-GUARD, but the "guard"
 * was code-comment discipline only — nothing mechanical stopped the two
 * files from drifting apart if `tokens.css` changed without a matching
 * edit to the two component files, or vice versa.
 *
 * This test makes that guard mechanical: it reads all three source files
 * from disk as text at test time (never imports/duplicates the palette
 * values itself), extracts each named custom property's value via regex,
 * and asserts value-for-value equality between each scoped block and its
 * cited source block in `tokens.css`. If either side drifts, this test
 * fails — it does not merely fail to update a comment.
 *
 * Sites swept (grep for `DARK_CHROME_CSS` / `dark-chrome` / `dark chrome` /
 * `DarkChrome`, case-insensitive, across `src/`): `Topbar.tsx` and
 * `Sidebar.tsx` are the only two sites in this tree with a scoped
 * dark-chrome custom-property block today. `r13_drift_retirement.md` §A.3
 * additionally names QuickFind's candidate-list overlay (r16, PI2-D8) as a
 * site this guard "must cover" once it exists — grepped for `QuickFind`,
 * `candidate-list`, `CommandPalette`, `Palette`: no such component exists
 * in this worktree yet (only ID-resolution comments in `App.tsx` /
 * `OnSideOverview.tsx` reference the r16 QuickFind interaction shape, no
 * overlay component). There is no scoped dark-chrome block there to pin
 * because there is no component there yet; this file's helpers are
 * written to make adding that third site a one-line addition to
 * `SCOPED_SITES` below once it lands, not a re-architecture.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.resolve(__dirname, '../..')

function readSource(relPath: string): string {
  return readFileSync(path.join(SRC_DIR, relPath), 'utf-8')
}

/** Extracts `--name: value;` pairs from a CSS-rule-body string (text between
 * one rule's `{` and its matching `}`). Deliberately does not attempt to
 * parse nested rules — none of the sites this guard covers have any. */
function extractDeclarations(ruleBody: string): Record<string, string> {
  const decls: Record<string, string> = {}
  const re = /--([\w-]+)\s*:\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = re.exec(ruleBody))) {
    const [, name, value] = m
    if (name === undefined || value === undefined) continue
    decls[name] = value.trim()
  }
  return decls
}

/** Extracts the body of the first top-level `selector { ... }` rule found
 * whose selector text contains `selectorContains`, starting the search at
 * `fromIndex`. Returns the rule body and the index just past its closing
 * brace, so callers can chain lookups for a second rule in the same
 * template literal (Topbar's light-restore rule follows its dark rule). */
function findRuleBody(css: string, selectorContains: string, fromIndex = 0): { body: string; endIndex: number } {
  const selIdx = css.indexOf(selectorContains, fromIndex)
  if (selIdx === -1) {
    throw new Error(`Could not find a selector containing "${selectorContains}" from index ${fromIndex}`)
  }
  const openBrace = css.indexOf('{', selIdx)
  const closeBrace = css.indexOf('}', openBrace)
  if (openBrace === -1 || closeBrace === -1) {
    throw new Error(`Could not find a complete rule body for selector containing "${selectorContains}"`)
  }
  return { body: css.slice(openBrace + 1, closeBrace), endIndex: closeBrace + 1 }
}

/** Extracts the raw template-literal contents of `const NAME = \`...\`;` */
function extractTemplateLiteral(source: string, constName: string): string {
  const marker = `const ${constName} = \``
  const start = source.indexOf(marker)
  if (start === -1) {
    throw new Error(`Could not find "const ${constName} = \`" in source`)
  }
  const bodyStart = start + marker.length
  const end = source.indexOf('`;', bodyStart)
  if (end === -1) {
    throw new Error(`Could not find closing backtick for ${constName}`)
  }
  return source.slice(bodyStart, end)
}

const tokensCss = readSource('theme/tokens.css')
const darkBlock = findRuleBody(tokensCss, "[data-theme='dark']").body
const lightBlock = findRuleBody(tokensCss, "[data-theme='light']").body
const darkTokens = extractDeclarations(darkBlock)
const lightTokens = extractDeclarations(lightBlock)

function expectSubsetMatches(scoped: Record<string, string>, source: Record<string, string>, sourceLabel: string) {
  const scopedNames = Object.keys(scoped)
  expect(scopedNames.length, 'scoped block must declare at least one custom property').toBeGreaterThan(0)
  for (const name of scopedNames) {
    expect(source, `tokens.css's ${sourceLabel} block has no --${name} to pin against`).toHaveProperty(name)
    expect(scoped[name], `--${name} in the scoped block must match tokens.css's ${sourceLabel} value`).toBe(source[name])
  }
}

describe('dark-chrome scoped-token sync guard (r13 A.3 / PI2-D10)', () => {
  describe('Topbar.tsx TOPBAR_DARK_CHROME_CSS', () => {
    const topbarSource = readSource('components/Topbar.tsx')
    const template = extractTemplateLiteral(topbarSource, 'TOPBAR_DARK_CHROME_CSS')
    const darkRule = findRuleBody(template, "[data-lf-composite='topbar']")
    const lightRule = findRuleBody(template, "[data-lf-composite='profile-menu-list']", darkRule.endIndex)
    const scopedDark = extractDeclarations(darkRule.body)
    const scopedLight = extractDeclarations(lightRule.body)

    it("pins every custom property in the [data-lf-composite='topbar'] rule to tokens.css's dark block", () => {
      expectSubsetMatches(scopedDark, darkTokens, "[data-theme='dark']")
    })

    it("pins every custom property in the ProfileMenu light-restore rule to tokens.css's light block", () => {
      expectSubsetMatches(scopedLight, lightTokens, "[data-theme='light']")
    })
  })

  describe('Sidebar.tsx SIDEBAR_DARK_CHROME_CSS', () => {
    const sidebarSource = readSource('components/Sidebar.tsx')
    const template = extractTemplateLiteral(sidebarSource, 'SIDEBAR_DARK_CHROME_CSS')
    const darkRule = findRuleBody(template, "[data-lf-composite='sidebar']")
    const scopedDark = extractDeclarations(darkRule.body)

    it("pins every custom property in the [data-lf-composite='sidebar'] rule to tokens.css's dark block", () => {
      expectSubsetMatches(scopedDark, darkTokens, "[data-theme='dark']")
    })
  })

  describe('Topbar/Sidebar scoped dark blocks agree with each other', () => {
    it('both components pin an identical set of dark-chrome custom properties (same source block, D21 chrome family)', () => {
      const topbarSource = readSource('components/Topbar.tsx')
      const sidebarSource = readSource('components/Sidebar.tsx')
      const topbarDark = extractDeclarations(
        findRuleBody(extractTemplateLiteral(topbarSource, 'TOPBAR_DARK_CHROME_CSS'), "[data-lf-composite='topbar']").body,
      )
      const sidebarDark = extractDeclarations(
        findRuleBody(extractTemplateLiteral(sidebarSource, 'SIDEBAR_DARK_CHROME_CSS'), "[data-lf-composite='sidebar']").body,
      )
      expect(sidebarDark).toEqual(topbarDark)
    })
  })
})
