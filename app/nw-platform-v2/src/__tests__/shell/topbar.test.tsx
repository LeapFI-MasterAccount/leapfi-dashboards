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
 *
 * D21 (decisions.md; Topbar.tsx header "D21 — DARK CHROME BAND,
 * SINGLE-MASTER LOGO"): the D20-era logo describes above ("Black" logo
 * variant swapping with "Transparent" per `data-theme`) is superseded —
 * this file's former "shows the dark-background (Black) logo variant..."
 * test is replaced below by single-master + dark-chrome-band coverage.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { Topbar } from '../../components/Topbar'
import type { TopbarProps } from '../../components/Topbar'
import logoTransparent from '../../assets/LeapFI-Logo-WithoutTagline-Transparent.png'

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

  it('D21: renders exactly one logo <img> — the Transparent master — with no data-lf-logo-variant attribute and no swap, in every theme (supersedes the D20 Black/Transparent two-image swap)', () => {
    render(<Topbar {...minimalTopbarProps()} />)

    const imagesAtBoot = document.querySelectorAll('[data-lf-composite="topbar-home-logo"] img')
    expect(imagesAtBoot.length).toBe(1)
    expect(document.querySelector('img[data-lf-logo-variant]')).not.toBeInTheDocument()

    document.documentElement.setAttribute('data-theme', 'light')
    expect(document.querySelectorAll('[data-lf-composite="topbar-home-logo"] img').length).toBe(1)
    expect(document.querySelector('img[data-lf-logo-variant]')).not.toBeInTheDocument()

    document.documentElement.setAttribute('data-theme', 'dark')
    expect(document.querySelectorAll('[data-lf-composite="topbar-home-logo"] img').length).toBe(1)
    expect(document.querySelector('img[data-lf-logo-variant]')).not.toBeInTheDocument()
  })

  it('D21: the single logo <img> is always the Transparent master asset (never the Black master) regardless of data-theme, and is decorative (empty alt) so the button\'s only accessible-name source is its aria-label', () => {
    render(<Topbar {...minimalTopbarProps()} />)
    const img = document.querySelector('[data-lf-composite="topbar-home-logo"] img')
    if (!(img instanceof HTMLImageElement)) throw new Error('expected the logo <img> to be present')

    expect(img).toHaveAttribute('alt', '')
    const srcAtBoot = img.getAttribute('src')
    expect(srcAtBoot).toBe(logoTransparent)

    document.documentElement.setAttribute('data-theme', 'light')
    expect(img.getAttribute('src')).toBe(srcAtBoot)

    document.documentElement.setAttribute('data-theme', 'dark')
    expect(img.getAttribute('src')).toBe(srcAtBoot)
  })
})

describe('D21 dark chrome band (decisions.md D21; Topbar.tsx header "D21 — DARK CHROME BAND, SINGLE-MASTER LOGO")', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  // jsdom does not perform CSS custom-property (`var()`) substitution when
  // computing `getComputedStyle()` (empirically verified: a `var()`-based
  // inline background/box-shadow resolves to the unset default regardless
  // of what the referenced custom property declares — see Topbar.tsx
  // header "D21 ... TESTED VIA CSSOM" bullet). This suite therefore reads
  // the injected <style> sheet's parsed CSSStyleRule objects directly —
  // jsdom DOES parse `<style>` text into real rules with accurate
  // `selectorText` and `style.getPropertyValue('--x')` — instead of
  // asserting resolved computed colors.
  function topbarChromeRules(): CSSStyleRule[] {
    const rules: CSSStyleRule[] = []
    document.querySelectorAll('style').forEach((styleEl) => {
      const sheet = styleEl.sheet
      if (!sheet) return
      Array.from(sheet.cssRules).forEach((rule) => {
        if (rule instanceof CSSStyleRule && rule.selectorText.includes('topbar')) {
          rules.push(rule)
        }
      })
    })
    return rules
  }

  it('declares an unconditional (no [data-theme=...] gate) dark-value rule scoped to [data-lf-composite="topbar"], with every value copied verbatim from tokens.css\'s dark block', () => {
    render(<Topbar {...minimalTopbarProps()} />)
    const forcingRule = topbarChromeRules().find((r) => r.selectorText === "[data-lf-composite='topbar']")
    if (!forcingRule) throw new Error('expected an unconditional [data-lf-composite="topbar"] rule in the DOM')

    // Unconditional: this rule's own selector carries no data-theme gate,
    // so it applies to the topbar header regardless of the page theme.
    expect(forcingRule.selectorText).not.toContain('data-theme')

    // tokens.css `:root, [data-theme='dark']` core-palette values, verbatim.
    expect(forcingRule.style.getPropertyValue('--bg').trim()).toBe('#000000')
    expect(forcingRule.style.getPropertyValue('--bg2').trim()).toBe('#0d0d0d')
    expect(forcingRule.style.getPropertyValue('--panel').trim()).toBe('#0d1525')
    expect(forcingRule.style.getPropertyValue('--border').trim()).toBe('#1e2d3d')
    expect(forcingRule.style.getPropertyValue('--ink').trim()).toBe('#ffffff')
    expect(forcingRule.style.getPropertyValue('--ink2').trim()).toBe('#9ba0a6')
    expect(forcingRule.style.getPropertyValue('--ink3').trim()).toBe('#7b8794')
    expect(forcingRule.style.getPropertyValue('--accent').trim()).toBe('#00f2ff')
    expect(forcingRule.style.getPropertyValue('--accent2').trim()).toBe('#2d5bff')
    expect(forcingRule.style.getPropertyValue('--focus-ring').trim()).toBe(
      '0 0 0 2px #000000, 0 0 0 4px #00f2ff, 0 0 12px 2px rgba(0, 242, 255, 0.65)',
    )
  })

  it('the dark-forcing rule is present with identical declarations regardless of the page data-theme attribute (absent, light, or dark) — a static asset, not JS-branched per theme render', () => {
    render(<Topbar {...minimalTopbarProps()} />)
    const ruleTextAt = () =>
      topbarChromeRules().find((r) => r.selectorText === "[data-lf-composite='topbar']")?.cssText

    document.documentElement.removeAttribute('data-theme')
    const textWhenAbsent = ruleTextAt()
    expect(textWhenAbsent).toBeTruthy()

    document.documentElement.setAttribute('data-theme', 'light')
    expect(ruleTextAt()).toBe(textWhenAbsent)

    document.documentElement.setAttribute('data-theme', 'dark')
    expect(ruleTextAt()).toBe(textWhenAbsent)
  })

  it('declares a light-mode restore rule scoped ONLY to the ProfileMenu popover subtree (profile-menu-list), not the Avatar trigger, with values copied verbatim from tokens.css\'s light block', () => {
    render(<Topbar {...minimalTopbarProps()} />)
    const restoreRule = topbarChromeRules().find((r) => r.selectorText.includes('profile-menu-list'))
    if (!restoreRule) throw new Error('expected a profile-menu-list light-restore rule in the DOM')

    expect(restoreRule.selectorText).toBe(
      "[data-theme='light'] [data-lf-composite='topbar'] [data-lf-composite='profile-menu-list']",
    )
    // tokens.css `[data-theme='light']` core-palette values, verbatim.
    expect(restoreRule.style.getPropertyValue('--bg').trim()).toBe('#ffffff')
    expect(restoreRule.style.getPropertyValue('--bg2').trim()).toBe('#f7fafc')
    expect(restoreRule.style.getPropertyValue('--panel').trim()).toBe('#f1f5f9')
    expect(restoreRule.style.getPropertyValue('--border').trim()).toBe('#d7dee7')
    expect(restoreRule.style.getPropertyValue('--ink').trim()).toBe('#0a2342')
    expect(restoreRule.style.getPropertyValue('--ink2').trim()).toBe('#64748b')
    expect(restoreRule.style.getPropertyValue('--focus-ring').trim()).toBe('0 0 0 2px #ffffff, 0 0 0 4px #006d75')
  })

  it('the bar and its own directly-owned elements still read the shared var(--x) tokens (not hardcoded hex), so the scoped override stays the single source of truth with tokens.css', () => {
    render(<Topbar {...minimalTopbarProps()} />)
    const bar = screen.getByRole('banner')
    expect(bar.style.background).toContain('var(--bg2)')
    expect(bar.style.borderBottom).toContain('var(--border)')
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
