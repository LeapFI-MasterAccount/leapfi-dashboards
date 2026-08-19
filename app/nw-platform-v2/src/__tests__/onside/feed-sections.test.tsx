/**
 * OnSide · Regulatory feed — sources / lifecycle / in-force sections
 * regression (D17: pins the PORTED V1 BASE BEHAVIOR, anchors 3345–3497).
 *
 * Base anchors (leapfi-platform.html @ 1c230fe, via survey_map.md):
 *  - 3345–3387  digestCard — DIGEST/FREQ cadence picker, "Next send" line,
 *               "in this digest" count
 *  - 3349       freqDays()'s `r[1]||1` quirk: Real-time (0) counts as a
 *               1-day window (ported verbatim, flagged in the view header)
 *  - 3389–3403  osSources — 15 SRC_ROWS split into per-layer tables per
 *               SRC_LAYERS (3332–3336): Financial / Systemic / Regional
 *  - 3450–3483  osLifecycle — "Newly proposed" (NEW_RULES, 3461–3464,
 *               unconditional "New" tag per 3466) + "Pending & tracked"
 *               (3468–3477, incl. the inline "Effective now" markup row)
 *  - 3484–3497  osInforce — single in-force instruments table (8 rows,
 *               3485–3493)
 *  - Entity reconciliation: `&amp;`/`&ndash;` decoded at render, matching
 *               the base's srcRow()/srcItems() replace behavior (3243–3348
 *               data notes)
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideFeed } from '../../screens/OnSideFeed'
import { SRC_ITEMS } from '../../data/onside'
import { makeTopbarProps } from './helpers'

function renderFeed() {
  return render(<OnSideFeed topbar={makeTopbarProps()} onNavigate={() => {}} />)
}

/** Counts base tuples within a day window — the digestCard count rule
 * (base 3345–3387; all 15 sources, bindingOnly off). */
function itemsWithinDays(days: number): number {
  return Object.values(SRC_ITEMS).reduce(
    (sum, entry) => sum + entry.items.filter((item) => item[0] <= days).length,
    0,
  )
}

function getDigestFrequencyGroup() {
  return screen.getByRole('group', { name: 'Digest frequency' })
}

describe('OnSide feed · digest & alerts card (base 3345–3387)', () => {
  it('renders the five FREQ cadence chips with Daily preselected and its "Next send" line (base 3346 DIGEST.freq, 3348 FREQ)', () => {
    renderFeed()
    const group = getDigestFrequencyGroup()
    const chips = within(group).getAllByRole('button')
    expect(chips.map((chip) => chip.textContent)).toEqual([
      'Real-time',
      'Daily',
      'Weekly',
      'Monthly',
      'Quarterly',
    ])
    expect(within(group).getByRole('button', { name: 'Daily' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    for (const label of ['Real-time', 'Weekly', 'Monthly', 'Quarterly']) {
      expect(within(group).getByRole('button', { name: label })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    }
    expect(screen.getByText('Next send: every weekday, 7:00 AM ET')).toBeInTheDocument()
  })

  it('cadence chips are single-select and drive the digest window count (base 3345–3387)', async () => {
    const user = userEvent.setup()
    renderFeed()
    const group = getDigestFrequencyGroup()

    await user.click(within(group).getByRole('button', { name: 'Quarterly' }))
    expect(within(group).getByRole('button', { name: 'Quarterly' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(group).getByRole('button', { name: 'Daily' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(
      screen.getByText('Next send: first business day of the quarter'),
    ).toBeInTheDocument()

    const expected90 = itemsWithinDays(90)
    expect(
      screen.getByText(new RegExp(`items captured in the last 90 days`)),
    ).toBeInTheDocument()
    expect(screen.getByText(String(expected90))).toBeInTheDocument()
  })

  it('Real-time ports the base freqDays `||1` quirk verbatim: a 1-day window, not "everything since the sweep" (base 3349)', async () => {
    const user = userEvent.setup()
    renderFeed()
    const group = getDigestFrequencyGroup()

    await user.click(within(group).getByRole('button', { name: 'Real-time' }))
    const expected1Day = itemsWithinDays(1)
    // The base dataset has exactly one 1-day item (NCUA 26-CU-07).
    expect(expected1Day).toBe(1)
    expect(screen.getByText(/item captured in the last sweep/)).toBeInTheDocument()
    expect(screen.getByText('Next send: the moment a sweep finds a change')).toBeInTheDocument()
  })
})

describe('OnSide feed · three source layers (base 3389–3403 osSources, 3332–3336 SRC_LAYERS)', () => {
  it('renders the three layer tables with the base 6/5/4 source split of the 15 SRC_ROWS (base 3315–3331)', () => {
    renderFeed()
    const layerExpectations: Array<[string, number]> = [
      ['Financial · banking regulators sources', 6],
      ['Systemic · governing agencies sources', 5],
      ['Regional · national, state & local sources', 4],
    ]
    let total = 0
    for (const [caption, rowCount] of layerExpectations) {
      const table = screen.getByRole('table', { name: caption })
      expect(within(table).getAllByRole('row')).toHaveLength(rowCount + 1) // + header
      total += rowCount
    }
    expect(total).toBe(15)
  })

  it('decodes ported HTML entities in layer headings and source names (base srcRow reconciliation, 3243–3348 notes)', () => {
    renderFeed()
    // SRC_LAYERS Regional label is authored '&amp;' in the base (3335).
    expect(screen.getByText('Regional · national, state & local')).toBeInTheDocument()
    // SRC_ROWS 'SEC &amp; FINRA' (base 3323) renders reconciled.
    const systemicTable = screen.getByRole('table', {
      name: 'Systemic · governing agencies sources',
    })
    expect(within(systemicTable).getByText('SEC & FINRA')).toBeInTheDocument()
    expect(systemicTable.textContent).not.toContain('&amp;')
  })
})

describe('OnSide feed · rulemaking lifecycle (base 3450–3483 osLifecycle)', () => {
  it('renders the three NEW_RULES proposals, each with the unconditional "New" tag (base 3461–3464 data, 3466 render)', () => {
    renderFeed()
    const table = screen.getByRole('table', { name: 'Newly proposed rulemakings' })
    expect(within(table).getAllByRole('row')).toHaveLength(3 + 1)
    expect(within(table).getAllByText('New')).toHaveLength(3)
    expect(
      within(table).getByText(/NPRM · third-party due-diligence expectations for AI-assisted services/),
    ).toBeInTheDocument()
  })

  it('renders the eight pending & tracked rows with the inline "Effective now" status as text, entities decoded (base 3468–3477)', () => {
    renderFeed()
    const table = screen.getByRole('table', { name: 'Pending and tracked rulemakings' })
    expect(within(table).getAllByRole('row')).toHaveLength(8 + 1)
    // The CFPB/2026-C1 row's status is authored as raw inline span markup
    // in the base (3476) — it must surface as the text, never the markup.
    expect(within(table).getByText('Effective now')).toBeInTheDocument()
    expect(table.textContent).not.toContain('<span')
    // `&ndash;` in the NM HB 210 status (3474) decodes to an en dash.
    expect(within(table).getByText('Passed Senate 34–6 · awaiting House')).toBeInTheDocument()
  })
})

describe('OnSide feed · in-force instruments (base 3484–3497 osInforce)', () => {
  it('renders the eight INFORCE_RULES rows with decoded titles (base 3485–3493)', () => {
    renderFeed()
    const table = screen.getByRole('table', { name: 'Enacted and in-force instruments' })
    expect(within(table).getAllByRole('row')).toHaveLength(8 + 1)
    // 'CDD Rule &amp; Beneficial Ownership' (base 3488) decodes at render.
    expect(within(table).getByText('CDD Rule & Beneficial Ownership')).toBeInTheDocument()
    expect(
      within(table).getByText('Interagency Guidance 2026-13 · Model Risk Management'),
    ).toBeInTheDocument()
  })

  it('keeps the base section order below the signal feed: sources → lifecycle → in force (parity_ia_addendum.md Batch 2 order 1→2→3)', () => {
    renderFeed()
    const sectionHeadings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)
    expect(sectionHeadings).toEqual(['Sources & connectors', 'Rulemaking lifecycle', 'In force'])
  })
})
