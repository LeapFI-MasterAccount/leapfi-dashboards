/**
 * Shell regression — Home: stat cards + customization visibleKeys flow
 * (bar -> panels).
 *
 * D17: base anchors (leapfi-platform.html @1c230fe via survey_map.md):
 *  - source 4197–4296  `renderHome` — "$540,000/yr freed", "3.5 FTE".
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

beforeEach(() => {
  for (const key of Object.keys(HOME_ORDER)) {
    delete HOME_ORDER[key]
  }
})

function panelKeysInOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-lf-home-panel]')).map(
    (el) => el.getAttribute('data-lf-home-panel') ?? '',
  )
}

describe('Home stat cards (base renderHome, source 4197–4296)', () => {
  it('shows the two base figures: $540,000/yr freed and 3.5 FTE', () => {
    render(<App />)

    const freed = screen.getByRole('group', { name: 'Cost capacity already freed' })
    expect(within(freed).getByText('$540,000')).toBeInTheDocument()
    expect(within(freed).getByText('/yr')).toBeInTheDocument()

    const fte = screen.getByRole('group', { name: 'Capacity freed' })
    expect(within(fte).getByText('3.5')).toBeInTheDocument()
    expect(within(fte).getByText('FTE')).toBeInTheDocument()
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
