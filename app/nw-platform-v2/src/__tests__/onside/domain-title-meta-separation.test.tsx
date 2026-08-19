/**
 * rev-68 DEFECT 2 regression — accordion/posture-card header text jam
 * ("Fair Lending · ECOA / Reg BCFPB", "AI GovernanceNCUA").
 *
 * ROOT CAUSE (verified in source): in both `views/DomainsAccordion.tsx`
 * (the header row's title `<span>` + meta `<span>`) and
 * `screens/OnSideOverview.tsx`'s `DomainPostureCard` (the title `<button>`
 * + meta `<Label>`), the title element and the meta line ("bodies · N
 * obligations in scope") were rendered as SIBLING inline-level elements
 * with no `display: block`/flex stacking between them and no gap. Two
 * adjacent inline-level boxes with nothing forcing a line break render on
 * the SAME line, back-to-back with zero separating whitespace — the exact
 * concatenation the D26 copy-cut bug report describes.
 *
 * FIX: both sites now wrap the title + meta pair in a flex-column
 * container with a gap (matching the sibling composite convention already
 * established by `SetupCard.tsx`'s `BODY_STYLE`), so the two always
 * render on distinct lines regardless of either child's own `display`.
 *
 * These are style-contract pins (computed `display`/`flexDirection`/`gap`
 * on the wrapping element), not layout assertions — jsdom has no layout
 * engine, so there is no way to assert the two text runs are visually on
 * different lines; asserting the CSS mechanism that produces that
 * separation is the honest thing to pin.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { DomainsAccordion } from '../../views/DomainsAccordion'
import { OnSideOverview } from '../../screens/OnSideOverview'
import { DOMAINS } from '../../data/onside'
import { makeTopbarProps } from './helpers'

// Real seed data — 'consumer' domain has bodies 'CFPB · NCUA', matching
// the bug report's "...NCUA" concatenation shape exactly.
const CONSUMER_DOMAIN = DOMAINS.find((d) => d.key === 'consumer')
if (!CONSUMER_DOMAIN) throw new Error("fixture assumption broken: data/onside.ts DOMAINS no longer has a 'consumer' entry")

describe('DomainsAccordion — header title vs. meta line separation', () => {
  it('renders the domain name and its "bodies · N obligations in scope" meta as stacked, gapped elements — never concatenated', () => {
    render(
      <DomainsAccordion
        domains={[CONSUMER_DOMAIN]}
        expandedKeys={new Set()}
        onToggle={() => {}}
        pendingScrollKey={null}
        onScrollHandled={() => {}}
      />,
    )

    const heading = screen.getByText(CONSUMER_DOMAIN.name)
    const meta = screen.getByText(new RegExp(`${CONSUMER_DOMAIN.bodies.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} ·`))

    // Both text runs exist as their OWN elements (not merged into one text
    // node) — the concatenation bug would still pass this much; the real
    // pin is the wrapping element's layout mechanism below.
    expect(heading).not.toBe(meta)

    // Both are children of the same wrapper, and that wrapper is a flex
    // column with a real gap — the mechanism that keeps them apart
    // regardless of either child's own (inline) display value.
    const wrapper = heading.parentElement
    expect(wrapper).not.toBeNull()
    expect(within(wrapper as HTMLElement).getByText(CONSUMER_DOMAIN.name)).toBe(heading)
    expect(within(wrapper as HTMLElement).getByText(meta.textContent ?? '')).toBe(meta)
    expect((wrapper as HTMLElement).style.display).toBe('flex')
    expect((wrapper as HTMLElement).style.flexDirection).toBe('column')
    expect((wrapper as HTMLElement).style.gap).not.toBe('')
    expect((wrapper as HTMLElement).style.gap).not.toBe('0')
    expect((wrapper as HTMLElement).style.gap).not.toBe('0px')
  })
})

describe("OnSideOverview's domain-posture-card — title button vs. meta Label separation", () => {
  it('renders each domain-posture card\'s name button and its "bodies · N obligations in scope" Label as stacked, gapped elements — never concatenated', () => {
    render(<OnSideOverview topbar={makeTopbarProps()} onNavigate={() => {}} />)

    const cards = document.querySelectorAll('[data-lf-composite="domain-posture-card"]')
    expect(cards.length).toBe(DOMAINS.length)

    const consumerCard = Array.from(cards).find((card) => card.textContent?.includes(CONSUMER_DOMAIN.name))
    expect(consumerCard, 'no posture card found for the consumer domain').toBeDefined()

    const titleButton = within(consumerCard as HTMLElement).getByRole('button', { name: CONSUMER_DOMAIN.name })
    const metaText = within(consumerCard as HTMLElement).getByText(
      new RegExp(`${CONSUMER_DOMAIN.bodies.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} ·`),
    )

    const wrapper = titleButton.parentElement
    expect(wrapper).not.toBeNull()
    expect(wrapper?.contains(metaText)).toBe(true)
    expect((wrapper as HTMLElement).style.display).toBe('flex')
    expect((wrapper as HTMLElement).style.flexDirection).toBe('column')
    expect((wrapper as HTMLElement).style.gap).not.toBe('')
    expect((wrapper as HTMLElement).style.gap).not.toBe('0')
    expect((wrapper as HTMLElement).style.gap).not.toBe('0px')
  })
})
