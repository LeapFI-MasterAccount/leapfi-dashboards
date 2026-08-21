/**
 * OnSide · Regulatory feed — chat-drawer mutual exclusivity + focus
 * integrity (design_system_spec.md §2.9.1 item 2 / A16 exclusivity intent).
 *
 * H1 (Sprint hostile-review finding, confirmed at f728aa7): the 'section'-
 * kind deep-link consumer (id 'lifecycle') fires `handleOpenLifecycle`,
 * which does `lifecycleSectionRef.current?.focus()` on a PAGE node — a
 * scroll/focus target that is NOT a Drawer content swap (unlike the
 * 'signal'/'feed-source' deep-link effects, which correctly overwrite the
 * shared Drawer's discriminated `selection` union and so inherit RPT-05's
 * focus handoff for free). When the chat Drawer is open and `aria-modal`,
 * this used to move focus outside the trap while the dialog stayed open —
 * the dialog remained on screen over the scrim with focus behind it.
 *
 * Fix: this screen's own documented pattern (`handleDrawerClose(); then
 * scroll/focus;` — already used at the "Open in Sources & connectors →"
 * drawer action) is now owned by `handleOpenSources`/`handleOpenLifecycle`
 * themselves, so EVERY caller (the 'section' deep-link effect, and
 * `RegulatoryFeedLifecycle`'s own "View source" row action) closes any
 * open Drawer content (chat included) before moving focus to a page node.
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideFeed } from '../../screens/OnSideFeed'
import type { DeepLinkTarget } from '../../App'

beforeAll(() => {
  // jsdom has no scrollIntoView — see feed-source-drawer.test.tsx's
  // identical stub for the same reason.
  Element.prototype.scrollIntoView = vi.fn()
})

beforeEach(() => {
  vi.mocked(Element.prototype.scrollIntoView).mockClear()
})

async function openChat(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Ask OnSide' }))
  const heading = await screen.findByRole('heading', { name: 'OnSide chat' })
  await waitFor(() => expect(heading).toHaveFocus())
}

describe("H1 — 'section'-kind deep link ('lifecycle') never leaves an open aria-modal chat Drawer with focus escaped to the page", () => {
  it('closes the open chat Drawer before scrolling/focusing the Rulemaking lifecycle section', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<OnSideFeed />)
    await openChat(user)

    const deepLink: DeepLinkTarget = { screen: 'onside.feed', kind: 'section', id: 'lifecycle', nonce: 1 }
    rerender(<OnSideFeed deepLink={deepLink} onDeepLinkConsumed={() => {}} />)

    await waitFor(() => {
      const section = document.querySelector('[data-lf-section="lifecycle"]')
      expect(section).toHaveFocus()
    })

    // The chat Drawer must be gone — never left open+aria-modal with focus
    // now outside its own subtree. (Drawer.tsx's own 200ms close transition
    // means this is not instantaneous — wait for it, same as every other
    // close-transition assertion in this codebase's test suite.)
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument())
    await waitFor(() => expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0))
  })
})

describe('Sweep (same concept, second call site in this file) — RegulatoryFeedLifecycle\'s "View source" row action also moves focus to a page node (Sources & connectors), and must close the open chat Drawer first too', () => {
  it('closes the open chat Drawer before scrolling/focusing Sources & connectors', async () => {
    const user = userEvent.setup()
    render(<OnSideFeed />)
    await openChat(user)

    const table = screen.getByRole('table', { name: 'Newly proposed rulemakings' })
    const viewSourceButtons = within(table).getAllByRole('button', { name: 'View source' })
    await user.click(viewSourceButtons[0]!)

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument())
    await waitFor(() => expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0))
  })
})
