/**
 * OnSide · Documents — document-library-table scroll-collapse regression.
 *
 * BUG (measured live at localhost:8901, OnSide → Documents): `<main
 * id="onside-documents-main">` is a `flex-direction:column` flex container
 * with a resolved (not literal) definite height, produced by flexing to
 * fill `100vh` minus the Topbar (`SCREEN_STYLE`/`BODY_ROW_STYLE` in
 * `OnSideDocuments.tsx`) — the intentional "scroll inside the shell"
 * pattern (`overflow-y:auto` on `main`), not itself the defect.
 *
 * The Document library table's scroll wrapper (`SCROLL_WRAP_STYLE`,
 * `overflowX:'auto'`) is a flex ITEM of that column at its `:815` use site
 * (a DIRECT child of `<main>` — unlike this same shared style's other two
 * uses at `:832`/`:862`, which sit inside a `<section>`/per-domain `<div>`
 * and are shielded from `<main>`'s shrink algorithm entirely). Per the CSS
 * Overflow spec, setting only `overflow-x` on an element whose
 * `overflow-y` is still `visible` makes the *other* axis compute to `auto`
 * too, so this element is a scroll container in BOTH axes. Per CSS
 * Flexbox's automatic-minimum-size rule, a scroll container's
 * `min-height:auto` resolves to `0`, while every direct-main-child sibling
 * that is NOT a scroll container (the h1, the FilterBar, the two
 * below-the-fold `<section>`s) keeps its content-based automatic minimum
 * and refuses to shrink below it. With default `flex-shrink:1` and no
 * `min-height` override, the wrapper at `:815` was therefore the only
 * direct-main-child flex item that CAN shrink to satisfy the column's
 * constrained height — and it shrank all the way to 0, taking the entire
 * Document library `<table>` with it. The data is intact; it was rendered
 * at zero height, with the page appearing to jump straight from the
 * FilterBar to "Open governance gaps."
 *
 * jsdom performs no real layout, so a height assertion here would be
 * vacuous (it would "pass" whether or not the collapse mechanism is
 * present). Instead this test pins the STYLE CONTRACT the browser's flex
 * algorithm actually consults: the wrapper must declare a `flexShrink` of
 * `0` so it is excluded from the automatic-minimum-size trap above, no
 * matter what its `min-height` resolves to. Before the fix
 * `SCROLL_WRAP_STYLE` carried no `flexShrink` at all (the default `1`
 * applies), which is precisely the crush condition — so this assertion
 * fails against the unfixed component and only passes once the wrapper is
 * excluded from flex-shrinking. Same fix layer as
 * `src/__tests__/onside/feed-scroll-collapse.test.tsx` (OnSideFeed's
 * identical mechanism, owned by another dispatch and not touched here).
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { OnSideDocuments } from '../../screens/OnSideDocuments'
import { DOCLIB } from '../../data/doclib'
import { makeTopbarProps } from './helpers'

const ALL_DOCS = Object.values(DOCLIB)

function renderDocuments() {
  return render(<OnSideDocuments topbar={makeTopbarProps()} onNavigate={() => {}} />)
}

describe('OnSide documents · document library table scroll-collapse (flex-shrink crush)', () => {
  it('is mounted inside a height-constrained flex column main (the condition the crush depends on)', () => {
    renderDocuments()
    const main = document.getElementById('onside-documents-main')
    expect(main).not.toBeNull()
    // Sanity check on the mechanism's precondition, not the fix itself: if
    // this ever stops being a flex column, the crush mechanism this test
    // guards against no longer applies and this assertion should be
    // revisited alongside it.
    expect(main).toHaveStyle({ display: 'flex', flexDirection: 'column', overflowY: 'auto' })
  })

  it("does not let the document library table's horizontal-scroll wrapper flex-shrink away (the actual crush vector)", () => {
    renderDocuments()
    const table = screen.getByRole('table', { name: 'Document library' })
    const wrapper = table.parentElement
    expect(wrapper).not.toBeNull()

    // This is the element whose automatic min-height resolves to 0 (it is
    // a scroll container per the CSS Overflow "other axis computes to
    // auto" rule) — the ONLY direct-main-child flex item with no
    // content-based floor. Excluding it from shrinking at all (flexShrink:
    // 0) is what stops the flex algorithm from ever routing the overflow
    // into it, regardless of what its resolved min-height would otherwise
    // be.
    expect(wrapper).toHaveStyle({ flexShrink: '0' })

    // The horizontal-scroll behavior this wrapper exists for must survive
    // the fix untouched.
    expect(wrapper).toHaveStyle({ overflowX: 'auto' })
  })

  it('keeps every document-library row in the DOM (data was never the problem — rendering it at zero height was)', () => {
    renderDocuments()
    const table = screen.getByRole('table', { name: 'Document library' })
    // header row + one row per DOCLIB entry.
    expect(within(table).getAllByRole('row')).toHaveLength(ALL_DOCS.length + 1)
  })

  it('still shields the shielded uses of the same shared wrapper style (Open governance gaps, Domain impact) — flexShrink:0 is a no-op there, not a new behavior', () => {
    renderDocuments()
    const gapsTable = screen.getByRole('table', { name: 'Open governance gaps board' })
    const gapsWrapper = gapsTable.parentElement
    expect(gapsWrapper).not.toBeNull()
    expect(gapsWrapper).toHaveStyle({ flexShrink: '0', overflowX: 'auto' })
    // Its parent is the non-scroll <section>, not <main> — the shield this
    // wrapper's crush-immunity depends on.
    expect((gapsWrapper as HTMLElement).parentElement?.tagName).toBe('SECTION')
  })
})
