/**
 * OnSide · Documents — chat-drawer mutual exclusivity (design_system_spec.md
 * §2.9.1 item 2 / A16 exclusivity intent).
 *
 * H2 (Sprint hostile-review finding, confirmed at f728aa7): the S1.1-01 gap
 * "Open document" link (`gapColumns`'s action cell,
 * `gap-queue-affordances.test.tsx`'s own AC-S1.1-01-*) omitted
 * `setChatOpen(false)`, unlike every other content-opener in this file
 * (row-open, gapRowAction's doc branch, openObligationDrawer, the
 * 'document' deep-link effect). `chatOpen` leaked `true`; after Adopt/
 * Reject clear only `openDocId`/`openObligation`, the still-`chatOpen`
 * Drawer silently swapped to a fresh chat instead of closing.
 *
 * Sweep addition (same concept, this file's Toast link): `handleViewImpact`
 * (the post-adopt "View impact →" Toast link) scrolls/focuses a domain
 * section on the PAGE without checking/closing the Drawer first — the same
 * "never move focus outside an open modal Drawer" violation H1 (OnSideFeed)
 * demonstrates, reachable here because Toast (`z-index: 120`) renders above
 * the Drawer/scrim (`z-index: 50`/`40`) — a real, not merely jsdom-only,
 * reachability path.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnSideDocuments } from '../../screens/OnSideDocuments'
import { resetDemo } from '../../state/demoStore'

beforeAll(() => {
  // jsdom has no scrollIntoView; the domain-impact "View impact" handoff
  // calls it (see gap-queue-affordances.test.tsx's identical stub).
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  resetDemo()
})

function renderDocuments() {
  return render(<OnSideDocuments />)
}

function gapRow(tableName: string, textFragment: string) {
  const table = screen.getByRole('table', { name: tableName })
  const row = within(table)
    .getAllByRole('row')
    .find((r) => r.textContent?.includes(textFragment))
  expect(row).toBeDefined()
  return row as HTMLElement
}

async function openChat(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Ask OnSide' }))
  const heading = await screen.findByRole('heading', { name: 'OnSide chat' })
  await waitFor(() => expect(heading).toHaveFocus())
}

/** Adopts a redlined doc through the real UI (row → Review → Adopt → toast). */
async function adoptDocByRow(user: ReturnType<typeof userEvent.setup>, title: string) {
  const table = screen.getByRole('table', { name: 'Document library' })
  const row = within(table)
    .getAllByRole('row')
    .find((r) => r.textContent?.includes(title))
  expect(row).toBeDefined()
  await user.click(within(row as HTMLElement).getByRole('button', { name: 'Review' }))
  const dialog = await screen.findByRole('dialog', { name: title })
  await user.click(within(dialog).getByRole('button', { name: 'Adopt' }))
  await waitFor(() => expect(screen.getByText(`${title} adopted.`)).toBeInTheDocument(), { timeout: 3000 })
}

describe('H2 — S1.1-01 gap "Open document" link leaking chatOpen', () => {
  it('after opening a gap\'s doc via "Open document" while chat is open, then Adopt commits, the Drawer closes — it never silently swaps back to a fresh chat greeting', async () => {
    const user = userEvent.setup()
    renderDocuments()
    await openChat(user)

    // Incident Response Plan ('irp') — a gap whose `doc` carries a real
    // redline draft, so its drawer actually offers "Adopt" (TPRM-08's own
    // doc, used by gap-queue-affordances.test.tsx's own AC-S1.1-01-*
    // tests, carries no redline and offers no Adopt button).
    const row = gapRow('Open governance gaps board', 'Incident Response Plan')
    await user.click(within(row).getByRole('button', { name: 'Open document' }))

    const dialog = await screen.findByRole('dialog', { name: 'Incident Response Plan' })
    await user.click(within(dialog).getByRole('button', { name: 'Adopt' }))
    await waitFor(() => expect(screen.getByText(/adopted\./)).toBeInTheDocument(), { timeout: 3000 })

    // The Drawer must be closed — never a fresh "OnSide chat" greeting.
    expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument()
    await waitFor(() => expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0))
  })
})

describe('Sweep (same concept) — the post-adopt "View impact →" Toast link', () => {
  it('closes the open chat Drawer before scrolling/focusing the impacted domain section', async () => {
    const user = userEvent.setup()
    renderDocuments()
    await adoptDocByRow(user, 'Model Change Approval Workflow')

    await openChat(user)

    await user.click(screen.getByRole('button', { name: 'View impact →' }))

    // Drawer.tsx's own 200ms close transition means this is not
    // instantaneous.
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'OnSide chat' })).not.toBeInTheDocument())
    await waitFor(() => expect(document.querySelectorAll('[data-lf-composite="drawer"]')).toHaveLength(0))
  })
})
