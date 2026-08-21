/**
 * OnSide · Overview — chat-drawer mutual exclusivity + focus integrity
 * (design_system_spec.md §2.9.1 item 2 / A16 exclusivity intent).
 *
 * Sweep finding (same concept class as H1/H2, this screen's own instances,
 * confirmed at f728aa7): this screen's 'domain'/'control'/'obligation'
 * deep-link consumer effects, its KPI click-through handler
 * (`scrollToDomains`), and its domain-posture-card press (`openDomain`) all
 * either move focus to a PAGE node (the Domains accordion row/section,
 * `DomainsAccordion.tsx`'s own `pendingScrollKey` effect) or open a SECOND,
 * competing Drawer content target (`openObligationTarget`) — none of them
 * cleared `chatOpen` first, unlike this screen's own `handleOpenObligation`/
 * `handleOpenChat`, which already do (`setChatOpen(false)` /
 * `setOpenObligationTarget(null)` respectively). Left unfixed: a
 * still-open chat Drawer either keeps masking the 'control'/'obligation'
 * deep link's obligation content (drawerTitle picks chatOpen first), or
 * (for 'domain'/the KPI cards/the posture card) stays open+aria-modal while
 * DomainsAccordion moves focus outside its subtree to a page row/section —
 * the same violation H1 (OnSideFeed) demonstrates.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideOverview } from '../../screens/OnSideOverview'
import type { DeepLinkTarget } from '../../App'

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

function renderOverview() {
  return render(<OnSideOverview onNavigate={() => {}} />)
}

async function openChat(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Ask OnSide' }))
  const heading = await screen.findByRole('heading', { name: 'OnSide chat' })
  await waitFor(() => expect(heading).toHaveFocus())
}

describe("'domain'-kind deep link closes the open chat before expanding/scrolling/focusing the accordion row", () => {
  it('never leaves the chat Drawer open+aria-modal with focus moved to the page', async () => {
    const user = userEvent.setup()
    const { rerender } = renderOverview()
    await openChat(user)

    const deepLink: DeepLinkTarget = { screen: 'onside.overview', kind: 'domain', id: 'mrm', nonce: 1 }
    rerender(<OnSideOverview onNavigate={() => {}} deepLink={deepLink} onDeepLinkConsumed={() => {}} />)

    await waitFor(() => {
      const row = document.querySelector('[data-lf-composite="domains-accordion-row"][data-state="open"]')
      expect(row).toHaveFocus()
    })
    expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument()
    await waitFor(() => expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0))
  })
})

describe("'control'-kind deep link closes the open chat first — the obligation drawer content-swaps in, never masked behind a still-open chat", () => {
  it('the obligation dialog replaces the chat, never left hidden behind it', async () => {
    const user = userEvent.setup()
    const { rerender } = renderOverview()
    await openChat(user)

    const deepLink: DeepLinkTarget = { screen: 'onside.overview', kind: 'control', id: 'MRM-09', nonce: 1 }
    rerender(<OnSideOverview onNavigate={() => {}} deepLink={deepLink} onDeepLinkConsumed={() => {}} />)

    await screen.findByRole('dialog', { name: 'MRM-09 · Obligation' })
    expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument()
  })
})

describe("'obligation'-kind deep link closes the open chat first — same content-swap guarantee", () => {
  it('the obligation dialog replaces the chat, never left hidden behind it', async () => {
    const user = userEvent.setup()
    const { rerender } = renderOverview()
    await openChat(user)

    const deepLink: DeepLinkTarget = { screen: 'onside.overview', kind: 'obligation', id: 'mrm:MRM-09', nonce: 1 }
    rerender(<OnSideOverview onNavigate={() => {}} deepLink={deepLink} onDeepLinkConsumed={() => {}} />)

    await screen.findByRole('dialog', { name: 'MRM-09 · Obligation' })
    expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument()
  })
})

describe('KPI click-through (B-dead-interactions-14) closes the open chat before scrolling/focusing the Domains section', () => {
  it('"Obligations in scope" closes the chat Drawer before scrollToDomains moves focus', async () => {
    const user = userEvent.setup()
    renderOverview()
    await openChat(user)

    const kpiButton = screen.getAllByRole('button').find((b) => b.textContent?.includes('Obligations in scope'))
    expect(kpiButton).toBeDefined()
    await user.click(kpiButton as HTMLElement)

    expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument()
    await waitFor(() => expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0))
  })
})

describe('Domain posture card press (ONSIDE-14) closes the open chat before expanding/scrolling/focusing the accordion row', () => {
  it('never leaves the chat Drawer open+aria-modal with focus moved to the page', async () => {
    const user = userEvent.setup()
    renderOverview()
    await openChat(user)

    const cards = Array.from(document.querySelectorAll('[data-lf-composite="domain-posture-card"]'))
    const mrmCard = cards.find((c) => c.textContent?.includes('Model Risk Management'))
    expect(mrmCard).toBeDefined()
    const openButton = within(mrmCard as HTMLElement).getByRole('button')
    await user.click(openButton)

    await waitFor(() => {
      const row = document.querySelector('[data-lf-composite="domains-accordion-row"][data-state="open"]')
      expect(row).toHaveFocus()
    })
    expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument()
    await waitFor(() => expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0))
  })
})
