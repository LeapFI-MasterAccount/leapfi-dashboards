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
 *  - B3 (SEAM 1): every describe block above renders `<HomePanels>` with no
 *    `onDeepLink` prop and pins the plain `onNavigate(screen)` fallback —
 *    that is deliberate base-anchor coverage of the "caller has not wired
 *    `onDeepLink`" path (`HomePanels.tsx`'s own `fireOrDeepLink` helper),
 *    left unchanged by this dispatch. The "B3 SEAM 1" describe block below
 *    is the new coverage: the SAME actions, this time with `onDeepLink`
 *    wired, asserting the real `{screen, kind, id}` payload each one fires
 *    (base `onsideShow('dom-'+d.key)`/`sigTouch`/`openPlay`/`openReport`/
 *    `goOnside('feed-lifecycle')`, sources cited per action below).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePanels } from '../../views/HomePanels'
import { DEFAULT_SLIDERS, setDemoSliders } from '../../state/demoStore'
import { deriveRecomputeView } from '../../engine/plan'
import { OPPS } from '../../data/studio'
import { CASES, seedCases } from '../../data/cases'
import { DOCLIB } from '../../data/doclib'

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

describe('Strategic signal drawer touch chips + lifecycle link (B-07, base openSignal 4049-4056/4111)', () => {
  it('renders one nav action per "would touch" item plus "Open the full lifecycle →", each routed to the right screen', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<HomePanels visibleKeys={['legis']} currentRoleKey="cro" onNavigate={onNavigate} />)

    // SIGNAL[1] (Reg O NPRM): touch = [['dom','capital'],['dom','fairlend'],['doc','capital-narr']].
    const row = screen.getByText('Fed & FDIC joint NPRM · Regulation O · insider credit').closest('tr')
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Review' }))

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Capital register' }))
    expect(onNavigate).toHaveBeenCalledWith('onside.overview')

    onNavigate.mockClear()
    await user.click(within(dialog).getByRole('button', { name: 'Capital Narrative · CBLR' }))
    expect(onNavigate).toHaveBeenCalledWith('onside.documents')

    onNavigate.mockClear()
    await user.click(within(dialog).getByRole('button', { name: 'Open the full lifecycle →' }))
    expect(onNavigate).toHaveBeenCalledWith('onside.feed')
  })
})

describe('Home panel-header go-links (B-08, base .panel-h .go2 868/869/872/878)', () => {
  it('Risk posture header link navigates to onside.overview', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<HomePanels visibleKeys={['posture']} currentRoleKey="cro" onNavigate={onNavigate} />)
    await user.click(screen.getByRole('button', { name: 'Gaps & levers →' }))
    expect(onNavigate).toHaveBeenCalledWith('onside.overview')
  })

  it('Strategic signal header link navigates to onside.feed', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<HomePanels visibleKeys={['legis']} currentRoleKey="cro" onNavigate={onNavigate} />)
    await user.click(screen.getByRole('button', { name: 'Full lifecycle →' }))
    expect(onNavigate).toHaveBeenCalledWith('onside.feed')
  })

  it('Investment and return header carries both "Work the levers →" and "Platform ROI →"', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<HomePanels visibleKeys={['invest']} currentRoleKey="cro" onNavigate={onNavigate} />)

    await user.click(screen.getByRole('button', { name: 'Work the levers →' }))
    expect(onNavigate).toHaveBeenCalledWith('studio.investment-design')

    onNavigate.mockClear()
    await user.click(screen.getByRole('button', { name: 'Platform ROI →' }))
    expect(onNavigate).toHaveBeenCalledWith('reporting')
  })

  it('Your queue header link navigates to onside.documents', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<HomePanels visibleKeys={['queue']} currentRoleKey="cro" onNavigate={onNavigate} />)
    await user.click(screen.getByRole('button', { name: 'All open items →' }))
    expect(onNavigate).toHaveBeenCalledWith('onside.documents')
  })

  it('Quick actions carries no header go-link (base has none for this row)', () => {
    render(<HomePanels visibleKeys={['qa']} currentRoleKey="cro" onNavigate={noNavigate} />)
    expect(screen.queryByRole('button', { name: /→$/ })).not.toBeInTheDocument()
  })
})

describe('Investment panel top-play list (B-08, base lrow top=P.funded...slice(0,4), 4249-region)', () => {
  it('lists the four largest funded plays by annual value, each with an Open → action to Investment Design', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<HomePanels visibleKeys={['invest']} currentRoleKey="cro" onNavigate={onNavigate} />)

    const view = deriveRecomputeView({ ...DEFAULT_SLIDERS }, OPPS)
    const topFunded = [...view.plan.funded].sort((a, b) => b.val - a.val).slice(0, 4)
    expect(topFunded.length).toBeGreaterThan(0)

    const firstPlay = topFunded[0]
    expect(firstPlay).toBeDefined()
    expect(screen.getByText(firstPlay!.n)).toBeInTheDocument()

    // The whole row is the clickable target (base `lrow` behavior, source
    // 4249-region: `<div class="list-row lrc" onclick="...">`), so its
    // accessible name is the row's full text ending in "Open →".
    const openButtons = screen.getAllByRole('button', { name: /Open →$/ })
    expect(openButtons).toHaveLength(topFunded.length)
    await user.click(openButtons[0] as HTMLElement)
    expect(onNavigate).toHaveBeenCalledWith('studio.investment-design')
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

describe('B3 SEAM 1 — onDeepLink threaded from Home.tsx (App.tsx NAV-PAYLOAD contract, header 120-188)', () => {
  it('PostureBand row "Open →" fires the exact domain (base onsideShow(\'dom-\'+d.key), source 4217)', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onDeepLink = vi.fn()
    render(<HomePanels visibleKeys={['posture']} currentRoleKey="cro" onNavigate={onNavigate} onDeepLink={onDeepLink} />)

    const row = screen.getByText('Model Risk Management').closest('tr')
    expect(row).not.toBeNull()
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Open →' }))

    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'mrm' })
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('Strategic signal touch actions fire domain/document kinds (hostile-review fix wave A1: doc-redline retired, re-pointed onto \'document\' — App.tsx KIND VOCABULARY, amendment A9/A12), and "Open the full lifecycle →" fires a section deep link', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onDeepLink = vi.fn()
    render(<HomePanels visibleKeys={['legis']} currentRoleKey="cro" onNavigate={onNavigate} onDeepLink={onDeepLink} />)

    // SIGNAL[1] (Reg O NPRM): touch = [['dom','capital'],['dom','fairlend'],['doc','capital-narr']].
    const row = screen.getByText('Fed & FDIC joint NPRM · Regulation O · insider credit').closest('tr')
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Review' }))
    const dialog = screen.getByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: 'Capital register' }))
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'capital' })

    onDeepLink.mockClear()
    await user.click(within(dialog).getByRole('button', { name: 'Capital Narrative · CBLR' }))
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.documents', kind: 'document', id: 'capital-narr' })

    onDeepLink.mockClear()
    await user.click(within(dialog).getByRole('button', { name: 'Open the full lifecycle →' }))
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.feed', kind: 'section', id: 'lifecycle' })

    // Never falls back to plain nav once onDeepLink is wired.
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('Strategic signal touch actions fire the obligation kind with the domKey:oblId id encoding', async () => {
    const user = userEvent.setup()
    const onDeepLink = vi.fn()
    render(<HomePanels visibleKeys={['legis']} currentRoleKey="cro" onNavigate={noNavigate} onDeepLink={onDeepLink} />)

    // SIGNAL[0]: [['obl','mrm','MRM-11'],['obl','mrm','MRM-01'],['obl','mrm','MRM-09'],...].
    const row = screen.getByText('Interagency RFI 2026-04 · generative & agentic AI in model risk').closest('tr')
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Review' }))
    const dialog = screen.getByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: 'MRM-11' }))
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'obligation', id: 'mrm:MRM-11' })
  })

  it('Investment panel top-play "Open →" fires the exact play (base openPlay(o.n), source 4249-region) — Investment Design already consumes this kind end to end', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onDeepLink = vi.fn()
    render(<HomePanels visibleKeys={['invest']} currentRoleKey="cro" onNavigate={onNavigate} onDeepLink={onDeepLink} />)

    const view = deriveRecomputeView({ ...DEFAULT_SLIDERS }, OPPS)
    const topFunded = [...view.plan.funded].sort((a, b) => b.val - a.val).slice(0, 4)
    const firstPlay = topFunded[0]
    expect(firstPlay).toBeDefined()

    const openButtons = screen.getAllByRole('button', { name: /Open →$/ })
    await user.click(openButtons[0] as HTMLElement)

    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'studio.investment-design', kind: 'play', id: firstPlay!.n })
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('"Platform ROI →" fires the report kind (base openReport(\'roi\'), source 872) — Reporting.tsx already consumes this kind end to end', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onDeepLink = vi.fn()
    render(<HomePanels visibleKeys={['invest']} currentRoleKey="cro" onNavigate={onNavigate} onDeepLink={onDeepLink} />)

    await user.click(screen.getByRole('button', { name: 'Platform ROI →' }))
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'reporting', kind: 'report', id: 'roi' })

    // "Work the levers →" carries no per-item id in the KIND VOCABULARY — stays plain nav even with onDeepLink wired.
    onDeepLink.mockClear()
    await user.click(screen.getByRole('button', { name: 'Work the levers →' }))
    expect(onDeepLink).not.toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalledWith('studio.investment-design')
  })

  it('"Gaps & levers →" and "All open items →" stay plain onNavigate even with onDeepLink wired (no matching per-item id / deliberate STOP-item — see file header)', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onDeepLink = vi.fn()
    render(<HomePanels visibleKeys={['posture', 'queue']} currentRoleKey="cro" onNavigate={onNavigate} onDeepLink={onDeepLink} />)

    await user.click(screen.getByRole('button', { name: 'Gaps & levers →' }))
    expect(onNavigate).toHaveBeenCalledWith('onside.overview')

    onNavigate.mockClear()
    await user.click(screen.getByRole('button', { name: 'All open items →' }))
    expect(onNavigate).toHaveBeenCalledWith('onside.documents')

    expect(onDeepLink).not.toHaveBeenCalled()
  })
})

describe("PI2-D5 — 'Your queue' q-cases row fires a 'case'-kind deep link (App.tsx KIND VOCABULARY; the pre-existing plain onNavigate('cases') dropped the specific case id despite the row's own subtitle naming it — buildQueueBucket's own `onOpenCase` prop-shape note flagged this exact gap)", () => {
  beforeEach(() => {
    CASES.length = 0
    seedCases(DOCLIB) // every seeded case starts at stage 'analyst' — CASE-2026-001 is myCases[0] for both the analyst and cro branches below
  })

  afterEach(() => {
    CASES.length = 0
  })

  it("the analyst 'Your queue' row fires {screen:'cases', kind:'case', id: myCases[0].id}, never plain nav", async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onDeepLink = vi.fn()
    render(<HomePanels visibleKeys={['queue']} currentRoleKey="analyst" onNavigate={onNavigate} onDeepLink={onDeepLink} />)

    expect(screen.getByText(`Oldest: ${CASES[0]!.title}`)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open' }))

    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'cases', kind: 'case', id: CASES[0]!.id })
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it("the analyst 'Your queue' row still falls back to plain onNavigate('cases') when onDeepLink is not wired (never a dead click)", async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<HomePanels visibleKeys={['queue']} currentRoleKey="analyst" onNavigate={onNavigate} />)

    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(onNavigate).toHaveBeenCalledWith('cases')
  })

  it("the CRO 'Your queue' row fires the same 'case'-kind deep link once a case reaches the cro stage", async () => {
    const user = userEvent.setup()
    const onDeepLink = vi.fn()
    const c = CASES.find((x) => x.id === 'CASE-2026-001')!
    c.stage = 'cro'
    render(<HomePanels visibleKeys={['queue']} currentRoleKey="cro" onNavigate={vi.fn()} onDeepLink={onDeepLink} />)

    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'cases', kind: 'case', id: 'CASE-2026-001' })
  })
})
