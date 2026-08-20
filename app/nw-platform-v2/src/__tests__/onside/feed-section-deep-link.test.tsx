/**
 * OnSide · Regulatory feed — 'section'-kind deep link consumption
 * (hostile-review fix wave, Class A / A3). Sprint 1's hostile review
 * confirmed 'section' fires from 3 live sites all targeting
 * `onside.feed` (`HomePanels.tsx`'s "Full lifecycle →" panel-header link
 * and its Strategic Signal drawer action, both id 'lifecycle';
 * `InvestmentDesign.tsx`'s "See the gap queue" play-drawer action, id
 * 'gaps') with NO consumer anywhere — `OnSideFeed.tsx` handled only
 * 'feed-source' and 'signal' (that file's own header, "ALSO STILL OPEN").
 *
 * This dispatch wires the 'lifecycle' id: it resolves to a real,
 * unambiguous section already rendered on this screen
 * (`RegulatoryFeedLifecycle`, below the signal table) and scrolls/focuses
 * it, the identical handoff `handleOpenSources` already uses for
 * 'feed-source' (`feed-source-drawer.test.tsx`'s own precedent).
 *
 * The 'gaps' id is DELIBERATELY left unresolved here — a STOP-item, not
 * an oversight: `HomePanels.tsx`'s own file header documents a live
 * disagreement between App.tsx's KIND VOCABULARY comment / this exact
 * `InvestmentDesign.tsx` producer (both name `onside.feed` as 'gaps'
 * target) and `HomePanels.tsx`'s own established, test-pinned convention
 * (its `buildQueueBucket` 'q-gaps'/'q-below' rows and "All open items →"
 * link) that targets `onside.documents` instead for the same base concept.
 * Picking a side here would resolve that ambiguity by implementer fiat,
 * not a design decision — flagged in `spec_questions`, not silently
 * decided. An id this effect does not recognize (including 'gaps') still
 * consumes the nonce (never gets stuck) but opens nothing — the same
 * defensive "no fabricated destination" shape this screen's 'feed-source'/
 * 'signal' effects and every other deep-link consumer in this codebase
 * already use for an unresolvable id.
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { OnSideFeed } from '../../screens/OnSideFeed'
import type { DeepLinkTarget } from '../../App'
import { makeTopbarProps } from './helpers'

beforeAll(() => {
  // jsdom has no scrollIntoView — see feed-source-drawer.test.tsx's
  // identical stub for the same reason (handleOpenSources/handleOpenLifecycle).
  Element.prototype.scrollIntoView = vi.fn()
})

beforeEach(() => {
  // The stub above is installed ONCE (module-level jsdom prototype patch);
  // clear its call history between tests so one test's scroll never leaks
  // into the next test's "was scrollIntoView called" assertion.
  vi.mocked(Element.prototype.scrollIntoView).mockClear()
})

function renderFeed(deepLink?: DeepLinkTarget, onDeepLinkConsumed?: (nonce: number) => void) {
  return render(
    <OnSideFeed
      topbar={makeTopbarProps()}
      onNavigate={() => {}}
      {...(deepLink !== undefined ? { deepLink } : {})}
      {...(onDeepLinkConsumed !== undefined ? { onDeepLinkConsumed } : {})}
    />,
  )
}

describe("Hostile-review fix wave (A3) — 'section'-kind deep link, id 'lifecycle'", () => {
  it('scrolls to and focuses the Rulemaking lifecycle section, and consumes the nonce', async () => {
    const onDeepLinkConsumed = vi.fn()
    renderFeed({ screen: 'onside.feed', kind: 'section', id: 'lifecycle', nonce: 1 }, onDeepLinkConsumed)

    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled())
    await waitFor(() => {
      const section = document.querySelector('[data-lf-section="lifecycle"]')
      expect(section).toHaveFocus()
    })
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(1)
  })

  it('a deepLink of a different kind is ignored — never mistaken for a section open', () => {
    const onDeepLinkConsumed = vi.fn()
    renderFeed({ screen: 'onside.feed', kind: 'signal', id: 'lifecycle', nonce: 2 }, onDeepLinkConsumed)

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })
})

describe("Hostile-review fix wave (A3) — 'section'-kind deep link, unrecognized id (including 'gaps', a deliberate STOP-item — see this file's header)", () => {
  it("id 'gaps' still consumes the nonce but scrolls/focuses nothing (never a fabricated destination for the disputed target-screen id)", () => {
    const onDeepLinkConsumed = vi.fn()
    renderFeed({ screen: 'onside.feed', kind: 'section', id: 'gaps', nonce: 3 }, onDeepLinkConsumed)

    expect(onDeepLinkConsumed).toHaveBeenCalledWith(3)
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })
})
