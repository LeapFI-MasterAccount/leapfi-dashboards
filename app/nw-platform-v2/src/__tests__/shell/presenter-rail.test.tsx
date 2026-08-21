/**
 * Shell regression — PresenterRail (C21) + script deep-link table.
 *
 * D18 (LANDED — presenter_entry_redesign.md): Home's "Start the demo"
 * primary button is struck; the rail is driven exclusively through its
 * keyboard path (Ctrl+Alt+Shift+P / Ctrl+Alt+Shift+←/→ — the §3.2-amended
 * state-machine chords, matched on `event.code`) and its own
 * Prev/Next/Restart buttons. Entry-mechanism regressions (chord rebind,
 * macOS composition, editable guard, ?present=1 pre-stage, occlusion
 * compensation) live in `presenter-entry-d18.test.tsx`.
 *
 * ANCHOR NOTE (D17): the rail itself is a v2 presenter surface
 * (design_system_spec.md §4 / demo_script_draft.md §1–§3) with no base-page
 * widget; what IS ported base behavior — and what these tests pin to base
 * lines — is the navigation the rail's step targets resolve onto:
 *  - source 3794–3844  `go(mod)` router (go:home)
 *  - survey_map.md §(b) Nav model  `studioShow()` ask/design/roadmap,
 *    `onsideShow(v)` feed/docs, `boardDeck()` (source 2393–2448)
 *  - demo_script_draft.md §1/§3  the 7-step CEO script and its per-step
 *    targets (SCRIPT data model; presenter standing rules).
 *
 * HR-ARC-01 (hostile-review fix wave): `data/script.ts`'s `DEFAULT_SCRIPT_KEY`
 * now selects `SCRIPT_EXAMINER` (DECISIONS.md D16-D24 — the ratified,
 * sign-off arc) — the live `<App/>` rail this file mounts therefore shows
 * the 3-beat examiner arc, not the 7-step CEO script. `SCRIPT_CEO` stays
 * fully in the `SCRIPTS` registry (swap rule 1) and is pinned here as a pure
 * data/`resolveTarget` contract, decoupled from which script `<App/>` ships
 * live — the sections below that mount `<App/>` and exercise the rail
 * through the real DOM now walk `SCRIPT_EXAMINER`'s 3 steps.
 * `examiner-script-walk.test.tsx` covers the examiner script's own
 * click-path fidelity in depth; this file's job is the shell-level "the
 * REAL `<App/>` rail shows the 3-step arc" proof plus the generic
 * Prev/Next/Restart/chord mechanics, script-agnostic.
 */
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { DEFAULT_SCRIPT_KEY, SCRIPT_CEO, SCRIPT_EXAMINER, resolveTarget } from '../../data/script'

/** demo_script_draft.md §1/§3 CEO step -> ported base nav destination (go/studioShow/onsideShow/boardDeck). Pure data/resolveTarget contract — SCRIPT_CEO stays in the SCRIPTS registry (swap rule 1) even though it is no longer the live `<App/>` rail's active script (HR-ARC-01). */
const STEP_SCREEN_TABLE: ReadonlyArray<[target: string, screenId: string, breadcrumb: string]> = [
  ['go:home', 'home', 'Home'],
  ['onside:feed', 'onside.feed', 'OnSide · Regulatory feed'],
  ['onside:docs', 'onside.documents', 'OnSide · Documents'],
  ['studio:ask', 'studio.ask', 'Studio · Ask'],
  ['studio:design', 'studio.investment-design', 'Studio · Investment Design'],
  ['studio:roadmap', 'studio.roadmap', 'Studio · Roadmap'],
  ['deck:board', 'board-deck', 'Board deck'],
]

/** DECISIONS.md D16-D24: the finalized 3-beat examiner arc, now the live `<App/>` rail's active script (HR-ARC-01) -> the real screens each step's target resolves onto. */
const EXAMINER_STEP_SCREEN_TABLE: ReadonlyArray<[target: string, screenId: string, breadcrumb: string]> = [
  ['onside:overview', 'onside.overview', 'OnSide · Overview'],
  ['onside:case:CASE-2026-001', 'cases', 'Cases'],
  ['onside:dom-tprm', 'onside.documents', 'OnSide · Documents'],
]

function railRegion(): HTMLElement {
  return screen.getByRole('region', { name: 'Presenter rail' })
}

function toggleRail(): void {
  // D18 chord: Ctrl+Alt+Shift+P, matched on `event.code` (RAIL-03/SH-3).
  fireEvent.keyDown(window, { key: 'P', code: 'KeyP', ctrlKey: true, altKey: true, shiftKey: true })
}

function breadcrumbBanner(): HTMLElement {
  return screen.getByRole('banner')
}

describe('script data + target resolution (demo_script_draft.md §1/§3; base go() router 3794–3844)', () => {
  it('ships exactly 7 steps whose targets are the §1 step table\'s, in order', () => {
    expect(SCRIPT_CEO.length).toBe(7)
    expect(SCRIPT_CEO.map((s) => s.target)).toEqual(STEP_SCREEN_TABLE.map(([target]) => target))
  })

  it('resolves every step target onto the ported base nav destination (go/studioShow/onsideShow/boardDeck, §(b) Nav model)', () => {
    for (const [target, screenId] of STEP_SCREEN_TABLE) {
      expect(resolveTarget(target), `resolveTarget(${target})`).toBe(screenId)
    }
  })

  it('routes onside deep-link tokens to the screens base onsideShow routes them to (RAIL-10; base 3021–3046: src: → sources under the feed, case: → Cases, dom- → the §5.3 Documents landing)', () => {
    expect(resolveTarget('onside:src:ffiec')).toBe('onside.feed')
    expect(resolveTarget('onside:case:CASE-2026-001')).toBe('cases')
    expect(resolveTarget('onside:dom-mrm')).toBe('onside.documents')
  })

  it('D16: the TPRM demo-arc close-beat target onside:dom-tprm resolves via the RAIL-10 dom- rule to onside.documents, not a fabricated placeholder', () => {
    expect(resolveTarget('onside:dom-tprm')).toBe('onside.documents')
  })

  it('D17: onside:overview resolves to the already-shipped onside.overview screen (one additive RAIL-10-style branch)', () => {
    expect(resolveTarget('onside:overview')).toBe('onside.overview')
  })

  it('D17 addition leaves every other resolveTarget branch unaffected', () => {
    for (const [target, screenId] of STEP_SCREEN_TABLE) {
      expect(resolveTarget(target), `resolveTarget(${target})`).toBe(screenId)
    }
    expect(resolveTarget('onside:src:ffiec')).toBe('onside.feed')
    expect(resolveTarget('onside:case:CASE-2026-001')).toBe('cases')
    expect(resolveTarget('onside:dom-mrm')).toBe('onside.documents')
    expect(resolveTarget('go:onside')).toBeNull()
    expect(resolveTarget('studio:register')).toBeNull()
    expect(resolveTarget('onside:unknownview')).toBeNull()
  })

  it("step 5's rail title carries the trademark (RAIL-07; demo_script_draft.md §1 line 37 / §2 line 163, brand_doctrine.md line 59)", () => {
    expect(SCRIPT_CEO[4]?.title).toBe('Out of Pilot Purgatory™')
  })
})

describe('HR-ARC-01 — the REAL <App/> rail runs the 3-step examiner arc, not the 7-step CEO script', () => {
  it('DEFAULT_SCRIPT_KEY selects "examiner" — SCRIPT_CEO stays registered but is not the active script', () => {
    expect(DEFAULT_SCRIPT_KEY).toBe('examiner')
  })

  it('revealing the rail on a freshly-mounted <App/> shows STEP 1 OF 3 — the examiner arc\'s own step 1 title and target, live', () => {
    render(<App />)
    toggleRail()
    const rail = railRegion()
    expect(within(rail).getByText('STEP 1 OF 3')).toBeInTheDocument()
    expect(within(rail).getByText(SCRIPT_EXAMINER[0]!.title)).toBeInTheDocument()
    expect(within(breadcrumbBanner()).getByText('OnSide · Overview')).toBeInTheDocument()
  })

  it('Next walks steps 2..3 of the examiner arc, each step landing on its real screen; Next is disabled at the terminal step 3 of 3', async () => {
    const user = userEvent.setup()
    render(<App />)
    toggleRail()

    for (let step = 2; step <= 3; step++) {
      const row = EXAMINER_STEP_SCREEN_TABLE[step - 1] as [string, string, string]
      await user.click(within(railRegion()).getByRole('button', { name: 'Next' }))
      expect(within(railRegion()).getByText(`STEP ${step} OF 3`)).toBeInTheDocument()
      expect(within(breadcrumbBanner()).getByText(row[2]), `step ${step} -> ${row[2]}`).toBeInTheDocument()
    }

    expect(within(railRegion()).getByRole('button', { name: 'Next' })).toBeDisabled()
  })
})

describe('rail visibility via keyboard (design spec §4 chord, D18-rebound to Ctrl+Alt+Shift+P — never via a Home button)', () => {
  it('Ctrl+Alt+Shift+P shows the rail at step 1 of 3 (the active examiner arc, HR-ARC-01) and toggles it away again (hidden = removed from the DOM)', () => {
    render(<App />)
    expect(screen.queryByRole('region', { name: 'Presenter rail' })).not.toBeInTheDocument()

    toggleRail()
    const rail = railRegion()
    expect(within(rail).getByText('STEP 1 OF 3')).toBeInTheDocument()

    toggleRail()
    expect(screen.queryByRole('region', { name: 'Presenter rail' })).not.toBeInTheDocument()
  })

  it('renders the T6.7-amended standing-rule tags and their binding caption (SH-2 class: no dead Alt+Shift+R chord claim; RAIL-08: no stale #eff/G7 tag; D18 §5.3: ?present=1 address-bar rule)', () => {
    render(<App />)
    toggleRail()
    const rail = railRegion()
    expect(within(rail).getByText('Standing rules')).toBeInTheDocument()
    expect(within(rail).getByText('Pre-stage: Restart resets the demo')).toBeInTheDocument()
    expect(within(rail).getByText('Citations are fabricated — characterize only')).toBeInTheDocument()
    expect(within(rail).getByText('Present fullscreen — ?present=1 shows in the address bar')).toBeInTheDocument()
    expect(within(rail).getByText('Bind every step of this script.')).toBeInTheDocument()
    // RAIL-08: the G7 prohibition was conditional on a defect InvestmentDesign
    // fixed (eff seeded 70, label derived) — the rail must not assert it.
    expect(within(rail).queryByText('Never touch #eff (G7 defect)')).not.toBeInTheDocument()
    // SH-2/RAIL-02 class: no rail copy may advertise the unwired chord.
    expect(within(rail).queryByText(/Alt\+Shift\+R/)).not.toBeInTheDocument()
  })
})

describe('step -> screen deep-link table (examiner arc, DECISIONS.md D16-D24; HR-ARC-01: the live <App/> rail\'s active script)', () => {
  it('Next walks steps 2..3, each step activating its target screen; Next is disabled at the terminal step', async () => {
    const user = userEvent.setup()
    render(<App />)
    toggleRail()

    for (let step = 2; step <= 3; step++) {
      const row = EXAMINER_STEP_SCREEN_TABLE[step - 1] as [string, string, string]
      await user.click(within(railRegion()).getByRole('button', { name: 'Next' }))
      expect(within(railRegion()).getByText(`STEP ${step} OF 3`)).toBeInTheDocument()
      expect(within(breadcrumbBanner()).getByText(row[2]), `step ${step} -> ${row[2]}`).toBeInTheDocument()
    }

    expect(within(railRegion()).getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('Prev is disabled on step 1; from a later step Prev re-resolves the previous step\'s target directly (never the back chip)', async () => {
    const user = userEvent.setup()
    render(<App />)
    toggleRail()

    expect(within(railRegion()).getByRole('button', { name: 'Prev' })).toBeDisabled()

    await user.click(within(railRegion()).getByRole('button', { name: 'Next' })) // step 2 — Cases
    await user.click(within(railRegion()).getByRole('button', { name: 'Next' })) // step 3 — Documents
    expect(within(breadcrumbBanner()).getByText('OnSide · Documents')).toBeInTheDocument()

    await user.click(within(railRegion()).getByRole('button', { name: 'Prev' }))
    expect(within(railRegion()).getByText('STEP 2 OF 3')).toBeInTheDocument()
    expect(within(breadcrumbBanner()).getByText('Cases')).toBeInTheDocument()
  })

  it('Ctrl+Alt+Shift+ArrowRight/ArrowLeft advance and retreat, announcing the step via the aria-live status region (spec §4 chords, D18-rebound)', () => {
    render(<App />)
    toggleRail()

    fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true, altKey: true, shiftKey: true })
    const rail = railRegion()
    expect(within(rail).getByText('STEP 2 OF 3')).toBeInTheDocument()
    expect(within(rail).getByRole('status')).toHaveTextContent(`Step 2 of 3: ${SCRIPT_EXAMINER[1]!.title}`)
    expect(within(breadcrumbBanner()).getByText('Cases')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowLeft', code: 'ArrowLeft', ctrlKey: true, altKey: true, shiftKey: true })
    expect(within(railRegion()).getByText('STEP 1 OF 3')).toBeInTheDocument()
    expect(within(breadcrumbBanner()).getByText('OnSide · Overview')).toBeInTheDocument()
  })
})

describe('Restart (design spec §4 Restarting -> Visible[step=1]; HR-ARC-02: rail AND screen both return to step 1)', () => {
  it('Restart from a later step returns to step 1, re-navigates the SCREEN to step 1\'s own target (OnSide · Overview, not Home), and keeps the rail visible', async () => {
    const user = userEvent.setup()
    render(<App />)
    toggleRail()

    await user.click(within(railRegion()).getByRole('button', { name: 'Next' }))
    await user.click(within(railRegion()).getByRole('button', { name: 'Next' }))
    expect(within(railRegion()).getByText('STEP 3 OF 3')).toBeInTheDocument()
    expect(within(breadcrumbBanner()).getByText('OnSide · Documents')).toBeInTheDocument()

    await user.click(within(railRegion()).getByRole('button', { name: 'Restart' }))

    const rail = railRegion() // still mounted — Restarting never transitions to Hidden (§4)
    expect(within(rail).getByText('STEP 1 OF 3')).toBeInTheDocument()
    expect(within(rail).getByRole('status')).toHaveTextContent(`Restarted — step 1 of 3: ${SCRIPT_EXAMINER[0]!.title}`)
    // HR-ARC-02: this is the discriminating assertion — step 1's target is
    // `onside:overview`, NOT `go:home`. Before the fix, App.tsx's
    // `handleRestart` hardcoded `navigateToScreen('home')` and PresenterRail's
    // own `handleRestart` never re-ran step 1's `onNavigate`, so the
    // breadcrumb stayed "Home" here — a live rail-vs-screen contradiction.
    expect(within(breadcrumbBanner()).getByText('OnSide · Overview')).toBeInTheDocument()
    expect(within(breadcrumbBanner()).queryByText('Home')).not.toBeInTheDocument()
  })
})

describe('HR-ARC-03 — revealing the rail via the chord alone (no ?present=1 pre-stage) yields a coherent state', () => {
  it('a raw chord reveal while sitting on a screen other than step 1\'s target navigates to the current step\'s target — rail caption and screen never disagree', async () => {
    const user = userEvent.setup()
    render(<App />)
    // Navigate away from Home (and from the examiner arc's step-1 target)
    // via an ordinary sidebar click — no ?present=1, no prior rail use this
    // session, simulating a reload that lost the querystring / a second
    // window / any state where the chord is the ONLY entry mechanism.
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    await user.click(within(nav).getByRole('button', { name: 'Reporting' }))
    expect(within(breadcrumbBanner()).getByText('Reporting')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Presenter rail' })).not.toBeInTheDocument()

    toggleRail()
    const rail = railRegion()
    expect(within(rail).getByText('STEP 1 OF 3')).toBeInTheDocument()
    // Before the fix this stayed "Reporting" — caption said step 1, screen
    // disagreed. The fix re-runs step 1's own navigation on every reveal.
    expect(within(breadcrumbBanner()).getByText('OnSide · Overview')).toBeInTheDocument()
    expect(within(breadcrumbBanner()).queryByText('Reporting')).not.toBeInTheDocument()
  })
})
