/**
 * Shell regression — fix-wave gate dispatch (SH-4 / RAIL-06 / STU-12):
 * Connect / AllRailz / Vantage route to the real §5.6 Soon-splash surface.
 *
 * Pins, per design_system_spec.md §5.6, demo_script_draft.md Step 6, and
 * the base page (leapfi-platform.html @ 1c230fe):
 *  - SH-4: a click on Connect · AllRailz / Connect · Vantage lands on the
 *    in-fiction module splash (base sidebar go('allrailz')/go('vantage'),
 *    source 814-815 → renderSoon 3780-3793 over the SOON records
 *    3735-3769) — NEVER on placeholder copy that narrates the build
 *    program ("the seven screens this build implements", "the Step 1
 *    full-sidebar gesture"). That copy must not exist anywhere in the
 *    rendered app.
 *  - RAIL-06: the Step 6 close ("then Connect's Soon splash") is
 *    reachable from surfaces the script directs — Roadmap's "What's
 *    next" SetupCards (§5.6's resolved primary CTA / Exit row).
 *  - STU-12: landing on a module's splash keeps the REMAINING locked
 *    modules visible beneath it (demo_script_draft.md Step 6 Do: "…with
 *    AllRailz and Vantage visible as the remaining locked modules beneath
 *    it"; See: "the platform visibly bigger than what was just demoed").
 *
 * ROUTE CHANGED BY DIRECTIVE (PI2-D39, settled user decision, Sidebar.tsx
 * file header "SUPERSEDED — PI2-D39"): Connect and Vantage are now
 * disabled top-level sidebar rows — clicking either does not navigate.
 * SH-4's and STU-12's "clicking Vantage in the sidebar" route is
 * therefore no longer reachable that way; both now reach the same
 * Vantage splash the same way RAIL-06 already reaches the Connect
 * splash — via Roadmap's own "What's next" Vantage SetupCard
 * (Roadmap.tsx `MODULE_ENTRIES`, `variant="interactive"`, untouched by
 * this dispatch) — never a new/invented path, the one other route this
 * screen already had. The splash content and sibling-locked-cards
 * assertions these tests pin are otherwise unchanged.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'

/** The shell Topbar (C4). Not `getByRole('banner')`: SoonSplash's own
 * `<header>` is ALSO computed as a banner by testing-library's role engine
 * once the splash is on screen, so the role query is ambiguous here. */
function topbar(): HTMLElement {
  const el = document.querySelector('[data-lf-composite="topbar"]')
  if (!(el instanceof HTMLElement)) throw new Error('Topbar not rendered')
  return el
}

/** Roadmap's "What's next" Vantage SetupCard — the route this suite now
 * uses to reach the Vantage splash (PI2-D39: the sidebar's Vantage row is
 * disabled and cannot navigate — see file header "ROUTE CHANGED BY
 * DIRECTIVE"). Mirrors RAIL-06's own Connect-card navigation below. */
async function goToVantageSplashViaRoadmap(user: ReturnType<typeof userEvent.setup>) {
  // Studio is collapsed by default (§3.1) — expand, then enter Roadmap.
  await user.click(screen.getByRole('button', { name: 'Studio' }))
  await user.click(screen.getByRole('button', { name: 'Roadmap' }))
  await user.click(screen.getByRole('button', { name: /LeapFI · Vantage/ }))
}

describe('SH-4 — Connect/Vantage route to the §5.6 Soon splash, not placeholder meta copy', () => {
  it('the Vantage SetupCard on Roadmap lands on the LeapFI · Vantage splash (base go("vantage") → renderSoon)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await goToVantageSplashViaRoadmap(user)

    // Breadcrumb comes from App.tsx's SCREEN_LABEL[screenId] map, keyed by
    // destination screen id, not by which surface navigated there — same
    // "Connect · Vantage" text the old sidebar-click route also produced.
    expect(within(topbar()).getByText('Connect · Vantage')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'LeapFI · Vantage' })).toBeInTheDocument()
    // SOON.vantage.tag, base 3735-3769 verbatim (data/misc.ts).
    expect(screen.getByText('Agentic third-party oversight')).toBeInTheDocument()
  })

  it('renders no build-program meta copy anywhere (the deleted OutOfScopeScreen text)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await goToVantageSplashViaRoadmap(user)
    expect(screen.queryByText(/seven screens this build implements/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/nothing is wired here/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/full-sidebar gesture/i)).not.toBeInTheDocument()
  })
})

describe('STU-12 — the remaining locked modules stay visible beneath the open splash (script Step 6 Do/See)', () => {
  it('the Vantage splash shows Connect and AllRailz as locked cards beneath it', async () => {
    const user = userEvent.setup()
    render(<App />)
    await goToVantageSplashViaRoadmap(user)

    const siblings = screen.getByRole('region', { name: 'More of the platform' })
    expect(within(siblings).getByText('LeapFI · Connect')).toBeInTheDocument()
    expect(within(siblings).getByText('LeapFI · AllRailz')).toBeInTheDocument()
    // Locked preview, nothing to action yet (§5.6 "Primary CTA: none") —
    // sibling cards are the non-button `locked` SetupCard variant.
    expect(within(siblings).queryAllByRole('button')).toHaveLength(0)
  })
})

describe("RAIL-06 / §5.6 Exit — Roadmap's What's-next Connect card leads to the Connect splash", () => {
  it('pressing the Connect SetupCard on Roadmap lands on the Connect splash with AllRailz and Vantage beneath it', async () => {
    const user = userEvent.setup()
    render(<App />)
    // Studio is collapsed by default (§3.1) — expand, then enter Roadmap.
    await user.click(screen.getByRole('button', { name: 'Studio' }))
    await user.click(screen.getByRole('button', { name: 'Roadmap' }))
    await user.click(screen.getByRole('button', { name: /LeapFI · Connect/ }))

    expect(within(topbar()).getByText('Connect')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'LeapFI · Connect' })).toBeInTheDocument()
    // SOON.connect.tag, base 3735-3769 verbatim.
    expect(screen.getByText('The MCP and API layer of LeapFI · OnSide')).toBeInTheDocument()
    // Step 6 Do line, verbatim requirement: "with AllRailz and Vantage
    // visible as the remaining locked modules beneath it."
    const siblings = screen.getByRole('region', { name: 'More of the platform' })
    expect(within(siblings).getByText('LeapFI · AllRailz')).toBeInTheDocument()
    expect(within(siblings).getByText('LeapFI · Vantage')).toBeInTheDocument()
  })
})
