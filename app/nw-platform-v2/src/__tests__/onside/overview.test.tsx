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
 *
 * B3 dispatch: added direct-prop coverage of the screen's migrated
 * 'domain'-kind `deepLink`/`onDeepLinkConsumed` consumption (see
 * `OnSideOverview.tsx`'s own header "DEEP-LINK CONTRACT MIGRATION"). The
 * end-to-end App.tsx path (bell→deepLink→this screen, through the real
 * shell) stays pinned separately in `src/__tests__/shell/deep-link.test.tsx`.
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideOverview } from '../../screens/OnSideOverview'
import type { DeepLinkTarget } from '../../App'
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

describe("OnSide overview · 'domain' deep-link consumption (B3 dispatch — migrated off the legacy deepLinkDomainKey prop onto App.tsx's deepLink/onDeepLinkConsumed contract)", () => {
  it('a domain deep link force-expands and focuses the matching accordion row, and consumes its nonce (base onsideShow domKey branch, source 3021–3054)', async () => {
    const onDeepLinkConsumed = vi.fn()
    const deepLink: DeepLinkTarget = { screen: 'onside.overview', kind: 'domain', id: 'mrm', nonce: 1 }
    render(<OnSideOverview topbar={makeTopbarProps()} onNavigate={() => {}} deepLink={deepLink} onDeepLinkConsumed={onDeepLinkConsumed} />)

    const rowButton = screen.getByRole('button', { name: /Model Risk Management/, expanded: true })
    expect(rowButton).toHaveAttribute('aria-expanded', 'true')
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(1)

    // The 80ms scroll+focus handoff (base setTimeout(...,80), source 3052).
    await waitFor(() => {
      const row = document.querySelector('[data-lf-composite="domains-accordion-row"][data-state="open"]')
      expect(row).toHaveFocus()
    })
  })

  it('a deepLink of a different kind is ignored — never mistaken for a domain press', () => {
    const onDeepLinkConsumed = vi.fn()
    const deepLink: DeepLinkTarget = { screen: 'onside.overview', kind: 'obligation', id: 'mrm:MRM-08', nonce: 1 }
    render(<OnSideOverview topbar={makeTopbarProps()} onNavigate={() => {}} deepLink={deepLink} onDeepLinkConsumed={onDeepLinkConsumed} />)

    expect(screen.queryByRole('button', { name: /Model Risk Management/, expanded: true })).not.toBeInTheDocument()
    expect(onDeepLinkConsumed).not.toHaveBeenCalled()
  })

  it('the legacy deepLinkDomainKey prop alone no longer drives any behavior (accepted only for App.tsx compile compatibility — see file header)', () => {
    render(<OnSideOverview topbar={makeTopbarProps()} onNavigate={() => {}} deepLinkDomainKey="mrm" />)
    expect(screen.queryByRole('button', { name: /Model Risk Management/, expanded: true })).not.toBeInTheDocument()
  })
})

describe("PI2-D5 — 'control'-kind deep link (App.tsx KIND VOCABULARY: bare control id, e.g. 'MRM-09', no domKey prefix — the r16 QuickFind 'type MRM-09 anywhere' shape; resolved via data/onside.ts OBL)", () => {
  it('resolves the owning domain from the bare control id, force-expands that domain row, and opens the obligation drawer for that exact control', async () => {
    const onDeepLinkConsumed = vi.fn()
    const deepLink: DeepLinkTarget = { screen: 'onside.overview', kind: 'control', id: 'MRM-09', nonce: 1 }
    render(<OnSideOverview topbar={makeTopbarProps()} onNavigate={() => {}} deepLink={deepLink} onDeepLinkConsumed={onDeepLinkConsumed} />)

    const rowButton = screen.getByRole('button', { name: /Model Risk Management/, expanded: true })
    expect(rowButton).toHaveAttribute('aria-expanded', 'true')
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(1)

    const dialog = await screen.findByRole('dialog', { name: 'MRM-09 · Obligation' })
    const fieldValues = within(dialog)
      .getAllByRole('definition')
      .map((dd) => dd.textContent)
    expect(fieldValues).toEqual([
      'Model Risk Management',
      'Gate model changes through a formal approval workflow before deployment.',
      '2026-13 §V.B',
      'Required: a formal approval gate before model changes deploy. Current: changes deploy on developer sign-off alone.',
      'Adopt the Model Change Approval Workflow (draft 0.8, in the HITL queue).',
      'Model Change Approval Workflow',
    ])
  })

  it('an unresolvable bare control id still consumes the nonce and opens nothing (never a fabricated domain guess)', () => {
    const onDeepLinkConsumed = vi.fn()
    const deepLink: DeepLinkTarget = { screen: 'onside.overview', kind: 'control', id: 'NO-SUCH-CONTROL', nonce: 2 }
    render(<OnSideOverview topbar={makeTopbarProps()} onNavigate={() => {}} deepLink={deepLink} onDeepLinkConsumed={onDeepLinkConsumed} />)

    expect(onDeepLinkConsumed).toHaveBeenCalledWith(2)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
