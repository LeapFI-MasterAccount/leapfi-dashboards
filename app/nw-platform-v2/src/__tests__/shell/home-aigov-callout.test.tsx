/**
 * L10 AI governance flagship elevation (call-15; DECISIONS.md D3): "AI-gov
 * ... gets prominence elevation only (Home StatCard callout reusing C1/A8's
 * `qualifier`; `DOMAINS` reordering, data-only; demo-arc close-beat
 * placement, Marisol's lane) — no dedicated nav tile."
 *
 * USER RULING (binding, 2026-08-21 — HF1; supersedes L10's always-visible
 * reading of call-15 that an earlier revision of this header pinned): the
 * Home content area below the greeting must contain NOTHING that is not
 * configured by the user via Customize. The callout is therefore no longer
 * rendered unconditionally by `Home.tsx`; it is now the sixth
 * Customize-gated panel key, `'aigov'` ("AI Governance"), rendered by
 * `HomePanels.tsx` (`AigovFlagshipPanel`) and toggled/ordered by
 * `HomeCustomizeBar` exactly like the existing five — SHOWN by default at
 * position 1 for any role with no stored layout, hideable like any other
 * panel, and counted by the derived "Customize (N of 6 shown)" trigger.
 *
 * Still pinned from D3's original "Home StatCard callout reusing C1/A8's
 * `qualifier`" half: a single interactive StatCard (C1) reusing amendment
 * A8's `qualifier` caption prop. Every literal below
 * (label/value/qualifier) is sourced straight from `data/onside.ts`
 * DOMAINS['aigov'] — never a fabricated figure — and the qualifier caption
 * reuses that same domain row's own `inst` field substring ("flagship
 * framework"), not new copy invented for this callout.
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
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Home } from '../../screens/Home'
import { DOMAINS } from '../../data/onside'
import { HOME_ORDER } from '../../data/misc'

const AIGOV = DOMAINS.find((d) => d.key === 'aigov')
if (!AIGOV) throw new Error("fixture assumption broken: data/onside.ts DOMAINS no longer has an 'aigov' entry")

beforeEach(() => {
  // The gating test below commits a customization (HOME_ORDER + the D13
  // localStorage layer) for the default role — clear both between tests so
  // one test's toggle never leaks into a sibling's default-render
  // assertions (same isolation precedent home.test.tsx establishes).
  for (const key of Object.keys(HOME_ORDER)) delete HOME_ORDER[key]
  window.localStorage.clear()
})

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

  it('renders INSIDE the Customize-gated aigov panel section — no longer an ungated Home.tsx render (user ruling 2026-08-21)', () => {
    render(<Home onNavigate={() => {}} />)

    const section = document.querySelector('section[data-lf-home-panel="aigov"]')
    expect(section, 'no section[data-lf-home-panel="aigov"] rendered — the callout is not panel-gated').not.toBeNull()
    const cards = Array.from((section as HTMLElement).querySelectorAll('[data-lf-composite="stat-card"]'))
    const aigovCard = cards.find((el) => el.textContent?.includes(AIGOV.name))
    expect(aigovCard, 'the aigov StatCard is not inside the aigov panel section').toBeDefined()
    // The stable demo-arc selector (D3) moved with the card.
    expect((section as HTMLElement).querySelector('[data-lf-view="aigov-flagship-callout"]')).not.toBeNull()
  })

  it('is the FIRST panel section on a default (never-customized) render — default-shown at position 1', () => {
    const { container } = render(<Home onNavigate={() => {}} />)

    const sections = Array.from(container.querySelectorAll('[data-lf-home-panel]')).map(
      (el) => el.getAttribute('data-lf-home-panel'),
    )
    expect(sections[0]).toBe('aigov')
  })

  it('toggling the "AI Governance" chip off in Customize removes the card from the DOM and the trigger reads "Customize (5 of 6 shown)" — a user-configurable panel, not a standing fixture', async () => {
    const user = userEvent.setup()
    render(<Home onNavigate={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Customize (6 of 6 shown)' }))
    const bar = screen.getByRole('group', { name: 'Customize your home' })
    // Shown at position 1 by default, so the chip carries its position prefix.
    await user.click(within(bar).getByRole('button', { name: '1. AI Governance' }))

    expect(document.querySelector('section[data-lf-home-panel="aigov"]')).toBeNull()
    const cards = Array.from(document.querySelectorAll('[data-lf-composite="stat-card"]'))
    expect(cards.find((el) => el.textContent?.includes(AIGOV.name))).toBeUndefined()
    expect(screen.getByRole('button', { name: 'Customize (5 of 6 shown)' })).toBeInTheDocument()
  })
})
