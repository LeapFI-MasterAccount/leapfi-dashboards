/**
 * OnSide · Regulatory feed — signal-table scroll-collapse regression.
 *
 * BUG (measured live at localhost:8901, OnSide → Regulatory feed):
 * `<main id="onside-feed-main">` is a `flex-direction:column` flex
 * container with a resolved (not literal) definite height, produced by
 * flexing to fill `100vh` minus the Topbar (`SCREEN_STYLE`/`BODY_ROW_STYLE`
 * in `OnSideFeed.tsx`) — this is the intentional "scroll inside the shell"
 * pattern (`overflow-y:auto` on `main`) that a prior fix wave put in place
 * on purpose, so it is not itself the defect.
 *
 * The signal table's scroll wrapper (`SCROLL_WRAP_STYLE`,
 * `overflowX:'auto'`) is a flex ITEM of that column. Per the CSS Overflow
 * spec, setting only `overflow-x` on an element whose `overflow-y` is still
 * `visible` makes the *other* axis compute to `auto` too (the "one axis
 * non-visible forces the other to auto" rule), so this element is a scroll
 * container in BOTH axes. Per CSS Flexbox's automatic-minimum-size rule, a
 * scroll container's `min-height:auto` resolves to `0`, while every
 * sibling that is NOT a scroll container (the h1, the FilterBar, the three
 * below-the-fold sections) keeps its content-based automatic minimum and
 * refuses to shrink below it. With default `flex-shrink:1` and no
 * `min-height` override, the wrapper is therefore the only flex item that
 * CAN shrink to satisfy the column's constrained height — and it shrinks
 * all the way to 0, taking its 40-row `<table>` with it. The data is
 * intact; it is rendered at zero height.
 *
 * jsdom performs no real layout, so a height assertion here would be
 * vacuous (it would "pass" whether or not the collapse mechanism is
 * present). Instead this test pins the STYLE CONTRACT that the browser's
 * flex algorithm actually consults: the wrapper must declare a
 * `flexShrink` of `0` so it is excluded from the automatic-minimum-size
 * trap above, no matter what its `min-height` resolves to. Before the fix
 * `SCROLL_WRAP_STYLE` carries no `flexShrink` at all (the default `1`
 * applies), which is precisely the crush condition — so this assertion
 * fails against the unfixed component and only passes once the wrapper is
 * excluded from flex-shrinking.
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OnSideFeed } from '../../screens/OnSideFeed'
import { makeTopbarProps } from './helpers'

function renderFeed() {
  return render(<OnSideFeed topbar={makeTopbarProps()} onNavigate={() => {}} />)
}

describe('OnSide feed · signal table scroll-collapse (flex-shrink crush)', () => {
  it('is mounted inside a height-constrained flex column main (the condition the crush depends on)', () => {
    renderFeed()
    const main = document.getElementById('onside-feed-main')
    expect(main).not.toBeNull()
    // Sanity check on the mechanism's precondition, not the fix itself:
    // if this ever stops being a flex column, the crush mechanism this
    // test guards against no longer applies and this assertion should be
    // revisited alongside it.
    expect(main).toHaveStyle({ display: 'flex', flexDirection: 'column', overflowY: 'auto' })
  })

  it('does not let the signal table\'s horizontal-scroll wrapper flex-shrink away (the actual crush vector)', () => {
    renderFeed()
    const table = screen.getByRole('table', { name: 'Regulatory signals feed' })
    const wrapper = table.parentElement
    expect(wrapper).not.toBeNull()

    // This is the element whose automatic min-height resolves to 0 (it is
    // a scroll container per the CSS Overflow "other axis computes to
    // auto" rule) — the ONLY flex item in the column with no content-based
    // floor. Excluding it from shrinking at all (flexShrink: 0) is what
    // stops the flex algorithm from ever routing the overflow into it,
    // regardless of what its resolved min-height would otherwise be.
    expect(wrapper).toHaveStyle({ flexShrink: '0' })

    // The horizontal-scroll behavior this wrapper exists for (A-overlap-06)
    // must survive the fix untouched.
    expect(wrapper).toHaveStyle({ overflowX: 'auto' })
  })

  it('keeps every one of the 40 signal rows in the DOM (data was never the problem — rendering it at zero height was)', () => {
    renderFeed()
    const table = screen.getByRole('table', { name: 'Regulatory signals feed' })
    // header row + 40 data rows.
    expect(table.querySelectorAll('tbody tr').length).toBe(40)
  })
})
