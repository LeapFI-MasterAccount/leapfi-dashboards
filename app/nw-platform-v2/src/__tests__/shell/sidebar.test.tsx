/**
 * Shell regression — Sidebar (C3): top-level items + nested expand/collapse.
 *
 * D17: every test pins ported v1 base behavior, cited to base-page line
 * anchors (leapfi-platform.html @1c230fe via survey_map.md):
 *  - L762–821  sidebar: Home, Reporting; OnSide (nested), Studio (Ask /
 *              Investment Design / Roadmaps), Connect/AllRailz/Vantage,
 *              Settings; footer "v 1.071".
 *  - parity_ia_addendum.md §0: OnSide carries 4 nested children with
 *    Overview FIRST, matching the base engine's own `os-sub` ordering
 *    (survey_map.md 762–821).
 *  - survey_map.md §(b) Nav model: no routing/history — nav is a plain
 *    state switch; sidebar nesting toggles are the base's own L2 gesture.
 *
 * D18: no test here touches Home's "Start the demo" affordance.
 *
 * DISPATCH ADDITION — sidebar dark-lock (decisions.md D21; Sidebar.tsx
 * header "SIDEBAR DARK-LOCK"): D21 ratified the topbar's constant-dark-
 * chrome band "consistent with the already-dark sidebar" — a premise
 * Topbar.tsx's own D21 STOP-ITEM flagged as inaccurate against the code
 * as shipped (`Sidebar.tsx` read the global `--bg2` token, which flips to
 * Frost White in light mode). This describe block pins the closing fix:
 * Sidebar's own scoped dark-token override, same technique as
 * `TOPBAR_DARK_CHROME_CSS`.
 *
 * DISPATCH ADDITION — OnSide · Cases nested badge (USER RULING PI2-D43,
 * sprint-1.1 S1.1-04): pins AC-S1.1-04-1 through -7 — the new nested "Cases"
 * row, its `count`-Tag undecided-case badge (sourced from the ONE exported
 * `data/cases.ts` `isUntouched` predicate, never a second literal), the
 * zero-count-is-no-badge rule, live updates off the shell's existing
 * `useDemoStore()` subscription even while Cases is not the active screen,
 * the untouched seven-top-level tripwire, and A13 hidden-state compliance.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { Sidebar } from '../../components/Sidebar'
import { CASES, isUntouched, seedCases } from '../../data/cases'
import { DOCLIB } from '../../data/doclib'

describe('sidebar structure (base L762–821)', () => {
  // COUNT CHANGED BY DIRECTIVE (PI2-D39, settled): Connect's group dissolves
  // — Connect and Vantage each become their own flat, disabled, top-level
  // entry (no more Connect->Vantage nesting) — so the top-level count moves
  // from six to seven, still within the ≤7 budget design_system_spec.md
  // §3.1 states (at the limit, not over it). This is not a re-litigation of
  // that budget; PI2-D39 is the settled decision this test now pins.
  //
  // COUNT CHANGED AGAIN BY DIRECTIVE (L9, PI-3 sprint plan call-14;
  // `implementation/DECISIONS.md` D3, settled): TPRM gets "a genuinely new
  // top-level Sidebar entry," moving the count from seven to eight — a
  // sanctioned deviation from §3.1's ≤7 budget, the same kind of settled,
  // recorded tripwire change PI2-D39 itself made to this exact budget
  // (six to seven) for Connect/Vantage. This test now pins EIGHT, per D3,
  // not a re-litigation of PI2-D39's own seven-item pin above.
  //
  // Accessible names below match via a leading-substring RegExp (not
  // `exact: false` — @testing-library/dom's `name` matcher only supports
  // substring matching through a RegExp/function matcher; a plain string
  // is always an exact-equality match regardless of `exact`) because a
  // disabled item's row also carries the "Coming Soon" Tag as part of the
  // same button's content, so its full accessible name is e.g. "Connect
  // Coming Soon" (see SidebarItem.tsx file header "COMING SOON MARKER").
  it('renders the eight top-level items and the "v 1.071" footer (PI2-D39: Connect/Vantage promoted to flat top-level entries; D3/L9: TPRM added as an 8th)', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    for (const label of ['Home', 'OnSide', 'TPRM', 'Studio', 'Connect', 'Vantage', 'Reporting', 'Settings']) {
      expect(within(nav).getByRole('button', { name: new RegExp(`^${label}`) })).toBeInTheDocument()
    }
    // Count what RENDERS, not what NAV declares: exactly 8 top-level rows,
    // never 7 or 9 — SidebarItem marks every top-level row `data-level="top"`.
    const topLevelButtons = nav.querySelectorAll('[data-lf-composite="sidebar-item"][data-level="top"]')
    expect(topLevelButtons).toHaveLength(8)
    // Footer version string, verbatim from the base sidebar footer (L762–821).
    expect(within(nav).getByText('v 1.071')).toBeInTheDocument()
  })

  it('boots with Home as the current item (base boot lands on #mod-home, L858–881 / §(b))', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  })

  it('AllRailz is absent from the sidebar navigation', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).queryByRole('button', { name: 'AllRailz' })).not.toBeInTheDocument()
  })
})

describe('Connect and Vantage: disabled, top-level, "Coming Soon" (PI2-D39, settled user decision)', () => {
  it('Connect and Vantage are flat top-level rows — no group, no nested list, no chevron', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const connect = within(nav).getByRole('button', { name: /^Connect/ })
    const vantage = within(nav).getByRole('button', { name: /^Vantage/ })
    // A group header carries aria-expanded; a flat leaf item never does.
    expect(connect).not.toHaveAttribute('aria-expanded')
    expect(vantage).not.toHaveAttribute('aria-expanded')
    expect(within(nav).queryByRole('list', { name: 'Connect sections' })).not.toBeInTheDocument()
    expect(within(nav).queryByRole('button', { name: 'Connect sections' })).not.toBeInTheDocument()
  })

  it('both rows are truly disabled — native disabled control, not merely styled to look inactive', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const connect = within(nav).getByRole('button', { name: /^Connect/ })
    const vantage = within(nav).getByRole('button', { name: /^Vantage/ })

    // toBeDisabled() (jest-dom) checks the real HTML `disabled` state.
    expect(connect).toBeDisabled()
    expect(vantage).toBeDisabled()

    // Not reachable by keyboard as an actionable control: per the HTML
    // living standard a disabled form control is not a focusable area —
    // `.focus()` on it is a no-op, so it can never become
    // `document.activeElement` via Tab or any other keyboard path.
    // (Not asserted via `.tabIndex`: jsdom does not compute that IDL
    // attribute's disabled-element special case per spec, an
    // environment gap, not a claim about this component.)
    connect.focus()
    expect(document.activeElement).not.toBe(connect)
    vantage.focus()
    expect(document.activeElement).not.toBe(vantage)
  })

  it('both rows are marked "Coming Soon" — visible, perceivable text, not a color-only cue', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const connect = within(nav).getByRole('button', { name: /^Connect/ })
    const vantage = within(nav).getByRole('button', { name: /^Vantage/ })
    expect(within(connect).getByText('Coming Soon')).toBeInTheDocument()
    expect(within(vantage).getByText('Coming Soon')).toBeInTheDocument()
  })

  it('clicking either row does not navigate — the sidebar stays on Home, no double-submit-style stale reachability', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const connect = within(nav).getByRole('button', { name: /^Connect/ })
    const vantage = within(nav).getByRole('button', { name: /^Vantage/ })

    expect(within(screen.getByRole('banner')).getByText('Home')).toBeInTheDocument()
    await user.click(connect)
    expect(within(screen.getByRole('banner')).getByText('Home')).toBeInTheDocument()
    await user.click(vantage)
    expect(within(screen.getByRole('banner')).getByText('Home')).toBeInTheDocument()
    // Still current: Home never lost aria-current to a disabled press.
    expect(within(nav).getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('OnSide nested default-expanded (PI2-D33: OnSide is defaultExpanded:true; header stays, children stay nested, no top-level promotion)', () => {
  it('OnSide renders already expanded on initial load — aria-expanded=true and all 4 children present with Overview first, with no click required (PI2-D33)', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const onSide = within(nav).getByRole('button', { name: 'OnSide' })

    expect(onSide).toHaveAttribute('aria-expanded', 'true')

    const nested = within(nav).getByRole('list', { name: 'OnSide sections' })
    const childLabels = within(nested)
      .getAllByRole('button')
      .map((b) => b.textContent?.trim())
    // Base `os-sub` ordering, overview first (survey_map.md 762–821 / addendum
    // §0). USER RULING PI2-D43 (S1.1-04): a 5th nested child, "Cases", now
    // follows "Ownership" — its accessible text is "Cases" plus its badge
    // digits (SidebarItem's own count-Tag render, no separating space in the
    // DOM), so this pins the label prefix rather than an exact "Cases"
    // string; the badge's own value is pinned by the dedicated describe
    // block below.
    expect(childLabels.slice(0, 4)).toEqual(['Overview', 'Regulatory feed', 'Documents', 'Ownership'])
    expect(childLabels).toHaveLength(5)
    expect(childLabels[4]).toMatch(/^Cases/)
  })

  it('Studio and Settings remain collapsed by default (PI2-D33: only OnSide flips) — their children are absent until pressed', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })

    expect(within(nav).getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav).queryByRole('button', { name: 'Ask' })).not.toBeInTheDocument()

    expect(within(nav).getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav).queryByRole('button', { name: 'Toggles' })).not.toBeInTheDocument()
  })

  it('pressing OnSide collapses the already-open group, and pressing again re-expands it (base sidebar nesting toggle, §(b) L2 gesture)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const onSide = within(nav).getByRole('button', { name: 'OnSide' })

    // Already expanded on load (PI2-D33) — first press collapses it.
    await user.click(onSide)
    expect(onSide).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav).queryByRole('button', { name: 'Regulatory feed' })).not.toBeInTheDocument()

    await user.click(onSide)
    expect(onSide).toHaveAttribute('aria-expanded', 'true')
    expect(within(nav).getByRole('button', { name: 'Regulatory feed' })).toBeInTheDocument()
  })

  it('a nested child navigates to its screen and becomes the current item, with no click needed to open the already-expanded group (base onsideShow nav, §(b); breadcrumb per topbar L823–854)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })

    await user.click(within(nav).getByRole('button', { name: 'Regulatory feed' }))

    // New screen's topbar breadcrumb reflects the destination.
    const banner = screen.getByRole('banner')
    expect(within(banner).getByText('OnSide · Regulatory feed')).toBeInTheDocument()

    // The active nested item carries aria-current="page" — and its group
    // stays expanded while it is active (the audience can always see
    // "where am I", the base's own on-screen anchor rule).
    const newNav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(newNav).getByRole('button', { name: 'Regulatory feed' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('group toggle while a child is active (SH-11; base toggleOnsideNav @3834 / toggleStudioNav @1778: `classList.toggle(\'open\')` with no active-row guard)', () => {
  it('pressing the group header visibly collapses the group even while it owns the active screen, and re-expands on the next press', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: 'Primary' })

    // OnSide is already expanded on load (PI2-D33) — no click needed to open it.
    await user.click(within(nav()).getByRole('button', { name: 'Regulatory feed' }))
    const onSide = within(nav()).getByRole('button', { name: 'OnSide' })
    expect(onSide).toHaveAttribute('aria-expanded', 'true')

    // Base-faithful: the toggle works while the group owns the active
    // screen — aria-expanded flips and the children leave the DOM (no
    // inert-yet-enabled toggle).
    await user.click(onSide)
    expect(onSide).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav()).queryByRole('button', { name: 'Regulatory feed' })).not.toBeInTheDocument()

    // And the next press re-expands, with the active row still current.
    await user.click(onSide)
    expect(onSide).toHaveAttribute('aria-expanded', 'true')
    expect(within(nav()).getByRole('button', { name: 'Regulatory feed' })).toHaveAttribute('aria-current', 'page')
  })

  // RESOLVED (A11, design_system_spec.md §3.0 — Sprint-1 hostile-review E1
  // finding, ruled BEHAVIOUR-IS-WRONG, not a narrowed claim): Sidebar (C3)
  // and Topbar (C4) now mount exactly once, in App's persistent Shell —
  // App.tsx's `renderActiveScreen()` returns each screen's CONTENT only;
  // no screen module owns, imports, or remounts its own copy of Sidebar or
  // Topbar (grep `<Sidebar` / `<Topbar` across `src/screens/*.tsx` — zero
  // matches; both are rendered exactly once, in `App.tsx`). One long-lived
  // `Sidebar` instance now backs the whole session, so `overrides` (its
  // manual collapse/expand state) survives every navigation — cross-screen,
  // cross-group, or between two children of the very same group — exactly
  // matching this file's own header claim once more. The three tests below
  // replace the prior "resets on cross-screen nav" pin, which had pinned
  // the per-screen-remount defect A11 fixed as if it were correct/expected
  // behavior. Every assertion below is against a value that genuinely
  // DIVERGES from the group's own default-expand state, so a silent reset
  // back to default could never be mistaken for real persistence.
  it('a manual collapse of an ACTIVE, default-expanded group (OnSide) survives a real cross-screen navigation to an unrelated screen (Home)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: 'Primary' })

    // OnSide is already expanded on load (PI2-D33) — land on Regulatory
    // feed, then collapse the group while it owns the active screen
    // (allowed, per the test above) — an explicit override, false,
    // diverging from OnSide's own default (true).
    await user.click(within(nav()).getByRole('button', { name: 'Regulatory feed' }))
    await user.click(within(nav()).getByRole('button', { name: 'OnSide' }))
    expect(within(nav()).getByRole('button', { name: 'OnSide' })).toHaveAttribute('aria-expanded', 'false')

    // Navigate to Home — unrelated to the OnSide group, so nothing here
    // should force the group back open on arrival (only navigating INTO
    // the group does that; §3.0 "What this does not decide").
    await user.click(within(nav()).getByRole('button', { name: 'Home' }))
    expect(within(screen.getByRole('banner')).getByText('Home')).toBeInTheDocument()

    // The manual collapse survives — still false, not back to the true
    // default a fresh Sidebar mount would have shown.
    expect(within(nav()).getByRole('button', { name: 'OnSide' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('a manual expand of a default-COLLAPSED group (Studio) survives a real cross-screen navigation to an unrelated screen (Reporting)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: 'Primary' })

    // Studio ships collapsed by default (PI2-D33 Q2 = NO). One press is an
    // explicit override, true, diverging from Studio's own default (false).
    const studio = within(nav()).getByRole('button', { name: 'Studio' })
    expect(studio).toHaveAttribute('aria-expanded', 'false')
    await user.click(studio)
    expect(within(nav()).getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-expanded', 'true')

    // Navigate to Reporting — unrelated to Studio.
    await user.click(within(nav()).getByRole('button', { name: 'Reporting' }))
    expect(within(screen.getByRole('banner')).getByText('Reporting')).toBeInTheDocument()

    // The manual expand survives — still true, not back to the false
    // default a fresh Sidebar mount would have shown.
    expect(within(nav()).getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('a manual override on one group (Studio) survives navigating between two DIFFERENT children of ANOTHER group (OnSide) — A11\'s own emphasized case: those hops fully remounted Sidebar pre-fix, since each screen is a distinct top-level React component, not a re-render of one', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: 'Primary' })

    // Manually expand Studio (unrelated to OnSide) — override true,
    // diverging from its own default (false).
    const studio = within(nav()).getByRole('button', { name: 'Studio' })
    await user.click(studio)
    expect(within(nav()).getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-expanded', 'true')

    // Hop between two different children of the OnSide group — OnSide's
    // own already-expanded children, unrelated to Studio's override.
    await user.click(within(nav()).getByRole('button', { name: 'Regulatory feed' }))
    expect(within(screen.getByRole('banner')).getByText('OnSide · Regulatory feed')).toBeInTheDocument()
    expect(within(nav()).getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-expanded', 'true')

    await user.click(within(nav()).getByRole('button', { name: 'Documents' }))
    expect(within(screen.getByRole('banner')).getByText('OnSide · Documents')).toBeInTheDocument()

    // Studio's manual expand survived both cross-screen hops.
    expect(within(nav()).getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('sidebar dark-lock (decisions.md D21; Sidebar.tsx header "SIDEBAR DARK-LOCK") — constant dark chrome in both themes', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  // jsdom does not perform CSS custom-property (`var()`) substitution when
  // computing `getComputedStyle()` — the same limitation Topbar.tsx's D21
  // suite already established empirically (see that file's "TESTED VIA
  // CSSOM" note). This suite reads the injected `<style>` sheet's parsed
  // CSSStyleRule objects directly instead of resolved computed colors.
  function sidebarChromeRules(): CSSStyleRule[] {
    const rules: CSSStyleRule[] = []
    document.querySelectorAll('style').forEach((styleEl) => {
      const sheet = styleEl.sheet
      if (!sheet) return
      Array.from(sheet.cssRules).forEach((rule) => {
        if (rule instanceof CSSStyleRule && rule.selectorText.includes('sidebar')) {
          rules.push(rule)
        }
      })
    })
    return rules
  }

  it('declares an unconditional (no [data-theme=...] gate) dark-value rule scoped to [data-lf-composite="sidebar"], with every value copied verbatim from tokens.css\'s dark block', () => {
    render(<App />)
    const forcingRule = sidebarChromeRules().find((r) => r.selectorText === "[data-lf-composite='sidebar']")
    if (!forcingRule) throw new Error('expected an unconditional [data-lf-composite="sidebar"] rule in the DOM')

    // Unconditional: no data-theme gate on this rule's own selector, so it
    // applies to the nav column regardless of the page theme.
    expect(forcingRule.selectorText).not.toContain('data-theme')

    // tokens.css `:root, [data-theme='dark']` core-palette values, verbatim
    // (same source block Topbar.tsx's TOPBAR_DARK_CHROME_CSS copies from).
    expect(forcingRule.style.getPropertyValue('--bg').trim()).toBe('#000000')
    expect(forcingRule.style.getPropertyValue('--bg2').trim()).toBe('#0d0d0d')
    expect(forcingRule.style.getPropertyValue('--panel').trim()).toBe('#0d1525')
    expect(forcingRule.style.getPropertyValue('--border').trim()).toBe('#1e2d3d')
    expect(forcingRule.style.getPropertyValue('--ink').trim()).toBe('#ffffff')
    expect(forcingRule.style.getPropertyValue('--ink2').trim()).toBe('#9ba0a6')
    expect(forcingRule.style.getPropertyValue('--ink3').trim()).toBe('#7b8794')
    expect(forcingRule.style.getPropertyValue('--accent').trim()).toBe('#00f2ff')
    expect(forcingRule.style.getPropertyValue('--accent2').trim()).toBe('#2d5bff')
    expect(forcingRule.style.getPropertyValue('--focus-ring').trim()).toBe(
      '0 0 0 2px #000000, 0 0 0 4px #00f2ff, 0 0 12px 2px rgba(0, 242, 255, 0.65)',
    )
    expect(forcingRule.style.getPropertyValue('--focus-ring-outline').trim()).toBe('2px solid #00f2ff')
  })

  it('the dark-forcing rule is present with identical declarations regardless of the page data-theme attribute (absent, light, or dark) — pins dark-lock CONSTANCY across themes', () => {
    render(<App />)
    const ruleTextAt = () =>
      sidebarChromeRules().find((r) => r.selectorText === "[data-lf-composite='sidebar']")?.cssText

    document.documentElement.removeAttribute('data-theme')
    const textWhenAbsent = ruleTextAt()
    expect(textWhenAbsent).toBeTruthy()

    document.documentElement.setAttribute('data-theme', 'light')
    expect(ruleTextAt()).toBe(textWhenAbsent)

    document.documentElement.setAttribute('data-theme', 'dark')
    expect(ruleTextAt()).toBe(textWhenAbsent)
  })

  it('the nav column and its footer still read the shared var(--x) tokens (not hardcoded hex), so the scoped override stays the single source of truth with tokens.css', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav.style.background).toContain('var(--bg2)')
    expect(nav.style.borderRight).toContain('var(--border)')

    const footerVersion = within(nav).getByText('v 1.071')
    expect(footerVersion.style.color).toContain('var(--ink3)')
  })

  it('the active item, hover surface, and focus ring stay wired to var(--accent)/var(--panel)/var(--focus-ring) — same dark-theme pairing brand_doctrine.md approves (Cyan/Black ≈12.6:1; White/Black 21:1) — in EVERY theme, never the light-theme Deep Teal/Frost-White pairing lightmode_amendment_proposal.md swaps in for page content', async () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const home = within(nav).getByRole('button', { name: 'Home' })

    // Home boots current: aria-current + accent border-left + accent ink,
    // all still token-driven (var(--accent)), never inlined as a literal
    // hex — the SIDEBAR_DARK_CHROME_CSS rule above is what pins --accent
    // to the dark-mode Cyan value constantly, this assertion pins that the
    // component-level styling never stopped delegating to that token.
    expect(home).toHaveAttribute('aria-current', 'page')
    expect(home.style.color).toContain('var(--accent)')
    expect(home.style.borderLeft).toContain('var(--accent)')

    document.documentElement.setAttribute('data-theme', 'light')
    const homeInLight = within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('button', {
      name: 'Home',
    })
    expect(homeInLight.style.color).toContain('var(--accent)')
    expect(homeInLight.style.borderLeft).toContain('var(--accent)')

    // Focus ring: still the shared var(--focus-ring) token (forced to the
    // dark cyan-glow value by the scoped override), in light mode too —
    // fireEvent.focus (not userEvent.tab, which would first have to walk
    // past Topbar's own focusable controls) targets the sidebar row
    // directly and still exercises SidebarItem's real onFocus handler.
    fireEvent.focus(homeInLight)
    expect(homeInLight.style.boxShadow).toContain('var(--focus-ring)')
  })
})

describe('Board Deck sidebar exemption survives the persistent Shell (A11, design_system_spec.md §3.0/§5.7: "not a Sidebar item... deliberately renders no Sidebar")', () => {
  it('renders Topbar but no Sidebar on Board Deck, and the Sidebar reappears on navigating back to a Sidebar-bearing screen', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Home: Sidebar present.
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()

    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Open board deck' }))

    // Board Deck: Topbar (the Shell's persistent chrome) still renders,
    // Sidebar does not — App.tsx's `showSidebar` gate, not a screen-owned
    // decision (BoardDeck.tsx itself no longer renders either composite).
    expect(within(screen.getByRole('banner')).getByText('Board deck')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()

    // Navigating away from Board Deck (the logo Home control) restores it.
    await user.click(screen.getByRole('button', { name: 'LeapFI — Home' }))
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })
})

describe('BoardDeck exemption — mount semantics (amendment A13, design_system_spec.md §3.0 addendum / §2.2 C3 `hidden`): the persistent Sidebar instance HIDES for a Board Deck visit, it never unmounts', () => {
  // The falsifiable test the amendment itself names (§3.0 addendum): a
  // manual override made BEFORE a Board Deck visit must survive the round
  // trip unchanged, because the same long-lived Sidebar instance (and its
  // `overrides` state) persists through `hidden`, rather than being
  // destroyed and replaced by a fresh instance (`overrides={}`) the way the
  // pre-fix `showSidebar` ternary did. This is the COMPOSED scenario the
  // pre-existing suite never exercised: the cross-screen-override tests
  // above and the Board-Deck-exemption test above were two separate,
  // never-composed `describe` blocks — the coverage gap that let the A13
  // defect ship (confirmed reproduced, cold-verifier pin `c510cd0`).
  it('a manual COLLAPSE of a default-EXPANDED group (OnSide) survives a Board Deck round trip — aria-expanded stays "false", not reset to the group default', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: 'Primary' })

    // OnSide ships expanded by default (PI2-D33) — collapse it: a manual
    // override, false, diverging from the group's own default (true).
    await user.click(within(nav()).getByRole('button', { name: 'OnSide' }))
    expect(within(nav()).getByRole('button', { name: 'OnSide' })).toHaveAttribute('aria-expanded', 'false')

    // Navigate to Board Deck via the Topbar control (the exemption path).
    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Open board deck' }))
    expect(within(screen.getByRole('banner')).getByText('Board deck')).toBeInTheDocument()
    // Exemption still holds while on Board Deck: no Primary nav landmark
    // reachable — unaffected by hide replacing unmount (§3.0 addendum).
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()

    // Navigate back to a Sidebar-bearing screen (the logo Home control).
    await user.click(screen.getByRole('button', { name: 'LeapFI — Home' }))
    expect(within(screen.getByRole('banner')).getByText('Home')).toBeInTheDocument()

    // The override survives the round trip — still false, not reset to
    // OnSide's own `true` default the way a fresh (`overrides={}`) Sidebar
    // instance would show.
    expect(within(nav()).getByRole('button', { name: 'OnSide' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('a manual EXPAND of a default-COLLAPSED group (Studio) survives a Board Deck round trip — aria-expanded stays "true", not reset to the group default', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: 'Primary' })

    const studio = within(nav()).getByRole('button', { name: 'Studio' })
    expect(studio).toHaveAttribute('aria-expanded', 'false')
    await user.click(studio)
    expect(within(nav()).getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-expanded', 'true')

    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Open board deck' }))
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'LeapFI — Home' }))
    expect(within(nav()).getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('OnSide · Cases nested badge (USER RULING PI2-D43, q11-01 CLOSED YES; sprint-1.1 S1.1-04)', () => {
  beforeEach(() => {
    // Deterministic undecided count for every test in this block,
    // independent of any other file/test-level mutation: seedCases()
    // reseeds all 8 CASES fresh at stage 'analyst', edited:false,
    // history.length===1 — every seeded case is `isUntouched`, so the
    // known starting undecided count is 8.
    seedCases(DOCLIB)
  })

  it('AC-S1.1-04-1 — a 5th nested "Cases" row follows "Ownership" and navigates to the existing `cases` screen via the same onNavigate(child.id) path every OnSide child already uses', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const nested = within(nav).getByRole('list', { name: 'OnSide sections' })
    const casesRow = within(nested).getByRole('button', { name: /^Cases/ })
    expect(casesRow).toBeInTheDocument()

    await user.click(casesRow)
    const banner = screen.getByRole('banner')
    expect(within(banner).getByText(/Cases/)).toBeInTheDocument()
  })

  it('AC-S1.1-04-2 — Sidebar renders a count-variant Tag with the exact number when casesUndecidedCount > 0, and renders no count Tag at all when casesUndecidedCount is 0 (unit-level, direct Sidebar render)', () => {
    const { unmount } = render(<Sidebar activeId="home" onNavigate={() => {}} casesUndecidedCount={3} />)
    let nav = screen.getByRole('navigation', { name: 'Primary' })
    let nested = within(nav).getByRole('list', { name: 'OnSide sections' })
    let casesRow = within(nested).getByRole('button', { name: /^Cases/ })
    let badge = casesRow.querySelector('[data-lf-primitive="tag"][data-variant="count"]')
    expect(badge).not.toBeNull()
    expect(badge?.textContent).toBe('3')
    unmount()

    render(<Sidebar activeId="home" onNavigate={() => {}} casesUndecidedCount={0} />)
    nav = screen.getByRole('navigation', { name: 'Primary' })
    nested = within(nav).getByRole('list', { name: 'OnSide sections' })
    casesRow = within(nested).getByRole('button', { name: 'Cases' })
    badge = casesRow.querySelector('[data-lf-primitive="tag"][data-variant="count"]')
    expect(badge).toBeNull()
  })

  it('AC-S1.1-04-3 — the badge count equals CASES.filter(isUntouched).length, the identical value driving Cases.tsx\'s own header, via the ONE shared exported predicate', async () => {
    const user = userEvent.setup()
    // PI2-D45 (USER OVERRIDE): the 5 board/exec-tier cases now boot already
    // routed to 'cro' (not `isUntouched`); only the 3 proc-tier cases boot
    // `isUntouched` (undecided count 3, not 8). Diverge one of THOSE from
    // "untouched" (edited, still `analyst` stage) so `undecidedCount` (2)
    // differs from `openCases.length` (8) — Cases.tsx's header renders
    // literal "None have been decided yet." when the two are equal, which
    // this test must not be mistaken for.
    const firstCase = CASES.find((c) => c.tier === 'proc')
    if (!firstCase) throw new Error('expected at least one proc-tier seeded case')
    firstCase.edited = true
    const expectedCount = CASES.filter(isUntouched).length
    expect(expectedCount).toBe(2)

    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const nested = within(nav).getByRole('list', { name: 'OnSide sections' })
    const casesRow = within(nested).getByRole('button', { name: /^Cases/ })
    const badge = casesRow.querySelector('[data-lf-primitive="tag"][data-variant="count"]')
    expect(badge?.textContent).toBe(String(expectedCount))

    // Navigate to the Cases screen itself and read its own header-derived
    // count — same fixture data, same exported predicate, never two
    // independently-written literals that merely happen to match.
    await user.click(casesRow)
    expect(screen.getByText(new RegExp(`${expectedCount} of \\d+ have been decided yet`))).toBeInTheDocument()
  })

  it('AC-S1.1-04-4 — a case-stage-changing action lowers the badge even while Cases is not the active screen, without remounting Cases', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Switch persona to the analyst (Priya Raman) — only the case's owning
    // role can act on it (waitingOnRoleKey('analyst') === 'analyst').
    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Rachel Fischer' }))
    await user.click(screen.getByRole('menuitem', { name: /Priya Raman/ }))

    const nav = () => screen.getByRole('navigation', { name: 'Primary' })
    const nested = () => within(nav()).getByRole('list', { name: 'OnSide sections' })
    const casesRow = () => within(nested()).getByRole('button', { name: /^Cases/ })

    const startCount = CASES.filter(isUntouched).length
    expect(casesRow().querySelector('[data-lf-primitive="tag"][data-variant="count"]')?.textContent).toBe(String(startCount))

    await user.click(casesRow())
    // PI2-D45 (USER OVERRIDE): CASES[0] ('irp') now boots pre-routed to
    // 'cro' — the analyst persona can no longer accept it. Use a still-
    // `analyst`-stage (proc-tier) case so the accept action below is
    // reachable.
    const firstCase = CASES.find((c) => c.tier === 'proc')
    if (!firstCase) throw new Error('expected at least one proc-tier seeded case')
    const idCell = screen.getByText(firstCase.id)
    const row = idCell.closest('tr')
    if (!row) throw new Error('expected a table row for the seeded case')
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }))
    await user.click(screen.getByRole('button', { name: 'Accept & route for approval' }))

    // Cases.tsx's own pessimistic commit delay (ACTION_COMMIT_DELAY_MS,
    // 550ms) — wait for the real, server-truth-only state transition rather
    // than asserting on an optimistic intermediate render.
    await waitFor(() => expect(firstCase.stage).toBe('cro'), { timeout: 2000 })
    const newExpectedCount = CASES.filter(isUntouched).length
    expect(newExpectedCount).toBe(startCount - 1)

    // Navigate away from Cases to an unrelated screen before reading the
    // badge, proving the count is derived from the shell's own
    // already-subscribed render, not from a still-mounted Cases screen.
    await user.click(within(nav()).getByRole('button', { name: 'Home' }))
    expect(screen.queryByText(firstCase.id)).not.toBeInTheDocument() // Cases is unmounted

    expect(casesRow().querySelector('[data-lf-primitive="tag"][data-variant="count"]')?.textContent).toBe(String(newExpectedCount))
  })

  it('AC-S1.1-04-5 — the top-level-items tripwire (PI2-D39, now eight per D3/L9) is unaffected: the new "Cases" row renders data-level="nested", never counted by the top-level query', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const topLevelButtons = nav.querySelectorAll('[data-lf-composite="sidebar-item"][data-level="top"]')
    expect(topLevelButtons).toHaveLength(8)

    const nested = within(nav).getByRole('list', { name: 'OnSide sections' })
    const casesRow = within(nested).getByRole('button', { name: /^Cases/ })
    expect(casesRow).toHaveAttribute('data-level', 'nested')
  })

  it('AC-S1.1-04-6 — the badge and the "Cases" row are absent from the DOM when Sidebar\'s hidden prop is true (A13 Board Deck exemption), via the component\'s existing early return', () => {
    const { container } = render(<Sidebar activeId="home" onNavigate={() => {}} casesUndecidedCount={5} hidden />)
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Cases/ })).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })

  it('AC-S1.1-04-7 — reuse discipline: SidebarItem.tsx is unmodified by this task (its count prop/Tag render branch already existed) and no new TagVariant is introduced', async () => {
    // Static-file evidence for this AC is a `git diff`/grep check (no
    // SidebarItem.tsx diff, no new TagVariant member), reported in the
    // implementer's evidence return — not independently re-provable from
    // inside a render. This test instead pins the RUNTIME contract that
    // evidence rests on: the badge is rendered via `SidebarItem`'s existing,
    // generic `count` prop (the same `Tag` `variant="count"` primitive
    // every other count badge in this codebase already uses), not a
    // bespoke one-off element.
    render(<Sidebar activeId="home" onNavigate={() => {}} casesUndecidedCount={2} />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const nested = within(nav).getByRole('list', { name: 'OnSide sections' })
    const casesRow = within(nested).getByRole('button', { name: /^Cases/ })
    const badge = casesRow.querySelector('[data-lf-primitive="tag"]')
    expect(badge).toHaveAttribute('data-variant', 'count')
  })
})
