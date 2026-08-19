/**
 * Shell regression — HomePanels: fix-wave findings SH-5, SH-9, SH-6
 * (consumer side).
 *
 * Base anchors (leapfi-platform.html @1c230fe, READ-ONLY):
 *  - SH-5: `sigTouch()` (source 4047-4058) resolves display names for the
 *    signal drawer's touch list — doc via `(d&&d.t)||t[1]`, dom via
 *    `DOM_SHORT[t[1]]||dm.name` + " register", obl via the id. The base
 *    never renders a raw internal slug ("capital-narr", "gov-charter").
 *  - SH-9: the CRO queue's `lrow('Rulemaking to watch','RFI 2026-04
 *    comments due Sep 30','Track',...)` (source 4257) — ported verbatim,
 *    never a generic "N instruments tracked this cycle" line.
 *  - SH-6: `renderHome()` (source 4197+) computes the Investment panel and
 *    queue counts from `computePlan()` over the LIVE levers, so Home
 *    always agrees with Investment Design's just-moved sliders. The twin's
 *    live lever state is `state/demoStore.ts` (`setDemoSliders`), which
 *    `HomePanels` subscribes to via `useDemoStore()`.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePanels } from '../../views/HomePanels'
import { DEFAULT_SLIDERS, setDemoSliders } from '../../state/demoStore'
import { deriveRecomputeView } from '../../engine/plan'
import { OPPS } from '../../data/studio'

const noNavigate = () => {}

afterEach(() => {
  // Return the shared lever singleton to the shipped position so one
  // test's lever move never leaks into the next. Wrapped in act() because
  // a subscribed HomePanels may still be mounted when this write emits.
  act(() => {
    setDemoSliders({ ...DEFAULT_SLIDERS })
  })
})

describe('Strategic signal drawer "Would touch" resolution (SH-5, base sigTouch 4047-4058)', () => {
  it('resolves doc titles and domain display names — never raw slugs', async () => {
    const user = userEvent.setup()
    render(<HomePanels visibleKeys={['legis']} currentRoleKey="cro" onNavigate={noNavigate} />)

    // SIGNAL[1] (Reg O NPRM): touch = [['dom','capital'],['dom','fairlend'],['doc','capital-narr']].
    const row = screen.getByText('Fed & FDIC joint NPRM · Regulation O · insider credit').closest('tr')
    expect(row).not.toBeNull()
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Review' }))

    // Base-resolved names: DOM_SHORT.capital='Capital', DOM_SHORT.fairlend=
    // 'Fair Lending' (base 3011), DOCLIB['capital-narr'].t.
    expect(screen.getByText('Capital register, Fair Lending register, Capital Narrative · CBLR')).toBeInTheDocument()
    expect(screen.queryByText(/capital-narr/)).not.toBeInTheDocument()
    expect(screen.queryByText(/fairlend/)).not.toBeInTheDocument()
  })

  it('renders obligation ids and doc titles for the RFI 2026-04 signal', async () => {
    const user = userEvent.setup()
    render(<HomePanels visibleKeys={['legis']} currentRoleKey="cro" onNavigate={noNavigate} />)

    // SIGNAL[0]: [['obl','mrm','MRM-11'],['obl','mrm','MRM-01'],['obl','mrm','MRM-09'],['doc','gov-charter'],['doc','gen-ai-draft']].
    const row = screen.getByText('Interagency RFI 2026-04 · generative & agentic AI in model risk').closest('tr')
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Review' }))

    expect(
      screen.getByText('MRM-11, MRM-01, MRM-09, Governance Charter, Generative Model Governance · Pre-staged Language'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/gov-charter/)).not.toBeInTheDocument()
    expect(screen.queryByText(/gen-ai-draft/)).not.toBeInTheDocument()
  })
})

describe('CRO queue "Rulemaking to watch" row (SH-9, base 4257)', () => {
  it('ports the base row literals verbatim, not a generic instruments-tracked line', () => {
    render(<HomePanels visibleKeys={['queue']} currentRoleKey="cro" onNavigate={noNavigate} />)

    expect(screen.getByText('Rulemaking to watch')).toBeInTheDocument()
    expect(screen.getByText('RFI 2026-04 comments due Sep 30')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Track' })).toBeInTheDocument()
    expect(screen.queryByText(/instruments? tracked this cycle/)).not.toBeInTheDocument()
  })
})

describe('Investment panel recomputes from the LIVE levers (SH-6, base renderHome 4197+)', () => {
  it('a setDemoSliders write re-renders the panel with the new lever economics', () => {
    render(<HomePanels visibleKeys={['invest']} currentRoleKey="cro" onNavigate={noNavigate} />)

    const before = deriveRecomputeView({ ...DEFAULT_SLIDERS }, OPPS)
    const buildCost = screen.getByRole('group', { name: 'One-time build cost' })
    expect(within(buildCost).getByText(before.economics.buildCostText)).toBeInTheDocument()

    // Step-5 lever move: raise ambition, widen the budget — Home must track it.
    const moved = { ...DEFAULT_SLIDERS, amb: 5, budget: 900000 }
    act(() => {
      setDemoSliders(moved)
    })

    const after = deriveRecomputeView(moved, OPPS)
    expect(after.economics.buildCostText).not.toBe(before.economics.buildCostText)
    expect(within(screen.getByRole('group', { name: 'One-time build cost' })).getByText(after.economics.buildCostText)).toBeInTheDocument()
    expect(
      within(screen.getByRole('group', { name: 'Recurring annual value' })).getByText(after.economics.annualValueText),
    ).toBeInTheDocument()
  })

  it('an explicit sliders prop still overrides the store (test hook preserved)', () => {
    const pinned = { ...DEFAULT_SLIDERS }
    render(<HomePanels visibleKeys={['invest']} currentRoleKey="cro" onNavigate={noNavigate} sliders={pinned} />)

    const view = deriveRecomputeView(pinned, OPPS)
    act(() => {
      setDemoSliders({ ...DEFAULT_SLIDERS, amb: 5 })
    })
    expect(
      within(screen.getByRole('group', { name: 'One-time build cost' })).getByText(view.economics.buildCostText),
    ).toBeInTheDocument()
  })
})
