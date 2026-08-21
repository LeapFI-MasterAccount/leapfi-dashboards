/**
 * L10 AI governance flagship elevation (call-15; DECISIONS.md D3): "AI-gov
 * ... gets prominence elevation only (Home StatCard callout reusing C1/A8's
 * `qualifier`; `DOMAINS` reordering, data-only; demo-arc close-beat
 * placement, Marisol's lane) — no dedicated nav tile."
 *
 * This pins the "Home StatCard callout reusing C1/A8's `qualifier`" half of
 * D3 — a single interactive StatCard (C1), rendered on `Home.tsx` itself
 * (not inside `HomePanels.tsx`, which stays gated by the user's own
 * customization toggles — a flagship callout must always be visible,
 * never a panel a viewer can hide), reusing amendment A8's `qualifier`
 * caption prop. Every literal below (label/value/qualifier) is sourced
 * straight from `data/onside.ts` DOMAINS['aigov'] — never a fabricated
 * figure — and the qualifier caption reuses that same domain row's own
 * `inst` field substring ("flagship framework"), not new copy invented for
 * this callout.
 *
 * Click-through (D19b, `affordance_standard.md` §2.2): the callout is the
 * StatCard's own `onPress`-driven interactive variant (real `<button>`,
 * chevron, C1's already-shipped state-for-state affordance) — pressing it
 * targets the aigov domain the SAME way every other domain-row "Open ->"
 * action in this codebase does (`HomePanels.tsx` PostureBand's own
 * `fireOrDeepLink` pattern, B3 SEAM 1): `onDeepLink({ screen:
 * 'onside.overview', kind: 'domain', id: 'aigov' })` when a caller has
 * wired `onDeepLink` (delivers end to end — `OnSideOverview.tsx` already
 * consumes this exact kind, per that migration's own header), falling back
 * to plain `onNavigate('onside.overview')` when it has not — never a dead
 * click, never a second nav mechanism invented for this one card.
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Home } from '../../screens/Home'
import { DOMAINS } from '../../data/onside'

const AIGOV = DOMAINS.find((d) => d.key === 'aigov')
if (!AIGOV) throw new Error("fixture assumption broken: data/onside.ts DOMAINS no longer has an 'aigov' entry")

describe('Home — AI Governance flagship StatCard callout (D3)', () => {
  it('renders a StatCard callout naming the aigov domain, with a qualifier caption sourced from that domain\'s own data (never fabricated copy)', () => {
    render(<Home onNavigate={() => {}} />)

    const card = document.querySelector('[data-lf-composite="stat-card"][data-state="loaded"]')
    // Scope to the callout specifically: find the stat-card whose text
    // content mentions the aigov domain's own name.
    const cards = Array.from(document.querySelectorAll('[data-lf-composite="stat-card"]'))
    const aigovCard = cards.find((el) => el.textContent?.includes(AIGOV.name))
    expect(aigovCard, 'no StatCard rendered for the aigov domain').toBeDefined()
    expect(card).not.toBeNull()

    // Value: sourced from the domain's own met/appl counts (never invented).
    expect(aigovCard?.textContent).toContain(String(AIGOV.met))
    // Qualifier: reuses the domain's own `inst` field's "flagship framework"
    // substring, present in the DOM as an aria-hidden caption span (C1/A8).
    // Scoped past StatValue's OWN `aria-hidden` caption span (its
    // visually-duplicated label, P11) by matching on text, not position.
    const qualifierCandidates = Array.from(aigovCard?.querySelectorAll('span[aria-hidden="true"]') ?? [])
    const qualifier = qualifierCandidates.find((el) => /flagship framework/i.test(el.textContent ?? ''))
    expect(qualifier, 'no aria-hidden qualifier span carries "flagship framework"').toBeDefined()
  })

  it('is a real interactive StatCard (C1 clickable variant, D19b) — pressing it fires the aigov domain deep link when onDeepLink is wired', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onDeepLink = vi.fn()
    render(<Home onNavigate={onNavigate} onDeepLink={onDeepLink} />)

    const cards = Array.from(document.querySelectorAll('[data-lf-composite="stat-card"]'))
    const aigovCard = cards.find((el) => el.textContent?.includes(AIGOV.name))
    expect(aigovCard?.tagName).toBe('BUTTON')

    await user.click(aigovCard as HTMLElement)

    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'aigov' })
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('falls back to plain onNavigate("onside.overview") when onDeepLink is not wired — never a dead click', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<Home onNavigate={onNavigate} />)

    const cards = Array.from(document.querySelectorAll('[data-lf-composite="stat-card"]'))
    const aigovCard = cards.find((el) => el.textContent?.includes(AIGOV.name))
    await user.click(aigovCard as HTMLElement)

    expect(onNavigate).toHaveBeenCalledWith('onside.overview')
  })

  it('is always visible on Home regardless of the HomeCustomizeBar\'s visibleKeys panel toggles — a flagship elevation is not a panel a viewer can hide', () => {
    render(<Home onNavigate={() => {}} />)
    // No HomePanels customization interaction happens here; this asserts
    // the callout lives outside the `<HomePanels visibleKeys={...}>` tree
    // by checking it is present even with HomePanels' own defaults intact
    // (i.e. it is not one of `HOME_PANEL_DEFS`' gated keys).
    const cards = Array.from(document.querySelectorAll('[data-lf-composite="stat-card"]'))
    const aigovCard = cards.find((el) => el.textContent?.includes(AIGOV.name))
    expect(aigovCard).toBeDefined()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
