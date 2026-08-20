/**
 * Deep-link dispatch → consume matrix guard (hostile-review fix wave,
 * Class A / A5). Sprint 1's hostile review (sprint1-hostile-verdict.md,
 * findings A1–A5) confirmed that `App.tsx`'s `DeepLinkKind` union had
 * three producer-dispatched kinds ('doc-redline', 'obligation', 'section')
 * with NO consumer anywhere — a presenter-facing dead click on every real
 * dispatch site. The union's own KIND VOCABULARY comment described all 11
 * kinds in equally confident prose with no signal of which actually
 * deliver.
 *
 * This test makes "every dispatched kind has a consumer" MECHANICAL
 * rather than a claim resting on a code comment: it reads every non-test
 * `.tsx`/`.ts` source file under `src/` from disk as text, extracts every
 * `DeepLinkRequest`-shaped object literal's `kind` (the `{ screen: '...',
 * kind: '...', id: ... }` shape every real producer call site in this
 * codebase uses verbatim — App.tsx's own header, "PLUMBED EVERYWHERE NOW")
 * as the PRODUCED set, extracts every `deepLink.kind !== '...'` /
 * `deepLink.kind === '...'` consumer guard (the one pattern every
 * consuming screen's nonce-keyed effect uses, per App.tsx's documented
 * CONSUME contract) as the CONSUMED set, and asserts PRODUCED ⊆ CONSUMED.
 * A kind dispatched with no matching consumer guard anywhere fails this
 * test by name — it does not merely fail to update a comment.
 *
 * Sites swept (grep for `onDeepLink(`, `onDeepLink?.(`, `fireOrDeepLink(`,
 * `deepLink.kind` across `src/`, non-test): App.tsx, HomePanels.tsx,
 * Reporting.tsx, StudioAsk.tsx, Roadmap.tsx, InvestmentDesign.tsx,
 * OnSideFeed.tsx, OnSideOwnership.tsx, OnSideOverview.tsx,
 * OnSideDocuments.tsx, Cases.tsx, CaseDetail.tsx — every producer and
 * consumer site in the tree as of this dispatch.
 *
 * This does NOT assert per-id delivery (e.g. that 'section' id 'gaps'
 * specifically opens something) — only the coarser, mechanically provable
 * claim the KIND VOCABULARY comment's own promise actually requires: a
 * screen exists that inspects `deepLink.kind` for that value at all. Id-
 * level fidelity for every kind is covered by each screen's own dedicated
 * deep-link test file (`onside/overview.test.tsx`,
 * `onside/feed-section-deep-link.test.tsx`, `onside/documents-universe.test.tsx`,
 * etc).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.resolve(__dirname, '../..')

/** Every `.ts`/`.tsx` file under `src/`, excluding `__tests__` and
 * `test-setup.ts` — production source only, walked recursively. */
function listSourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(full))
    } else if (/\.(ts|tsx)$/.test(entry.name) && entry.name !== 'test-setup.ts') {
      out.push(full)
    }
  }
  return out
}

const SOURCE_FILES = listSourceFiles(SRC_DIR)
const SOURCE_TEXT = SOURCE_FILES.map((f) => readFileSync(f, 'utf-8')).join('\n')

/** A real `DeepLinkRequest` object literal, verbatim shape every producer
 * call site in this codebase uses: `{ screen: '<id>', kind: '<kind>',
 * id: ... }`. Deliberately anchored on the `screen:` field immediately
 * preceding `kind:` so this never matches an unrelated `kind:` literal
 * elsewhere in the tree (DrawerContentKind, DeckSlideKind, CaseActionKind,
 * etc. — none of those object literals lead with a `screen:` field). */
const PRODUCER_RE = /screen:\s*'[^']+',\s*kind:\s*'([^']+)'/g

/** The one consumer-guard shape every deep-link-consuming screen's
 * nonce-keyed effect uses (App.tsx's documented CONSUME contract):
 * `deepLink.kind !== '<kind>'` (early-return guard) or `deepLink.kind
 * === '<kind>'` (positive check). */
const CONSUMER_RE = /deepLink\??\.kind\s*(?:!==|===)\s*'([^']+)'/g

function extractKinds(re: RegExp, text: string): Set<string> {
  const found = new Set<string>()
  let m: RegExpExecArray | null
  re.lastIndex = 0
  while ((m = re.exec(text))) {
    const kind = m[1]
    if (kind !== undefined) found.add(kind)
  }
  return found
}

describe('DeepLinkKind dispatch -> consume matrix (hostile-review fix wave, Class A / A5)', () => {
  it('every kind dispatched from a real producer call site has at least one consumer guard somewhere in src/', () => {
    const produced = extractKinds(PRODUCER_RE, SOURCE_TEXT)
    const consumed = extractKinds(CONSUMER_RE, SOURCE_TEXT)

    // Sanity: this sweep must actually find real producer/consumer sites,
    // never silently pass on an empty set (a refactor that renamed the
    // object-literal shape would otherwise make this test vacuously green).
    expect(produced.size).toBeGreaterThan(0)
    expect(consumed.size).toBeGreaterThan(0)

    const dispatchedWithNoConsumer = [...produced].filter((kind) => !consumed.has(kind)).sort()

    expect(dispatchedWithNoConsumer).toEqual([])
  })

  it('sanity: the extraction actually sees the known Class 1 kinds (never a silently broken regex)', () => {
    const produced = extractKinds(PRODUCER_RE, SOURCE_TEXT)
    const consumed = extractKinds(CONSUMER_RE, SOURCE_TEXT)
    for (const kind of ['domain', 'play', 'case', 'document', 'report']) {
      expect(produced.has(kind)).toBe(true)
      expect(consumed.has(kind)).toBe(true)
    }
  })
})
