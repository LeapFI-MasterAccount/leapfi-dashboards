/**
 * OnSide · Regulatory feed — lifecycle / in-force sections regression
 * (D17: pins the PORTED V1 BASE BEHAVIOR, anchors 3450–3497).
 *
 * L3 UPDATE (PI-3, D6/call-07) — the digest & alerts card and the three
 * source-layer tables (base 3345–3403) relocated to `SettingsToggles.tsx`
 * along with `RegulatoryFeedSources`; their regression coverage moved to
 * `src/__tests__/shell/settings-sources.test.tsx`. This file keeps only
 * what still renders on `OnSideFeed.tsx`.
 *
 * Base anchors (leapfi-platform.html @ 1c230fe, via survey_map.md):
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
import { OnSideFeed } from '../../screens/OnSideFeed'

function renderFeed() {
  return render(<OnSideFeed />)
}

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

  it('keeps the base section order below the signal feed: lifecycle → in force (L3 UPDATE: sources relocated to Settings, no longer the "1" slot here)', () => {
    renderFeed()
    const sectionHeadings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)
    expect(sectionHeadings).toEqual(['Rulemaking lifecycle', 'In force'])
  })
})
