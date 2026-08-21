/**
 * D19b click-affordance standard — component-level regression tests.
 *
 * Pins `affordance_standard.md`'s §5 component change-list against
 * DataTable (C6), StatCard (C1), SetupCard (C15), and DrawerContent (C8)
 * directly (component-level, not via a screen — these are shared
 * composites; screen-level wiring is a later, out-of-allowlist dispatch).
 *
 *  - §0 "on by default, not on hover": every affordance glyph this
 *    standard specifies must be accent-toned (`--accent`, Icon tone
 *    `interactive`) BEFORE any hover/focus interaction, never gated on
 *    `hover || active`.
 *  - §1.2/§1.3 DataTable: `onRowClick`/`isRowClickable` add a whole-row
 *    click affordance (chevron at rest, `--bg2` hover, `--focus-ring`
 *    focus, keyboard Enter/Space) to clickable rows; non-clickable rows in
 *    a mixed table get an empty spacer cell and are not focusable at all.
 *  - §2.1 SetupCard correction: `interactive` variant's chevron tone is
 *    unconditionally `'interactive'`.
 *  - §2.2 StatCard: optional `onPress` renders a real `<button>` with the
 *    SetupCard-mirrored hover/focus/active treatment; omitting it renders
 *    the unchanged `role="group"` div.
 *  - §3.2/§5 item 6 DrawerContent: `DrawerContentField.onPress` renders an
 *    inline, chrome-less `--accent` link with a trailing `arrow-right`
 *    icon, distinct from the footer's `Button`-chrome actions.
 *  - §5 item 7 DrawerContent: at most one `actions` entry may carry
 *    `variant: 'primary'` — a dev-time diagnostic, not a silent filter.
 *
 * Backward compatibility: every new prop is optional; a screen that does
 * not pass it renders exactly as before this dispatch (asserted per
 * component below).
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '../../components/DataTable'
import type { DataTableColumn } from '../../components/DataTable'
import { StatCard } from '../../components/StatCard'
import { SetupCard } from '../../components/SetupCard'
import { DrawerContent } from '../../components/DrawerContent'
import type { DrawerContentAction } from '../../components/DrawerContent'

interface Row {
  id: string
  name: string
}

const ROWS: Row[] = [
  { id: 'r1', name: 'Alpha' },
  { id: 'r2', name: 'Beta' },
]

const COLUMNS: readonly DataTableColumn<Row>[] = [
  { id: 'name', header: 'Name', render: (row) => row.name },
]

function chevron(container: HTMLElement): SVGElement {
  const el = container.querySelector('svg[data-name="chevron-right"]')
  if (!(el instanceof SVGElement)) throw new Error('chevron-right icon not rendered')
  return el
}

describe('DataTable — clickable-row affordance (§1, §5 items 1–3)', () => {
  it('omitting onRowClick renders exactly as before: no chevron column, no tabIndex, no keyboard/hover wiring', () => {
    const { container } = render(
      <DataTable caption="Rows" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} />,
    )
    expect(container.querySelector('svg[data-name="chevron-right"]')).not.toBeInTheDocument()
    const dataRows = screen.getAllByRole('row').slice(1) // drop header row
    for (const row of dataRows) {
      expect(row).not.toHaveAttribute('tabindex')
    }
  })

  it('a clickable row carries the accent chevron AT REST (no hover/focus needed) — §0', () => {
    const { container } = render(
      <DataTable caption="Rows" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} onRowClick={() => {}} />,
    )
    const icon = chevron(container)
    expect(icon.style.color).toBe('var(--accent)')
  })

  it('clicking a clickable row fires onRowClick with that row', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(<DataTable caption="Rows" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} onRowClick={onRowClick} />)
    await user.click(screen.getByText('Alpha'))
    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onRowClick).toHaveBeenCalledWith(ROWS[0])
  })

  it('keyboard Enter on a focused clickable row fires onRowClick (native <tr>/<td> semantics preserved, not role="button")', () => {
    const onRowClick = vi.fn()
    render(<DataTable caption="Rows" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} onRowClick={onRowClick} />)
    const dataRows = screen.getAllByRole('row').slice(1)
    const firstRow = dataRows[0]!
    expect(firstRow).toHaveAttribute('tabindex', '0')
    expect(firstRow).not.toHaveAttribute('role', 'button')
    fireEvent.keyDown(firstRow, { key: 'Enter' })
    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onRowClick).toHaveBeenCalledWith(ROWS[0])
    fireEvent.keyDown(firstRow, { key: ' ' })
    expect(onRowClick).toHaveBeenCalledTimes(2)
  })

  it('hover shifts the row background to --bg2 (never --panel) and focus applies --focus-ring', () => {
    render(<DataTable caption="Rows" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} onRowClick={() => {}} />)
    const dataRows = screen.getAllByRole('row').slice(1)
    const firstRow = dataRows[0]!
    fireEvent.mouseEnter(firstRow)
    expect(firstRow.style.background).toBe('var(--bg2)')
    fireEvent.mouseLeave(firstRow)
    fireEvent.focus(firstRow)
    expect(firstRow.style.boxShadow).toBe('var(--focus-ring)')
    fireEvent.blur(firstRow)
    expect(firstRow.style.boxShadow).toBe('none')
  })

  it('a mixed table (isRowClickable predicate) gives non-clickable rows an empty spacer cell, no chevron, not focusable — §1.3', () => {
    const { container } = render(
      <DataTable
        caption="Rows"
        columns={COLUMNS}
        rows={ROWS}
        getRowId={(r) => r.id}
        onRowClick={() => {}}
        isRowClickable={(row) => row.id === 'r1'}
      />,
    )
    const icons = container.querySelectorAll('svg[data-name="chevron-right"]')
    expect(icons).toHaveLength(1) // only the clickable row gets one
    const dataRows = screen.getAllByRole('row').slice(1)
    const nonClickableRow = dataRows[1]! // Beta, r2
    expect(nonClickableRow).not.toHaveAttribute('tabindex')
    expect(within(nonClickableRow).queryByText('Beta')).toBeInTheDocument()
  })

  it('rowAction present suppresses the whole-row click affordance entirely (stop-item 3 — no invented co-presence behavior)', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    const onRowAction = vi.fn()
    const { container } = render(
      <DataTable
        caption="Rows"
        columns={COLUMNS}
        rows={ROWS}
        getRowId={(r) => r.id}
        onRowClick={onRowClick}
        rowAction={{ label: () => 'Review', onPress: onRowAction }}
      />,
    )
    expect(container.querySelector('svg[data-name="chevron-right"]')).not.toBeInTheDocument()
    const dataRows = screen.getAllByRole('row').slice(1)
    expect(dataRows[0]).not.toHaveAttribute('tabindex')
    await user.click(screen.getByText('Alpha'))
    expect(onRowClick).not.toHaveBeenCalled()
    await user.click(screen.getAllByRole('button', { name: 'Review' })[0]!)
    expect(onRowAction).toHaveBeenCalledTimes(1)
    expect(onRowAction).toHaveBeenCalledWith(ROWS[0])
  })
})

describe('SetupCard — interactive-variant chevron correction (§0, §2.1, §5 item 5)', () => {
  it('the trailing chevron is accent-toned AT REST, not gated on hover/active', () => {
    const { container } = render(
      <SetupCard title="Roadmap teaser" variant="interactive" onPress={() => {}} />,
    )
    const icon = chevron(container)
    expect(icon.style.color).toBe('var(--accent)')
  })

  it('locked variant is unaffected — a lock glyph, no button, no chevron', () => {
    const { container } = render(<SetupCard title="Soon" variant="locked" />)
    expect(container.querySelector('svg[data-name="chevron-right"]')).not.toBeInTheDocument()
    expect(container.querySelector('svg[data-name="lock"]')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('StatCard — clickable variant (§2.2, §5 item 4)', () => {
  it('omitting onPress renders exactly as before: role="group" div, no button, no chevron', () => {
    const { container } = render(<StatCard label="Open gaps" value={12} />)
    expect(screen.getByRole('group', { name: 'Open gaps' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(container.querySelector('svg[data-name="chevron-right"]')).not.toBeInTheDocument()
  })

  it('onPress renders a real button with the accent chevron AT REST', () => {
    const { container } = render(<StatCard label="Open gaps" value={12} onPress={() => {}} />)
    const button = screen.getByRole('button', { name: 'Open gaps' })
    expect(button).toBeInTheDocument()
    const icon = chevron(container)
    expect(icon.style.color).toBe('var(--accent)')
  })

  it('hover/active use --bg2 background + --accent border; focus applies --focus-ring and hides the border (mirrors SetupCard)', () => {
    render(<StatCard label="Open gaps" value={12} onPress={() => {}} />)
    const button = screen.getByRole('button', { name: 'Open gaps' })
    fireEvent.mouseEnter(button)
    expect(button.style.background).toBe('var(--bg2)')
    expect(button.style.borderColor).toBe('var(--accent)')
    fireEvent.mouseLeave(button)
    fireEvent.focus(button)
    expect(button.style.boxShadow).toBe('var(--focus-ring)')
    expect(button.style.borderColor).toBe('transparent')
  })

  it('clicking the card fires onPress', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    render(<StatCard label="Open gaps" value={12} onPress={onPress} />)
    await user.click(screen.getByRole('button', { name: 'Open gaps' }))
    expect(onPress).toHaveBeenCalledOnce()
  })
})

describe('DrawerContent — inline field link vs. footer action Button (§3, §5 items 6–7)', () => {
  it('a field without onPress renders plain text — no button, backward compatible', () => {
    render(<DrawerContent kind="signal" fields={[{ label: 'Source', value: 'Reg B Circular 2026-C1' }]} />)
    expect(screen.getByText('Reg B Circular 2026-C1')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('a field with onPress renders an inline chrome-less link: accent text, trailing arrow-right, real button for keyboard/AT', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    const { container } = render(
      <DrawerContent
        kind="signal"
        fields={[{ label: 'Triggered by', value: 'Widget Loan Redesign', onPress }]}
      />,
    )
    const link = screen.getByRole('button', { name: /Widget Loan Redesign/ })
    expect(link.style.color).toBe('var(--accent)')
    expect(link.style.background).toBe('transparent')
    expect(link.style.padding).toBe('0px')
    const icon = container.querySelector('svg[data-name="arrow-right"]')
    expect(icon).toBeInTheDocument()

    fireEvent.mouseEnter(link)
    expect(link.style.textDecoration).toBe('underline')
    fireEvent.mouseLeave(link)
    expect(link.style.textDecoration).toBe('none')

    fireEvent.focus(link)
    expect(link.style.boxShadow).toBe('var(--focus-ring)')
    fireEvent.blur(link)

    await user.click(link)
    expect(onPress).toHaveBeenCalledOnce()
  })

  it('footer actions stay real Button chrome, unaffected by the inline-link treatment', () => {
    const action: DrawerContentAction = { label: 'Adopt', variant: 'primary', onPress: () => {} }
    render(<DrawerContent kind="signal" fields={[]} actions={[action]} />)
    const button = screen.getByRole('button', { name: 'Adopt' })
    expect(button).toHaveAttribute('data-lf-primitive', 'button')
  })

  it('more than one primary action logs a dev-time diagnostic but still renders every action (§5 item 7)', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const actions: DrawerContentAction[] = [
      { label: 'Adopt', variant: 'primary', onPress: () => {} },
      { label: 'Escalate', variant: 'primary', onPress: () => {} },
    ]
    render(<DrawerContent kind="signal" fields={[]} actions={actions} />)
    expect(errorSpy).toHaveBeenCalled()
    expect(errorSpy.mock.calls[0]![0]).toMatch(/at most 1 action may carry variant="primary"/)
    expect(screen.getByRole('button', { name: 'Adopt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Escalate' })).toBeInTheDocument()
    errorSpy.mockRestore()
  })

  it('a single primary action (or none) does not trigger the diagnostic', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const actions: DrawerContentAction[] = [
      { label: 'Adopt', variant: 'primary', onPress: () => {} },
      { label: 'Reject', variant: 'ghost', onPress: () => {} },
    ]
    render(<DrawerContent kind="signal" fields={[]} actions={actions} />)
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})
