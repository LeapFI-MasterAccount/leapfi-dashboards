/**
 * Shell regression — PresenterRail (C21) + script deep-link table.
 *
 * D18 (KNOWN FLUX): Home's "Start the demo" primary button is being
 * redesigned — NO test here presses it. The rail is driven exclusively
 * through its keyboard path (Alt+Shift+P / Alt+Shift+←/→, design spec §4's
 * own state-machine triggers) and its own Prev/Next/Restart buttons.
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
 */
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { SCRIPT_CEO, resolveTarget } from '../../data/script'

/** demo_script_draft.md §1/§3 step -> ported base nav destination (go/studioShow/onsideShow/boardDeck). */
const STEP_SCREEN_TABLE: ReadonlyArray<[target: string, screenId: string, breadcrumb: string]> = [
  ['go:home', 'home', 'Home'],
  ['onside:feed', 'onside.feed', 'OnSide · Regulatory feed'],
  ['onside:docs', 'onside.documents', 'OnSide · Documents'],
  ['studio:ask', 'studio.ask', 'Studio · Ask'],
  ['studio:design', 'studio.investment-design', 'Studio · Investment Design'],
  ['studio:roadmap', 'studio.roadmap', 'Studio · Roadmap'],
  ['deck:board', 'board-deck', 'Board deck'],
]

function railRegion(): HTMLElement {
  return screen.getByRole('region', { name: 'Presenter rail' })
}

function toggleRail(): void {
  fireEvent.keyDown(window, { key: 'P', altKey: true, shiftKey: true })
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
})

describe('rail visibility via keyboard (design spec §4 Alt+Shift+P — D18: never via the Home button)', () => {
  it('Alt+Shift+P shows the rail at step 1 of 7 and toggles it away again (hidden = removed from the DOM)', () => {
    render(<App />)
    expect(screen.queryByRole('region', { name: 'Presenter rail' })).not.toBeInTheDocument()

    toggleRail()
    const rail = railRegion()
    expect(within(rail).getByText('STEP 1 OF 7')).toBeInTheDocument()

    toggleRail()
    expect(screen.queryByRole('region', { name: 'Presenter rail' })).not.toBeInTheDocument()
  })

  it('renders the three presenter standing-rule tags and their binding caption (demo_script_draft.md "Presenter standing rules (bind every step)")', () => {
    render(<App />)
    toggleRail()
    const rail = railRegion()
    expect(within(rail).getByText('Standing rules')).toBeInTheDocument()
    expect(within(rail).getByText('Pre-staged (Alt+Shift+R)')).toBeInTheDocument()
    expect(within(rail).getByText('Citations are fabricated — characterize only')).toBeInTheDocument()
    expect(within(rail).getByText('Never touch #eff (G7 defect)')).toBeInTheDocument()
    expect(within(rail).getByText('Bind every step of this script.')).toBeInTheDocument()
  })
})

describe('step -> screen deep-link table (demo_script_draft.md §1 targets onto base nav, 3794–3844 / §(b))', () => {
  it('Next walks steps 2..7, each step activating its target screen; Next is disabled at the terminal step', async () => {
    const user = userEvent.setup()
    render(<App />)
    toggleRail()

    for (let step = 2; step <= 7; step++) {
      const row = STEP_SCREEN_TABLE[step - 1] as [string, string, string]
      await user.click(within(railRegion()).getByRole('button', { name: 'Next' }))
      expect(within(railRegion()).getByText(`STEP ${step} OF 7`)).toBeInTheDocument()
      expect(within(breadcrumbBanner()).getByText(row[2]), `step ${step} -> ${row[2]}`).toBeInTheDocument()
    }

    expect(within(railRegion()).getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('Prev is disabled on step 1; from a later step Prev re-resolves the previous step\'s target directly (never the back chip)', async () => {
    const user = userEvent.setup()
    render(<App />)
    toggleRail()

    expect(within(railRegion()).getByRole('button', { name: 'Prev' })).toBeDisabled()

    await user.click(within(railRegion()).getByRole('button', { name: 'Next' })) // step 2 — feed
    await user.click(within(railRegion()).getByRole('button', { name: 'Next' })) // step 3 — documents
    expect(within(breadcrumbBanner()).getByText('OnSide · Documents')).toBeInTheDocument()

    await user.click(within(railRegion()).getByRole('button', { name: 'Prev' }))
    expect(within(railRegion()).getByText('STEP 2 OF 7')).toBeInTheDocument()
    expect(within(breadcrumbBanner()).getByText('OnSide · Regulatory feed')).toBeInTheDocument()
  })

  it('Alt+Shift+ArrowRight/ArrowLeft advance and retreat, announcing the step via the aria-live status region (spec §4 chords)', () => {
    render(<App />)
    toggleRail()

    fireEvent.keyDown(window, { key: 'ArrowRight', altKey: true, shiftKey: true })
    const rail = railRegion()
    expect(within(rail).getByText('STEP 2 OF 7')).toBeInTheDocument()
    expect(within(rail).getByRole('status')).toHaveTextContent('Step 2 of 7: The treadmill')
    expect(within(breadcrumbBanner()).getByText('OnSide · Regulatory feed')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowLeft', altKey: true, shiftKey: true })
    expect(within(railRegion()).getByText('STEP 1 OF 7')).toBeInTheDocument()
    expect(within(breadcrumbBanner()).getByText('Home')).toBeInTheDocument()
  })
})

describe('Restart (design spec §4 Restarting -> Visible[step=1]; shell resetDemo navigates home)', () => {
  it('Restart from a later step returns to step 1, lands on Home, and keeps the rail visible', async () => {
    const user = userEvent.setup()
    render(<App />)
    toggleRail()

    await user.click(within(railRegion()).getByRole('button', { name: 'Next' }))
    await user.click(within(railRegion()).getByRole('button', { name: 'Next' }))
    expect(within(railRegion()).getByText('STEP 3 OF 7')).toBeInTheDocument()

    await user.click(within(railRegion()).getByRole('button', { name: 'Restart' }))

    const rail = railRegion() // still mounted — Restarting never transitions to Hidden (§4)
    expect(within(rail).getByText('STEP 1 OF 7')).toBeInTheDocument()
    expect(within(rail).getByRole('status')).toHaveTextContent('Restarted — step 1 of 7: Day one')
    expect(within(breadcrumbBanner()).getByText('Home')).toBeInTheDocument()
  })
})
