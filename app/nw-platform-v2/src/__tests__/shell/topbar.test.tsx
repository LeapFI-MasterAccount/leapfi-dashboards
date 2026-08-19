/**
 * Shell regression — Topbar (C4): Home logo nav control, breadcrumb, date,
 * default persona.
 *
 * D17: base anchors (leapfi-platform.html @1c230fe via survey_map.md):
 *  - L823–854  topbar: crumb, live pill, bell, profile w/ user switcher;
 *              default user Rachel Fischer CRO; date
 *              "Friday, August 15, 2026".
 *
 * D20 (decisions.md; task B1): the base's back-chip / one-level NAVBACK
 * affordance (base source 1688–1741, formerly pinned by this file as
 * "one-level back chip") is STRUCK — the twin never carried v1's browser-
 * history-free back nav past this component, and D20 removes even the
 * twin's own BackChip UI outright, replacing it with a LeapFI logo Home
 * nav control. There is therefore no v1 base anchor for the replacement
 * (D20 is a twin-specific product decision, not a v1 port) — its coverage
 * below cites Topbar.tsx's own D20 header section instead.
 *
 * D18: no test here touches Home's "Start the demo" affordance.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { Topbar } from '../../components/Topbar'
import type { TopbarProps } from '../../components/Topbar'

function minimalTopbarProps(overrides: Partial<TopbarProps> = {}): TopbarProps {
  return {
    breadcrumb: 'Home',
    onOpenBoardDeck: () => {},
    date: 'Friday, August 15, 2026',
    profile: { name: 'Rachel Fischer', initials: 'RF' },
    profileMenuItems: [],
    ...overrides,
  }
}

async function navigateToOnSideChild(user: ReturnType<typeof userEvent.setup>, childLabel: string): Promise<void> {
  const nav = screen.getByRole('navigation', { name: 'Primary' })
  const onSide = within(nav).getByRole('button', { name: 'OnSide' })
  if (onSide.getAttribute('aria-expanded') === 'false') {
    await user.click(onSide)
  }
  await user.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('button', { name: childLabel }))
}

describe('topbar chrome at boot (base L823–854; D20 Home logo control)', () => {
  it('shows breadcrumb Home, the Live pill, the fixed demo date, the default Rachel Fischer persona, and the LeapFI Home logo control; no back-chip anywhere', () => {
    render(<App />)
    const banner = screen.getByRole('banner')

    expect(within(banner).getByText('Home')).toBeInTheDocument()
    expect(within(banner).getByText('Live')).toBeInTheDocument()
    // Base date display, verbatim (L823–854: date "Friday, August 15, 2026").
    expect(within(banner).getByText('Friday, August 15, 2026')).toBeInTheDocument()
    // Base default user Rachel Fischer CRO (L823–854; USERS[0], source 1159–68).
    expect(within(banner).getByRole('button', { name: 'Rachel Fischer' })).toBeInTheDocument()
    // D20: the struck BackChip never renders, at root or anywhere else.
    expect(within(banner).queryByRole('button', { name: /^Back to / })).not.toBeInTheDocument()
    // D20: the LeapFI logo Home nav control replaces it, always present.
    expect(within(banner).getByRole('button', { name: 'LeapFI — Home' })).toBeInTheDocument()
  })
})

describe('BackChip struck (D20): no "Back to X" control survives navigation, and the Home logo control persists', () => {
  it('leaving Home never produces a "Back to X" button; the Home logo control stays in place', async () => {
    const user = userEvent.setup()
    render(<App />)

    await navigateToOnSideChild(user, 'Regulatory feed')
    const banner = screen.getByRole('banner')
    expect(within(banner).queryByRole('button', { name: /^Back to / })).not.toBeInTheDocument()
    expect(within(banner).getByRole('button', { name: 'LeapFI — Home' })).toBeInTheDocument()
  })

  it('multiple hops of navigation still never surface a "Back to X" control (base one-level NAVBACK UI is fully gone, not merely capped at one hop)', async () => {
    const user = userEvent.setup()
    render(<App />)

    await navigateToOnSideChild(user, 'Regulatory feed')
    await navigateToOnSideChild(user, 'Documents')
    await navigateToOnSideChild(user, 'Ownership')

    const banner = screen.getByRole('banner')
    expect(within(banner).queryByRole('button', { name: /^Back to / })).not.toBeInTheDocument()
    expect(within(banner).getByRole('button', { name: 'LeapFI — Home' })).toBeInTheDocument()
  })

  it('"Open board deck" navigates to the deck without producing a back-chip (base boardDeck() 2393–2448; topbar L823–854)', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Open board deck' }))

    const banner = screen.getByRole('banner')
    expect(within(banner).getByText('Board deck')).toBeInTheDocument()
    expect(within(banner).queryByRole('button', { name: /^Back to / })).not.toBeInTheDocument()
    expect(within(banner).getByRole('button', { name: 'LeapFI — Home' })).toBeInTheDocument()
  })
})

describe('LeapFI logo Home navigation control (D20; Topbar.tsx header "D20 — BACKCHIP STRUCK, LOGO-AS-HOME-NAV ADDED")', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders as a real <button> with accessible name "LeapFI — Home" and calls onNavigateHome on click', async () => {
    const user = userEvent.setup()
    const onNavigateHome = vi.fn()
    render(<Topbar {...minimalTopbarProps({ onNavigateHome })} />)

    const homeButton = screen.getByRole('button', { name: 'LeapFI — Home' })
    expect(homeButton.tagName).toBe('BUTTON')

    await user.click(homeButton)
    expect(onNavigateHome).toHaveBeenCalledTimes(1)
  })

  it('is reachable by Tab (keyboard focusable) and activates on Enter', async () => {
    const user = userEvent.setup()
    const onNavigateHome = vi.fn()
    render(<Topbar {...minimalTopbarProps({ onNavigateHome })} />)

    await user.tab()
    expect(screen.getByRole('button', { name: 'LeapFI — Home' })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onNavigateHome).toHaveBeenCalledTimes(1)
  })

  it('omitting onNavigateHome still renders a focusable, clickable control that no-ops rather than throwing (App.tsx does not wire it yet — D20 STOP-item)', async () => {
    const user = userEvent.setup()
    render(<Topbar {...minimalTopbarProps()} />)

    const homeButton = screen.getByRole('button', { name: 'LeapFI — Home' })
    await user.click(homeButton)
    expect(homeButton).toBeInTheDocument()
  })

  it('shows the dark-background (Black) logo variant by default and when data-theme="dark", and the light-background (Transparent) variant only when data-theme="light" (LOGO-2)', () => {
    render(<Topbar {...minimalTopbarProps()} />)
    const blackImg = document.querySelector('img[data-lf-logo-variant="black"]')
    const transparentImg = document.querySelector('img[data-lf-logo-variant="transparent"]')
    if (!(blackImg instanceof HTMLElement) || !(transparentImg instanceof HTMLElement)) {
      throw new Error('expected both logo <img> variants to be present in the DOM')
    }

    // Default: no data-theme attribute set yet — matches tokens.css's own
    // `:root, [data-theme='dark']` shared-default block (dark-first).
    expect(getComputedStyle(blackImg).display).not.toBe('none')
    expect(getComputedStyle(transparentImg).display).toBe('none')

    document.documentElement.setAttribute('data-theme', 'light')
    expect(getComputedStyle(blackImg).display).toBe('none')
    expect(getComputedStyle(transparentImg).display).not.toBe('none')

    document.documentElement.setAttribute('data-theme', 'dark')
    expect(getComputedStyle(blackImg).display).not.toBe('none')
    expect(getComputedStyle(transparentImg).display).toBe('none')
  })

  it('both logo <img>s are decorative (empty alt) so the button\'s only accessible-name source is its aria-label', () => {
    render(<Topbar {...minimalTopbarProps()} />)
    const images = document.querySelectorAll('[data-lf-composite="topbar-home-logo"] img')
    expect(images.length).toBe(2)
    images.forEach((img) => expect(img).toHaveAttribute('alt', ''))
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
