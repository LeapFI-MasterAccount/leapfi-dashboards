/**
 * T5 PARITY FIX — HomeCustomizeBar carried an independent, hand-rolled copy
 * of the same pre-fix "tower" defect `FilterBar.tsx` shipped before the T5
 * fix (see `filter-bar-t5-tower-fix.test.tsx` / `FilterBar.tsx` file header):
 * disclosure panel with `flexWrap: 'wrap'`, `minWidth: '20rem'`, no
 * `maxHeight`/`overflowY`, `zIndex: 10` (the odd one out vs. every other
 * utility-disclosure panel in this codebase), and no outside-click dismiss.
 *
 * This file pins `HomeCustomizeBar.tsx`'s panel back onto the exact same
 * geometry contract `FilterBar.tsx`'s panel now carries (see that file's
 * "T5 FIX" header note for full sourcing) — column menu, width tied to the
 * trigger and capped, height-bounded with internal scroll, zIndex 50,
 * compact-density Chips for the panel-toggle option rows, and outside-click
 * dismiss added alongside the pre-existing Escape handling.
 *
 * Per this codebase's own test doctrine (see `components-fix-wave.test.tsx`
 * header / `filter-bar-t5-tower-fix.test.tsx`): jsdom has no layout engine,
 * so geometry is pinned as style-contract assertions (the literal inline
 * `style` values React committed to the DOM), not measured pixel layout.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeCustomizeBar, DEFAULT_VISIBLE_KEYS, HOME_PANEL_DEFS } from '../../views/HomeCustomizeBar'
import type { HomePanelKey } from '../../views/HomeCustomizeBar'
import { HOME_ORDER } from '../../data/misc'

const TRIGGER_NAME = `Customize (${DEFAULT_VISIBLE_KEYS.length} of ${HOME_PANEL_DEFS.length} shown)`
const PANEL_LABEL = 'Customize your home'

function renderBar(roleKey = 'test-t5-role', onChange: (next: readonly HomePanelKey[]) => void = () => {}) {
  return render(
    <HomeCustomizeBar roleKey={roleKey} roleFirstName="Rachel" visibleKeys={DEFAULT_VISIBLE_KEYS} onChange={onChange} />,
  )
}

function getPanel(container: HTMLElement): HTMLElement {
  const panel = container.querySelector(`[aria-label="${PANEL_LABEL}"]`)
  expect(panel).not.toBeNull()
  return panel as HTMLElement
}

function getWrap(container: HTMLElement): HTMLElement {
  const wrap = container.querySelector('[data-lf-composite="home-customize-bar"]')
  expect(wrap).not.toBeNull()
  return wrap as HTMLElement
}

// With DEFAULT_VISIBLE_KEYS (every panel shown), each toggle Chip's
// accessible name carries its 1-based position prefix (HomeCustomizeBar.tsx
// render: `${pos + 1}. ${label}`) — HOME_PANEL_DEFS order matches
// DEFAULT_VISIBLE_KEYS order exactly, so array index doubles as position.
const SHOWN_OPTION_NAMES = HOME_PANEL_DEFS.map(({ label }, i) => `${i + 1}. ${label}`)

describe('T5 parity — HomeCustomizeBar panel geometry contract (same shape FilterBar.tsx carries)', () => {
  it('the open panel is a non-wrapping vertical list, width tied to the trigger and capped, height-bounded with internal scroll, zIndex 50', async () => {
    const user = userEvent.setup()
    const { container, getByRole } = renderBar()

    await user.click(getByRole('button', { name: TRIGGER_NAME }))
    const panel = getPanel(container)

    // Vertical menu list, not the old wrapping pill tray.
    expect(panel.style.display).toBe('flex')
    expect(panel.style.flexDirection).toBe('column')
    expect(panel.style.flexWrap).not.toBe('wrap')

    // Width tied to the trigger, same formula FilterBar.tsx's panelStyle
    // uses — `max(100%, 14rem)`, capped at `min(22rem, 90vw)`.
    expect(panel.style.minWidth).toBe('max(100%, 14rem)')
    expect(panel.style.maxWidth).toContain('22rem')

    // Height-bounded with internal scroll instead of unbounded growth.
    expect(panel.style.maxHeight).toBe('24rem')
    expect(panel.style.overflowY).toBe('auto')

    // Anchored above ordinary page content — was the odd one out at 10.
    expect(panel.style.zIndex).toBe('50')
  })

  it("the panel's containing wrap opts out of Home.tsx's column-flex stretch (alignSelf: flex-start), so the trigger-tied `100%` term is real, not the full content-column width", async () => {
    const { container } = renderBar()
    const wrap = getWrap(container)
    expect(wrap.style.alignSelf).toBe('flex-start')
  })

  it('all 5 panel-toggle options plus both command chips still render inside the height-bounded panel', async () => {
    const user = userEvent.setup()
    const { getByRole } = renderBar()
    await user.click(getByRole('button', { name: TRIGGER_NAME }))

    for (const name of SHOWN_OPTION_NAMES) {
      expect(getByRole('button', { name })).toBeInTheDocument()
    }
    expect(getByRole('button', { name: 'Clear all' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Reset layout' })).toBeInTheDocument()
  })
})

describe('T5 parity — Chip `density="compact"` scoped to the panel-toggle option rows only', () => {
  it('the 5 panel-toggle rows render compact (32px, full-width) — the option rows the dispatch names', async () => {
    const user = userEvent.setup()
    const { getByRole } = renderBar()
    await user.click(getByRole('button', { name: TRIGGER_NAME }))

    for (const name of SHOWN_OPTION_NAMES) {
      const optionButton = getByRole('button', { name })
      expect(optionButton).toHaveAttribute('data-density', 'compact')
      expect(optionButton.style.minHeight).toBe('32px')
      expect(optionButton.style.width).toBe('100%')
    }
  })

  it('"Clear all" / "Reset layout" stay the original default-density command chips — not part of the compact "option rows" scope', async () => {
    const user = userEvent.setup()
    const { getByRole } = renderBar()
    await user.click(getByRole('button', { name: TRIGGER_NAME }))

    const clearAll = getByRole('button', { name: 'Clear all' })
    const resetLayout = getByRole('button', { name: 'Reset layout' })
    expect(clearAll).toHaveAttribute('data-density', 'default')
    expect(resetLayout).toHaveAttribute('data-density', 'default')
  })

  it('selected state is still carried by aria-pressed in compact density — ARIA toggle semantics unchanged', async () => {
    const user = userEvent.setup()
    const { getByRole } = renderBar()
    await user.click(getByRole('button', { name: TRIGGER_NAME }))

    // 'posture' is visible in DEFAULT_VISIBLE_KEYS, so its rendered label
    // carries the position-number prefix (see HomeCustomizeBar.tsx render).
    // HF1 (user ruling 2026-08-21): 'aigov' now leads the default, so
    // posture sits at position 2 — derive it so this never goes stale again.
    const posturePosition = DEFAULT_VISIBLE_KEYS.indexOf('posture') + 1
    const postureButton = getByRole('button', { name: `${posturePosition}. Risk posture` })
    expect(postureButton).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('T5 parity — dismiss contract: Escape retained, outside-click added', () => {
  it('Escape still closes the panel and restores focus to the trigger (retained, unregressed)', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = renderBar()
    const trigger = getByRole('button', { name: TRIGGER_NAME })
    await user.click(trigger)
    expect(getByRole('button', { name: 'Clear all' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
  })

  it('a pointerdown outside the panel and its trigger closes the panel (new — matches FilterBar.tsx / ProfileMenu / NotificationBellPanel precedent)', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole, container } = render(
      <div>
        <div data-testid="outside-content">Unrelated page content</div>
        <HomeCustomizeBar roleKey="test-t5-role" roleFirstName="Rachel" visibleKeys={DEFAULT_VISIBLE_KEYS} onChange={() => {}} />
      </div>,
    )
    await user.click(getByRole('button', { name: TRIGGER_NAME }))
    expect(getByRole('button', { name: 'Clear all' })).toBeInTheDocument()

    const outside = container.querySelector('[data-testid="outside-content"]') as HTMLElement
    await user.click(outside)

    expect(queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
  })

  it('clicking an option inside the open panel is not treated as an outside click — the panel stays open and the toggle fires', async () => {
    const user = userEvent.setup()
    let latest: readonly HomePanelKey[] = DEFAULT_VISIBLE_KEYS
    const { getByRole } = renderBar('test-t5-role', (next) => {
      latest = next
    })
    await user.click(getByRole('button', { name: TRIGGER_NAME }))

    // HF1: derive posture's position prefix (now 2, behind 'aigov') and the
    // expected remainder from DEFAULT_VISIBLE_KEYS instead of stale literals.
    await user.click(getByRole('button', { name: `${DEFAULT_VISIBLE_KEYS.indexOf('posture') + 1}. Risk posture` }))

    expect(latest).toEqual(DEFAULT_VISIBLE_KEYS.filter((k) => k !== 'posture'))
    // Still open — toggling an option does not dismiss the panel.
    expect(getByRole('button', { name: 'Clear all' })).toBeInTheDocument()
  })

  it('re-clicking the trigger while open closes it cleanly (no interference from the new outside-click listener)', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = renderBar()
    const trigger = getByRole('button', { name: TRIGGER_NAME })

    await user.click(trigger)
    expect(getByRole('button', { name: 'Clear all' })).toBeInTheDocument()

    await user.click(trigger)
    expect(queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
  })
})

describe('T5 parity — HOME_ORDER commit behavior is unchanged by the geometry/dismiss restyle', () => {
  afterEach(() => {
    delete HOME_ORDER['test-t5-commit-role']
  })

  it('Clear all still writes an empty array to HOME_ORDER[roleKey] and reports it via onChange (unchanged commit semantics)', async () => {
    const user = userEvent.setup()
    let latest: readonly HomePanelKey[] | null = null
    const { getByRole } = renderBar('test-t5-commit-role', (next) => {
      latest = next
    })
    await user.click(getByRole('button', { name: TRIGGER_NAME }))
    await user.click(getByRole('button', { name: 'Clear all' }))

    expect(latest).toEqual([])
    expect(HOME_ORDER['test-t5-commit-role']).toEqual([])
  })
})
