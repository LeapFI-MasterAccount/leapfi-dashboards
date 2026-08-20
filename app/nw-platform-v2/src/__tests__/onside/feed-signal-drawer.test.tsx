/**
 * OnSide · Regulatory feed — signal table + row-level Review Drawer
 * regression (D17: pins the PORTED V1 BASE BEHAVIOR, not implementation).
 *
 * Base anchors (leapfi-platform.html @ 1c230fe, via survey_map.md):
 *  - 3243–3299  SRC_ITEMS — per-source signal tuples [daysAgo, date,
 *               title, note, action] (ported verbatim in data/onside.ts)
 *  - 3243–3403  signal-feed table region (design_system_spec.md §5.2
 *               "row kind: signal-row", row-level "Review" action)
 *  - 3503       Federal Reserve note carries a verbatim inline
 *               `<span class="tag info">New</span>` badge prefix
 *  - §d-5       single shared Drawer instance, never a second one
 *
 * Drawer contract pinned here is the PRE-W1 signal contract (OnSideFeed
 * W1 header: "the signal branch's title/fields/tags are unchanged"):
 * title `Signal — {source}`, exactly five fields (Source, Regulatory
 * layer, Date, Signal, Note).
 *
 * D18: nothing here touches Home's demo-entry affordance.
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideFeed } from '../../screens/OnSideFeed'
import { SRC_ITEMS } from '../../data/onside'
import { makeTopbarProps } from './helpers'

function renderFeed() {
  return render(<OnSideFeed topbar={makeTopbarProps()} onNavigate={() => {}} />)
}

function getSignalsTable() {
  return screen.getByRole('table', { name: 'Regulatory signals feed' })
}

/** Every SRC_ITEMS tuple is one feed row in the base (3243–3299). */
const EXPECTED_SIGNAL_COUNT = Object.values(SRC_ITEMS).reduce(
  (sum, entry) => sum + entry.items.length,
  0,
)

describe('OnSide feed · signal table (base 3243–3299 data, 3243–3403 region)', () => {
  it('renders one row per SRC_ITEMS tuple — 40 signals in the base dataset (base 3243–3299)', () => {
    renderFeed()
    // The verbatim base dataset carries exactly 40 tuples; both the
    // literal and the data-derived count must hold.
    expect(EXPECTED_SIGNAL_COUNT).toBe(40)
    const rows = within(getSignalsTable()).getAllByRole('row')
    expect(rows.length - 1).toBe(EXPECTED_SIGNAL_COUNT) // minus header row
  })

  it('surfaces the most recent signal first under the default date sort (base tuples carry daysAgo; NCUA 26-CU-07 is the 1-day item, base 3433)', () => {
    renderFeed()
    const rows = within(getSignalsTable()).getAllByRole('row')
    const firstBodyRow = rows[1]
    expect(firstBodyRow).toBeDefined()
    expect(firstBodyRow).toHaveTextContent('NCUA · 12 CFR Ch. VII')
    expect(firstBodyRow).toHaveTextContent('Aug 14, 2026')
    expect(firstBodyRow).toHaveTextContent(
      'Letter to Credit Unions 26-CU-07 · AI use in member service',
    )
  })

  it('renders the ported inline "New" badge as a real tag, never raw span markup (base 3503 Federal Reserve note)', () => {
    renderFeed()
    const table = getSignalsTable()
    const rows = within(table).getAllByRole('row')
    // 'extensions of credit to insiders' is unique to the Federal Reserve
    // Jul 31 tuple inside the signals table (base 3503).
    const fedRow = rows.find((row) =>
      row.textContent?.includes('extensions of credit to insiders'),
    )
    expect(fedRow).toBeDefined()
    expect(fedRow).toHaveTextContent('New')
    expect(fedRow).toHaveTextContent('Comment period open')
    // The base's literal `<span class="tag info">` markup must never leak
    // into the rendered text.
    expect(fedRow?.textContent).not.toContain('<span')
  })

  it('row-level Review opens the shared Drawer titled "Signal — {source}" with the five pre-W1 fields (base 3243–3403 + §d-5; pre-W1 signal contract)', async () => {
    const user = userEvent.setup()
    renderFeed()
    const reviewButtons = within(getSignalsTable()).getAllByRole('button', {
      name: 'Review',
    })
    const firstReview = reviewButtons[0]
    expect(firstReview).toBeDefined()
    await user.click(firstReview as HTMLElement)

    // Default sort puts the NCUA 1-day signal first (see test above), so
    // the first row's Review must open exactly this signal's detail.
    const dialog = await screen.findByRole('dialog', {
      name: 'Signal — NCUA · 12 CFR Ch. VII',
    })

    const fieldLabels = within(dialog)
      .getAllByRole('term')
      .map((dt) => dt.textContent)
    expect(fieldLabels).toEqual(['Source', 'Regulatory layer', 'Date', 'Signal', 'Note'])

    const fieldValues = within(dialog)
      .getAllByRole('definition')
      .map((dd) => dd.textContent)
    expect(fieldValues).toEqual([
      'NCUA · 12 CFR Ch. VII',
      'Financial · banking regulators',
      'Aug 14, 2026',
      'Letter to Credit Unions 26-CU-07 · AI use in member service',
      'Mapped to Consumer / UDAAP and AI Governance',
    ])
  })

  it('never mounts a second Drawer instance (survey_map.md §d-5, binding)', async () => {
    const user = userEvent.setup()
    renderFeed()
    const reviewButtons = within(getSignalsTable()).getAllByRole('button', {
      name: 'Review',
    })
    await user.click(reviewButtons[0] as HTMLElement)
    await screen.findByRole('dialog', { name: /^Signal — / })
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
  })
})

describe("PI2-D5 — 'signal'-kind deep link (App.tsx KIND VOCABULARY; r09 acceptance — dispatch a 'signal'-kind DeepLinkRequest at OnSideFeed.tsx and assert it opens the matching item directly)", () => {
  // OCC · 12 CFR Ch. I's first SRC_ITEMS tuple (data/onside.ts:414-419):
  // id encoding is `${sourceKey}::${itemIndex}` (OnSideFeed.tsx's own
  // `SignalRow.id`, ALL_SIGNAL_ROWS derivation) — never the row's own
  // exposed table identity, since the table has no id column.
  const SIGNAL_ID = 'OCC · 12 CFR Ch. I::0'

  it('opens the matching signal row directly, never the wrong row, and consumes the nonce', async () => {
    render(
      <OnSideFeed
        topbar={makeTopbarProps()}
        onNavigate={() => {}}
        deepLink={{ screen: 'onside.feed', kind: 'signal', id: SIGNAL_ID, nonce: 1 }}
        onDeepLinkConsumed={() => {}}
      />,
    )

    const dialog = await screen.findByRole('dialog', { name: 'Signal — OCC · 12 CFR Ch. I' })
    const fieldValues = within(dialog)
      .getAllByRole('definition')
      .map((dd) => dd.textContent)
    expect(fieldValues).toEqual([
      'OCC · 12 CFR Ch. I',
      'Financial · banking regulators',
      'Aug 12, 2026',
      'Bulletin 2026-24 · risk management of AI-assisted underwriting',
      'Mapped to Model Risk and Fair Lending registers',
    ])
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
  })

  it('consumes the nonce it was handed', async () => {
    const onDeepLinkConsumed = vi.fn()
    render(
      <OnSideFeed
        topbar={makeTopbarProps()}
        onNavigate={() => {}}
        deepLink={{ screen: 'onside.feed', kind: 'signal', id: SIGNAL_ID, nonce: 7 }}
        onDeepLinkConsumed={onDeepLinkConsumed}
      />,
    )
    await screen.findByRole('dialog', { name: 'Signal — OCC · 12 CFR Ch. I' })
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(7)
  })

  it('an unknown id still consumes the nonce but opens no Drawer (defensive guard, never a fabricated detail)', () => {
    const onDeepLinkConsumed = vi.fn()
    render(
      <OnSideFeed
        topbar={makeTopbarProps()}
        onNavigate={() => {}}
        deepLink={{ screen: 'onside.feed', kind: 'signal', id: 'no-such-signal', nonce: 8 }}
        onDeepLinkConsumed={onDeepLinkConsumed}
      />,
    )
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(8)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
