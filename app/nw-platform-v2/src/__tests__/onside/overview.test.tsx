/**
 * OnSide · Overview — KPI strip, domain posture cards, and Cases
 * entry-point regression (D17: pins the PORTED V1 BASE BEHAVIOR).
 *
 * Base anchors (leapfi-platform.html @ 1c230fe, via survey_map.md and
 * parity_ia_addendum.md §Batch 1 "OnSide · Overview & Domains"):
 *  - 3055–3068  osKpis — the KPI figures, all-domains scope (OS_SCOPE
 *               'all' branch; the scoped variant is an open STOP-item)
 *  - 3069–3084  osOverview — per-domain posture grid + Cases entry row
 *  - 1819–1845  DOMAINS — the 8 governance domains and their appl/met/
 *               docs figures the KPIs aggregate (ported verbatim in
 *               data/onside.ts)
 *  - 1855       feedEventCount(days) — change-events KPI counts SRC_ITEMS
 *               tuples within the window
 *
 * KPI literals below are sums over the verbatim-ported base DOMAINS
 * values (docs: 517, appl: 488, met: 333) — deriving them any other way
 * would test the implementation against itself.
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideOverview } from '../../screens/OnSideOverview'
import { DOMAINS, SRC_ITEMS } from '../../data/onside'
import { makeTopbarProps } from './helpers'

function renderOverview(onNavigate: (id: string) => void = () => {}) {
  return render(<OnSideOverview topbar={makeTopbarProps()} onNavigate={onNavigate} />)
}

describe('OnSide overview · KPI strip (base 3055–3068 osKpis, 1819–1845 DOMAINS)', () => {
  it('renders the six all-domains KPI cards with figures aggregated from the base DOMAINS data', () => {
    renderOverview()

    // Sums of the verbatim base DOMAINS literals (1819–1845).
    const docsCard = screen.getByRole('group', { name: 'Documents monitored' })
    expect(within(docsCard).getByText('517')).toBeInTheDocument()

    const inScopeCard = screen.getByRole('group', { name: 'Obligations in scope' })
    expect(within(inScopeCard).getByText('488')).toBeInTheDocument()

    const metCard = screen.getByRole('group', { name: 'Obligations met' })
    expect(within(metCard).getByText('333')).toBeInTheDocument()

    // Present-with-correct-shape pins for the two derived KPIs whose
    // formulas live in the accordion helpers (statusOf/oblToClose —
    // asserting their outputs against themselves would be circular).
    expect(screen.getByRole('group', { name: 'Gaps to your targets' })).toBeInTheDocument()
    const atTargetCard = screen.getByRole('group', { name: 'Domains at / above target' })
    expect(atTargetCard.textContent).toMatch(/\/ 8/)

    // Change events · 14 days = base feedEventCount(14) over SRC_ITEMS
    // tuples (base 1855) — data-derived, not implementation-derived.
    const expectedEvents = Object.values(SRC_ITEMS).reduce(
      (sum, entry) => sum + entry.items.filter((item) => item[0] <= 14).length,
      0,
    )
    const eventsCard = screen.getByRole('group', { name: 'Change events · 14 days' })
    expect(within(eventsCard).getByText(String(expectedEvents))).toBeInTheDocument()
  })
})

describe('OnSide overview · domain posture grid (base 3069–3084 osOverview)', () => {
  it('renders one posture card per base domain — 8 cards, one per DOMAINS entry (base 1819–1845)', () => {
    const { container } = renderOverview()
    const cards = Array.from(
      container.querySelectorAll('[data-lf-composite="domain-posture-card"]'),
    )
    expect(DOMAINS).toHaveLength(8)
    expect(cards).toHaveLength(8)
    for (const domain of DOMAINS) {
      expect(
        cards.some((card) => card.textContent?.includes(domain.name)),
        `posture card for ${domain.name}`,
      ).toBe(true)
    }
  })
})

describe('OnSide overview · Cases entry point (base 3069–3084 osOverview; addendum §Batch 1 SetupCard row)', () => {
  it('the "Cases · approvals" SetupCard navigates to the cases screen on press', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderOverview(onNavigate)

    await user.click(screen.getByRole('button', { name: /Cases · approvals/ }))
    expect(onNavigate).toHaveBeenCalledWith('cases')
  })
})
