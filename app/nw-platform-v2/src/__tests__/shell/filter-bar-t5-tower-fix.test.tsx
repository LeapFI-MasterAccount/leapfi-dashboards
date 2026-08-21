/**
 * T5 regression — "the FilterBar's 'Source' dropdown ... opens a huge
 * floating tower of stacked pill Chips overlapping page content." Live
 * defect against OnSideFeed's Regulatory feed screen, Source group (15
 * options, `data/onside.ts` SRC_ROWS).
 *
 * FIX (see `FilterBar.tsx` / `Chip.tsx` file headers for full sourcing):
 *   1. Panel geometry — vertical menu list, width tied to the trigger
 *      (`minWidth: '100%'`) capped at `maxWidth: 'min(22rem, 90vw)'`,
 *      `maxHeight: '24rem'` + `overflowY: 'auto'` instead of unbounded
 *      `flexWrap` growth.
 *   2. Row density — panel options render `Chip density="compact"`
 *      (32px row) instead of the 44px primary-weight pill; every other
 *      Chip caller in the codebase is unmodified (`density` defaults to
 *      `'default'`).
 *   3. Outside-click-to-close, added to match `Topbar.tsx` ProfileMenu /
 *      `NotificationBellPanel.tsx`'s already-shipped disclosure precedent
 *      (previously "deliberately not implemented" in this file).
 *
 * Per this codebase's own test doctrine (see
 * `components-fix-wave.test.tsx` header): jsdom has no layout engine, so
 * geometry is pinned as style-contract assertions (the literal inline
 * `style` values React committed to the DOM), not measured pixel layout.
 */
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from '../../components/FilterBar'
import type { FilterGroup } from '../../components/FilterBar'
import { Chip } from '../../components/primitives/Chip'

// 14 options — mirrors the live defect's shape (OnSideFeed's real Source
// group ships 15; any number >12 exercises the same "tower" condition).
const MANY_OPTIONS = Array.from({ length: 14 }, (_, i) => ({
  id: `src-${i}`,
  label: `Source ${i}`,
  count: i + 1,
}))

function makeGroup(overrides: Partial<FilterGroup> = {}): FilterGroup {
  return {
    id: 'source',
    label: 'Source',
    options: MANY_OPTIONS,
    selectedIds: [],
    onToggle: () => {},
    ...overrides,
  }
}

function getPanel(container: HTMLElement): HTMLElement {
  const panel = container.querySelector('[aria-label="Source filter options"]')
  expect(panel).not.toBeNull()
  return panel as HTMLElement
}

describe('T5 — FilterBar panel geometry contract (no more unbounded tower)', () => {
  it('the open panel is a non-wrapping vertical list, width tied to the trigger and capped, height-bounded with internal scroll', async () => {
    const user = userEvent.setup()
    const { container, getByRole } = render(<FilterBar groups={[makeGroup()]} />)

    await user.click(getByRole('button', { name: 'Source' }))
    const panel = getPanel(container)

    // Vertical menu list, not a wrapping pill tray.
    expect(panel.style.display).toBe('flex')
    expect(panel.style.flexDirection).toBe('column')
    expect(panel.style.flexWrap).not.toBe('wrap')

    // Width tied to the trigger (the `100%` term of `max(100%, 14rem)` —
    // 100% of the non-absolutely-positioned wrapper, which resolves to
    // the trigger's own rendered width) with a readable floor for short
    // triggers with long option labels (the `14rem` term — verified live:
    // a bare `minWidth: '100%'` crushed a narrow "Source" trigger's panel
    // to 3-4-line-wrapped option text, see FilterBar.tsx panelStyle
    // comment), capped so long option labels can never sprawl the panel.
    expect(panel.style.minWidth).toBe('max(100%, 14rem)')
    expect(panel.style.maxWidth).toContain('22rem')

    // Height-bounded with internal scroll instead of unbounded growth —
    // this is literally the "tower" fix: 14 options no longer force the
    // box taller than 24rem.
    expect(panel.style.maxHeight).toBe('24rem')
    expect(panel.style.overflowY).toBe('auto')

    // Anchored above ordinary page content, matching every other
    // utility-disclosure panel already shipped (ProfileMenu,
    // NotificationBellPanel — both zIndex 50; this file was previously
    // the odd one out at 10).
    expect(panel.style.zIndex).toBe('50')
  })

  it('all 14 options still render inside the height-bounded panel (scroll, not truncation, is the contract)', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<FilterBar groups={[makeGroup()]} />)
    await user.click(getByRole('button', { name: 'Source' }))

    for (const option of MANY_OPTIONS) {
      expect(getByRole('button', { name: `${option.label} (${option.count})` })).toBeInTheDocument()
    }
  })
})

describe('T5 — Chip `density="compact"` menu row (panel options), vs. unmodified `default` pill', () => {
  it('FilterBar panel options render as compact (32px) rows, not 44px primary-weight pills', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<FilterBar groups={[makeGroup()]} />)
    await user.click(getByRole('button', { name: 'Source' }))

    const optionButton = getByRole('button', { name: 'Source 0 (1)' })
    expect(optionButton).toHaveAttribute('data-density', 'compact')
    expect(optionButton.style.minHeight).toBe('32px')
    expect(optionButton.style.width).toBe('100%')
  })

  it('a Chip rendered with no `density` prop (every pre-existing caller) is byte-for-byte the original 44px pill — backward compatible', () => {
    const { getByRole } = render(<Chip variant="filter" text="Unrelated caller" selected={false} onPress={() => {}} />)
    const chip = getByRole('button', { name: 'Unrelated caller' })
    expect(chip).toHaveAttribute('data-density', 'default')
    expect(chip.style.minHeight).toBe('44px')
    expect(chip.style.borderRadius).toBe('var(--radius-pill, 999px)')
  })

  it('selected state is still carried by `aria-pressed` in compact density — ARIA toggle semantics unchanged', async () => {
    const user = userEvent.setup()
    let selected: string[] = []
    const group = makeGroup({
      selectedIds: selected,
      onToggle: (id) => {
        selected = [id]
      },
    })
    const { getByRole } = render(<FilterBar groups={[group]} />)
    await user.click(getByRole('button', { name: 'Source' }))

    const optionButton = getByRole('button', { name: 'Source 0 (1)' })
    expect(optionButton).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('T5 — dismiss contract: Escape retained, outside-click added', () => {
  it('Escape still closes the panel and restores focus to the trigger (retained, unregressed)', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = render(<FilterBar groups={[makeGroup()]} />)
    const trigger = getByRole('button', { name: 'Source' })
    await user.click(trigger)
    expect(getByRole('button', { name: 'Source 0 (1)' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(queryByRole('button', { name: 'Source 0 (1)' })).not.toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
  })

  it('a pointerdown outside the panel and its trigger closes the panel (new — matches ProfileMenu / NotificationBellPanel precedent)', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole, container } = render(
      <div>
        <div data-testid="outside-content">Unrelated page content</div>
        <FilterBar groups={[makeGroup()]} />
      </div>,
    )
    await user.click(getByRole('button', { name: 'Source' }))
    expect(getByRole('button', { name: 'Source 0 (1)' })).toBeInTheDocument()

    const outside = container.querySelector('[data-testid="outside-content"]') as HTMLElement
    await user.click(outside)

    expect(queryByRole('button', { name: 'Source 0 (1)' })).not.toBeInTheDocument()
  })

  it('clicking an option inside the open panel is not treated as an outside click — the panel stays open and the toggle fires', async () => {
    const user = userEvent.setup()
    let toggledId: string | null = null
    const group = makeGroup({ onToggle: (id) => { toggledId = id } })
    const { getByRole } = render(<FilterBar groups={[group]} />)
    await user.click(getByRole('button', { name: 'Source' }))

    await user.click(getByRole('button', { name: 'Source 0 (1)' }))

    expect(toggledId).toBe('src-0')
    // Still open — selecting an option does not dismiss the panel.
    expect(getByRole('button', { name: 'Source 1 (2)' })).toBeInTheDocument()
  })

  it('re-clicking the trigger while open closes it cleanly (no interference from the new outside-click listener)', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = render(<FilterBar groups={[makeGroup()]} />)
    const trigger = getByRole('button', { name: 'Source' })

    await user.click(trigger)
    expect(getByRole('button', { name: 'Source 0 (1)' })).toBeInTheDocument()

    await user.click(trigger)
    expect(queryByRole('button', { name: 'Source 0 (1)' })).not.toBeInTheDocument()
  })
})

describe('T5 — within-FilterBar scoping sanity (multiple groups do not cross-contaminate the fix)', () => {
  it('only the opened group renders a compact-density panel; a second, closed group renders no panel at all', async () => {
    const user = userEvent.setup()
    const groups: FilterGroup[] = [
      makeGroup({ id: 'source', label: 'Source' }),
      makeGroup({ id: 'status', label: 'Status', options: [{ id: 'good', label: 'Good' }] }),
    ]
    const { container, getByRole, queryByRole } = render(<FilterBar groups={groups} />)

    await user.click(getByRole('button', { name: 'Source' }))
    expect(container.querySelector('[aria-label="Source filter options"]')).not.toBeNull()
    expect(container.querySelector('[aria-label="Status filter options"]')).toBeNull()
    expect(queryByRole('button', { name: 'Good' })).not.toBeInTheDocument()
  })
})
