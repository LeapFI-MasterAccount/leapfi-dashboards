/**
 * call-03 rename, closing L1's disclosed residue (planning/
 * call-03-regulatory-radar-rename.md; meeting_notes_2026-08-20.md:86):
 * L1 renamed every *literal string HomePanels.tsx itself owns* (the
 * `RegulatoryRadarPanel` DataTable caption and Drawer title — pinned by
 * `home-panels.test.tsx`'s "call-03 rename" describe block) but flagged,
 * as an out-of-allowlist STOP, that the panel's *own on-screen section
 * heading* (the `<h2>` above the panel, rendered from
 * `labelByKey.get('legis')`) and the matching toggle label in
 * `HomeCustomizeBar.tsx`'s panel picker both resolve to the SAME literal
 * string: `data/misc.ts`'s `HP` array entry
 * `['legis', 'hp-legis', 'Strategic signal']` (see `HomePanels.tsx`'s file
 * header, "STOP-ITEM / OUT-OF-ALLOWLIST FINDING").
 *
 * This dispatch renames that HP array entry's *label* (index 2) at its
 * data source only — `HP`'s key (`'legis'`) and id (`'hp-legis'`) stay
 * byte-identical, so `HOME_ORDER`'s persisted per-role layouts (which
 * store keys, never labels — see `data/misc.ts` `HOME_ORDER: Record<string,
 * string[]>`) are unaffected by this rename.
 *
 * Both describe blocks below assert the literal string "Regulatory Radar"
 * directly (never derived from `HOME_PANEL_DEFS`/`HP` themselves, which
 * would make the assertion pass no matter what the label actually says) —
 * these are the two MOST VISIBLE on-screen sites of the old name L1's STOP
 * called out, and are the ones this dispatch closes.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePanels } from '../../views/HomePanels'
import { HomeCustomizeBar, DEFAULT_VISIBLE_KEYS } from '../../views/HomeCustomizeBar'
import { DEFAULT_SLIDERS, setDemoSliders } from '../../state/demoStore'

const noNavigate = () => {}

afterEach(() => {
  act(() => {
    setDemoSliders({ ...DEFAULT_SLIDERS })
  })
})

describe('call-03 rename residue — HomePanels.tsx section heading for the "legis" panel (rendered from labelByKey.get(\'legis\'), sourced from data/misc.ts HP)', () => {
  it('renders the panel\'s own <h2> as "Regulatory Radar", never "Strategic signal"', () => {
    render(<HomePanels visibleKeys={['legis']} currentRoleKey="cro" onNavigate={noNavigate} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Regulatory Radar' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Strategic signal' })).not.toBeInTheDocument()
    expect(screen.queryByText('Strategic signal')).not.toBeInTheDocument()
  })
})

describe('call-03 rename residue — HomeCustomizeBar.tsx panel-picker toggle for the "legis" panel (Chip label sourced from HOME_PANEL_DEFS -> HP, data/misc.ts)', () => {
  it('renders the toggle Chip\'s accessible name with "Regulatory Radar", never "Strategic signal"', async () => {
    const user = userEvent.setup()
    render(<HomeCustomizeBar roleKey="test-rename-role" roleFirstName="Rachel" visibleKeys={DEFAULT_VISIBLE_KEYS} onChange={() => {}} />)

    const legisPosition = DEFAULT_VISIBLE_KEYS.indexOf('legis') + 1
    await user.click(screen.getByRole('button', { name: /^Customize \(/ }))

    expect(screen.getByRole('button', { name: `${legisPosition}. Regulatory Radar` })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: `${legisPosition}. Strategic signal` })).not.toBeInTheDocument()
    expect(screen.queryByText(/Strategic signal/)).not.toBeInTheDocument()
  })
})
