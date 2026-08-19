/**
 * Shell regression — Topbar (C4): back-target chip, breadcrumb, date,
 * default persona.
 *
 * D17: base anchors (leapfi-platform.html @1c230fe via survey_map.md):
 *  - L823–854  topbar: back-chip, crumb, live pill, bell, profile w/ user
 *              switcher; default user Rachel Fischer CRO; date
 *              "Friday, August 15, 2026".
 *  - survey_map.md §(b) Nav model: "Deliberate ONE-LEVEL back chip (not
 *    browser history)" — base NAVBACK, source 1688–1741.
 *
 * D18: no test here touches Home's "Start the demo" affordance.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'

async function navigateToOnSideChild(user: ReturnType<typeof userEvent.setup>, childLabel: string): Promise<void> {
  const nav = screen.getByRole('navigation', { name: 'Primary' })
  const onSide = within(nav).getByRole('button', { name: 'OnSide' })
  if (onSide.getAttribute('aria-expanded') === 'false') {
    await user.click(onSide)
  }
  await user.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('button', { name: childLabel }))
}

describe('topbar chrome at boot (base L823–854)', () => {
  it('shows breadcrumb Home, the Live pill, the fixed demo date, and the default Rachel Fischer persona; no back chip at root (base L823–854)', () => {
    render(<App />)
    const banner = screen.getByRole('banner')

    expect(within(banner).getByText('Home')).toBeInTheDocument()
    expect(within(banner).getByText('Live')).toBeInTheDocument()
    // Base date display, verbatim (L823–854: date "Friday, August 15, 2026").
    expect(within(banner).getByText('Friday, August 15, 2026')).toBeInTheDocument()
    // Base default user Rachel Fischer CRO (L823–854; USERS[0], source 1159–68).
    expect(within(banner).getByRole('button', { name: 'Rachel Fischer' })).toBeInTheDocument()
    // At-root: no back target exists, chip absent (base one-level NAVBACK, 1688–1741).
    expect(within(banner).queryByRole('button', { name: /^Back to / })).not.toBeInTheDocument()
  })
})

describe('one-level back chip (base NAVBACK 1688–1741; §(b) "Deliberate ONE-LEVEL back chip")', () => {
  it('leaving Home shows "Back to Home"; pressing it returns to Home and clears the chip (root has no back target)', async () => {
    const user = userEvent.setup()
    render(<App />)

    await navigateToOnSideChild(user, 'Regulatory feed')
    const chip = within(screen.getByRole('banner')).getByRole('button', { name: 'Back to Home' })
    expect(chip).toBeInTheDocument()

    await user.click(chip)
    const banner = screen.getByRole('banner')
    expect(within(banner).getByText('Home')).toBeInTheDocument()
    expect(within(banner).queryByRole('button', { name: /^Back to / })).not.toBeInTheDocument()
  })

  it('keeps exactly ONE hop of history, never a stack (base one-level NAVBACK, 1688–1741)', async () => {
    const user = userEvent.setup()
    render(<App />)

    await navigateToOnSideChild(user, 'Regulatory feed')
    await navigateToOnSideChild(user, 'Documents')
    // After home → feed → documents, the chip points at feed (the single
    // retained hop), not at Home.
    expect(within(screen.getByRole('banner')).getByRole('button', { name: 'Back to OnSide · Regulatory feed' })).toBeInTheDocument()

    await navigateToOnSideChild(user, 'Ownership')
    // The one retained hop is replaced, never accumulated.
    const banner = screen.getByRole('banner')
    expect(within(banner).getByRole('button', { name: 'Back to OnSide · Documents' })).toBeInTheDocument()
    expect(within(banner).queryByRole('button', { name: 'Back to OnSide · Regulatory feed' })).not.toBeInTheDocument()
    expect(within(banner).queryByRole('button', { name: 'Back to Home' })).not.toBeInTheDocument()
  })

  it('"Open board deck" navigates to the deck with a back target to the screen just left (base boardDeck() 2393–2448; topbar L823–854)', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Open board deck' }))

    const banner = screen.getByRole('banner')
    expect(within(banner).getByText('Board deck')).toBeInTheDocument()
    expect(within(banner).getByRole('button', { name: 'Back to Home' })).toBeInTheDocument()
  })
})

describe('ProfileMenu disclosure (C4 a11y baseline, design_system_spec.md §2.2; SH-7)', () => {
  it('trigger carries aria-haspopup="menu" and live aria-expanded reflecting open state', async () => {
    const user = userEvent.setup()
    render(<App />)
    const trigger = within(screen.getByRole('banner')).getByRole('button', { name: 'Rachel Fischer' })

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu', { name: 'Rachel Fischer account menu' })).toBeInTheDocument()
  })

  it('opening focuses the first menuitem; ArrowDown/ArrowUp move through items with wrap; Home/End jump to first/last', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Rachel Fischer' }))

    const menu = screen.getByRole('menu', { name: 'Rachel Fischer account menu' })
    const items = within(menu).getAllByRole('menuitem')
    expect(items.length).toBeGreaterThan(2)
    expect(items[0]).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(items[1]).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(items[0]).toHaveFocus()
    // Wrap: ArrowUp from the first item lands on the last.
    await user.keyboard('{ArrowUp}')
    expect(items[items.length - 1]).toHaveFocus()
    // Wrap: ArrowDown from the last item lands back on the first.
    await user.keyboard('{ArrowDown}')
    expect(items[0]).toHaveFocus()

    await user.keyboard('{End}')
    expect(items[items.length - 1]).toHaveFocus()
    await user.keyboard('{Home}')
    expect(items[0]).toHaveFocus()
  })

  it('Tab out closes the menu instead of leaving a stale-open popover (WAI-ARIA menu pattern)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const trigger = within(screen.getByRole('banner')).getByRole('button', { name: 'Rachel Fischer' })
    await user.click(trigger)
    expect(screen.getByRole('menu', { name: 'Rachel Fischer account menu' })).toBeInTheDocument()

    await user.tab()

    expect(screen.queryByRole('menu', { name: 'Rachel Fischer account menu' })).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('Escape closes the menu and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<App />)
    const trigger = within(screen.getByRole('banner')).getByRole('button', { name: 'Rachel Fischer' })
    await user.click(trigger)
    expect(screen.getByRole('menu', { name: 'Rachel Fischer account menu' })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu', { name: 'Rachel Fischer account menu' })).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })
})
