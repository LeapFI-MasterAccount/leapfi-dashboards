/**
 * Shell regression — Home: greeting heading + customization visibleKeys
 * flow (bar -> panels).
 *
 * PI2-D40 (user directive 2026-08-20): the two base-anchored KPI StatCards
 * ("Cost capacity already freed" $540,000/yr, "Capacity freed" 3.5 FTE,
 * base leapfi-platform.html source 4197–4296) are REMOVED from Home
 * entirely — the page's purpose is the user configuring the KPIs/flash
 * updates they want to see, not displaying two fixed ones. The former
 * "Home" static h1 becomes a randomized greeting + the active persona's
 * first name (see the "Home greeting heading" describe block below); the
 * `HomeCustomizeBar` moves from below the CTA row into the top-right
 * utility corner alongside the page title, compact, D22 behavior
 * unchanged.
 *
 * D17: base anchors (leapfi-platform.html @1c230fe via survey_map.md):
 *  - source 4122–4193  home customization: `HP` panel catalog (4122–4125),
 *    `homeOrder()` healing (4126–4133), `homePanelToggle`/`homePanelsClear`/
 *    `homePanelsReset` (4149–4172), `applyHomePanels` ordered render
 *    (4172–4188). Toggling a panel back ON appends it to the END of the
 *    stored order (base homePanelToggle push semantics).
 *
 * D18 (KNOWN FLUX): Home's "Start the demo" demo-entry affordance is NOT
 * pinned here — no test presses or asserts it.
 *
 * HOME_ORDER is the ported mutable module singleton (base
 * `HOME_ORDER[roleKey]=[...]`); tests reset the active role's key between
 * runs so one test's customization never leaks into the next.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { HOME_ORDER } from '../../data/misc'
import { resolveHomeGreetings } from '../../screens/Home'

beforeEach(() => {
  for (const key of Object.keys(HOME_ORDER)) {
    delete HOME_ORDER[key]
  }
  // L11 (D13): HomeCustomizeBar.tsx's commitVisibleKeys now also persists
  // to localStorage (state/demoStore.ts) — without clearing it here too,
  // a later test's customization would leak into this file's "never-
  // customized boot" assertions via the persisted fallback, the same
  // isolation precedent theme-toggle.test.tsx already establishes.
  window.localStorage.clear()
})

function panelKeysInOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-lf-home-panel]')).map(
    (el) => el.getAttribute('data-lf-home-panel') ?? '',
  )
}

describe('Home greeting heading (PI2-D40 — replaces the static "Home" h1)', () => {
  it('renders the page title as one of the defined greetings + the active persona\'s first name (default persona: Rachel)', () => {
    render(<App />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveAttribute('id', 'home-page-title')
    // Bucket-aware membership (viewer-local-clock fix, see
    // home-greeting-clock.test.tsx): compute the expected set from the
    // real system clock at test-run time via the same resolver Home.tsx
    // uses, so this assertion is correct at any hour the suite runs,
    // never a flaky bet on a fixed phrase list.
    const possible = resolveHomeGreetings(new Date()).map((g) => `${g}, Rachel`)
    expect(possible).toContain(heading.textContent)
  })

  it('keeps aria-labelledby wired from the main region to the greeting heading', () => {
    render(<App />)

    const main = document.getElementById('home-main')
    expect(main).toHaveAttribute('aria-labelledby', 'home-page-title')
    expect(document.getElementById('home-page-title')).toBe(screen.getByRole('heading', { level: 1 }))
  })
})

describe('call-04 — Northwinds logo + mock contact info in the greeting section', () => {
  it('renders the Northwinds mark, org name, and mock address/phone directly below the greeting heading, above the primary CTA', () => {
    render(<App />)

    const strip = document.querySelector('[data-lf-view="northwinds-brand-strip"]')
    expect(strip).not.toBeNull()
    expect(strip?.querySelector('[data-lf-mark="northwinds"]')).not.toBeNull()
    expect(within(strip as HTMLElement).getByText('Northwinds Federal Credit Union')).toBeInTheDocument()
    // Mock contact info — never a claim about a real organization.
    expect(within(strip as HTMLElement).getByText(/1200 Meridian Way, Suite 400, Minneapolis, MN 55401/)).toBeInTheDocument()
    expect(within(strip as HTMLElement).getByText(/\(612\) 555-0148/)).toBeInTheDocument()

    // Greeting-adjacent placement: after the heading, before the CTA.
    const heading = screen.getByRole('heading', { level: 1 })
    const cta = screen.getByRole('button', { name: "Open today's regulatory feed" })
    expect(Boolean(heading.compareDocumentPosition(strip as Node) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
    expect(Boolean((strip as Node).compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
  })

  it('the Northwinds mark is decorative (aria-hidden) — the org name text carries the accessible content, not the SVG', () => {
    render(<App />)
    const mark = document.querySelector('[data-lf-mark="northwinds"]')
    expect(mark).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Home KPI StatCards removed (PI2-D40)', () => {
  it('no longer renders the two base-anchored KPI figures ($540,000/yr freed, 3.5 FTE) or their StatCard groups', () => {
    render(<App />)

    expect(screen.queryByText('$540,000')).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Cost capacity already freed' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Capacity freed' })).not.toBeInTheDocument()
    expect(screen.queryByText('3.5')).not.toBeInTheDocument()
  })
})

describe('HomeCustomizeBar placement (PI2-D40 — top-right utility corner, compact)', () => {
  it('seats the customize trigger in a dedicated header row with the page title, not directly under #home-main', () => {
    const { container } = render(<App />)

    const heading = screen.getByRole('heading', { level: 1 })
    const bar = container.querySelector('[data-lf-composite="home-customize-bar"]')
    const main = document.getElementById('home-main')
    expect(bar).not.toBeNull()
    // A dedicated header row wraps both the title and the bar — not a bare
    // stack of direct #home-main children (the pre-D40 shape).
    expect(heading.parentElement).not.toBe(main)
    expect(heading.parentElement?.contains(bar as Node)).toBe(true)
  })

  it('renders the customize trigger before the primary CTA in DOM order — the utility corner sits above the CTA row, not stacked below it', () => {
    render(<App />)

    const bar = document.querySelector('[data-lf-composite="home-customize-bar"]') as Node
    const cta = screen.getByRole('button', { name: "Open today's regulatory feed" })
    // Node.DOCUMENT_POSITION_FOLLOWING (4) set on `cta` relative to `bar`
    // means bar precedes cta in document order.
    const position = bar.compareDocumentPosition(cta)
    expect(Boolean(position & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
  })
})

describe('Home customization: visibleKeys flow bar -> panels (base 4122–4193)', () => {
  it('never-customized boot renders all 5 panels in the shipped HP order (homeOrder healing, 4126–4133)', () => {
    const { container } = render(<App />)
    expect(panelKeysInOrder(container)).toEqual(['posture', 'legis', 'invest', 'queue', 'qa'])
    expect(screen.getByRole('button', { name: 'Customize (5 of 5 shown)' })).toBeInTheDocument()
  })

  it('toggling a panel off in the bar removes exactly that panel and updates the shown count (homePanelToggle, 4149–4172)', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await user.click(screen.getByRole('button', { name: 'Customize (5 of 5 shown)' }))
    const bar = screen.getByRole('group', { name: 'Customize your home' })
    await user.click(within(bar).getByRole('button', { name: '1. Risk posture' }))

    expect(panelKeysInOrder(container)).toEqual(['legis', 'invest', 'queue', 'qa'])
    expect(screen.getByRole('button', { name: 'Customize (4 of 5 shown)' })).toBeInTheDocument()
  })

  it('toggling a panel back on appends it to the END of the order (base homePanelToggle push semantics, 4149–4172)', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await user.click(screen.getByRole('button', { name: 'Customize (5 of 5 shown)' }))
    const bar = screen.getByRole('group', { name: 'Customize your home' })
    await user.click(within(bar).getByRole('button', { name: '1. Risk posture' }))
    // Now off — the chip loses its position number.
    await user.click(within(bar).getByRole('button', { name: 'Risk posture' }))

    expect(panelKeysInOrder(container)).toEqual(['legis', 'invest', 'queue', 'qa', 'posture'])
    expect(screen.getByRole('button', { name: 'Customize (5 of 5 shown)' })).toBeInTheDocument()
  })

  it('Clear all empties the panel set honestly; Reset layout restores the full shipped order (homePanelsClear/homePanelsReset, 4149–4172)', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await user.click(screen.getByRole('button', { name: 'Customize (5 of 5 shown)' }))
    const bar = screen.getByRole('group', { name: 'Customize your home' })

    await user.click(within(bar).getByRole('button', { name: 'Clear all' }))
    expect(panelKeysInOrder(container)).toEqual([])
    expect(screen.getByRole('button', { name: 'Customize (0 of 5 shown)' })).toBeInTheDocument()
    // Honest bar note — nothing pretends to be shown.
    expect(within(screen.getByRole('group', { name: 'Customize your home' })).getByText(/Nothing showing/)).toBeInTheDocument()

    await user.click(within(screen.getByRole('group', { name: 'Customize your home' })).getByRole('button', { name: 'Reset layout' }))
    expect(panelKeysInOrder(container)).toEqual(['posture', 'legis', 'invest', 'queue', 'qa'])
    expect(screen.getByRole('button', { name: 'Customize (5 of 5 shown)' })).toBeInTheDocument()
  })

  it('the customized order survives leaving Home and returning (stored HOME_ORDER[roleKey] is authoritative, 4126–4133)', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await user.click(screen.getByRole('button', { name: 'Customize (5 of 5 shown)' }))
    const bar = screen.getByRole('group', { name: 'Customize your home' })
    await user.click(within(bar).getByRole('button', { name: '1. Risk posture' }))
    expect(panelKeysInOrder(container)).toEqual(['legis', 'invest', 'queue', 'qa'])

    // Leave Home (Reporting is a top-level leaf) and come back.
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    await user.click(within(nav).getByRole('button', { name: 'Reporting' }))
    await user.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('button', { name: 'Home' }))

    expect(panelKeysInOrder(container)).toEqual(['legis', 'invest', 'queue', 'qa'])
    expect(screen.getByRole('button', { name: 'Customize (4 of 5 shown)' })).toBeInTheDocument()
  })
})
