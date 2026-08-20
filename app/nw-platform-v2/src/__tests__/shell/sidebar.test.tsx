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
 */
import { afterEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'

describe('sidebar structure (base L762–821)', () => {
  it('renders the six top-level items and the "v 1.071" footer (base L762–821)', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    for (const label of ['Home', 'OnSide', 'Studio', 'Connect', 'Reporting', 'Settings']) {
      expect(within(nav).getByRole('button', { name: label })).toBeInTheDocument()
    }
    // Footer version string, verbatim from the base sidebar footer (L762–821).
    expect(within(nav).getByText('v 1.071')).toBeInTheDocument()
  })

  it('boots with Home as the current item (base boot lands on #mod-home, L858–881 / §(b))', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
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
    // Base `os-sub` ordering, overview first (survey_map.md 762–821 / addendum §0).
    expect(childLabels).toEqual(['Overview', 'Regulatory feed', 'Documents', 'Ownership'])
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

  // FINDING (surfaced by PI2-D33, pre-existing and out of this dispatch's
  // scope — see r07 evidence return spec_questions): every screen module
  // (`Home`, `OnSideFeed`, ...) mounts its OWN `<Sidebar>` instance
  // (App.tsx `renderActiveScreen`'s per-case `<Home .../>` /
  // `<OnSideFeed .../>` etc., each importing and rendering `Sidebar`
  // itself — grep `<Sidebar` across `src/screens/*.tsx`). React unmounts
  // the outgoing screen (and its `Sidebar`) and mounts a fresh one on
  // every CROSS-SCREEN navigation, so `overrides` (Sidebar.tsx's manual
  // collapse/expand state, module-local `useState`) never survives a
  // real navigation between screens — it always resets to `{}`, and the
  // group's expand state falls back to `childActive || defaultExpanded`
  // on arrival. Before PI2-D33, OnSide's old `defaultExpanded: false`
  // made that reset LOOK like override persistence by coincidence (both
  // landed on `false`); flipping OnSide to `true` breaks that coincidence
  // and shows the override never actually survived cross-screen
  // navigation. The render-phase "clear stale override" block this test
  // targets only fires when the SAME Sidebar instance sees two different
  // `activeId` values, which cross-screen navigation never allows — verified
  // empirically (see r07 evidence return). This test is corrected to pin
  // that verified reality; whether cross-screen collapse-state persistence
  // is desired product behavior is a design/scope question, not decided here.
  it('navigating away and back resets the group to its default-expand state — the collapse override does not survive a real cross-screen navigation (Sidebar remounts per screen; see FINDING above)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: 'Primary' })

    // OnSide is already expanded on load (PI2-D33) — land on Regulatory
    // feed, then collapse the group while it is active (allowed, per the
    // test above).
    await user.click(within(nav()).getByRole('button', { name: 'Regulatory feed' }))
    await user.click(within(nav()).getByRole('button', { name: 'OnSide' }))
    expect(within(nav()).getByRole('button', { name: 'OnSide' })).toHaveAttribute('aria-expanded', 'false')

    // Leave for Home: a DIFFERENT screen module, which mounts its own
    // fresh Sidebar — the collapse override does not travel with it, so
    // the group reverts to its default-expand state (true, PI2-D33).
    await user.click(within(nav()).getByRole('button', { name: 'Home' }))
    expect(within(nav()).getByRole('button', { name: 'OnSide' })).toHaveAttribute('aria-expanded', 'true')

    // Navigate back INTO the group from outside the sidebar — Home's D18
    // primary CTA deep-links to OnSide · Regulatory feed. The destination
    // is reached with the group already expanded (its default), and the
    // current row is visible on arrival either way.
    await user.click(screen.getByRole('button', { name: "Open today's regulatory feed" }))
    const onSide = within(nav()).getByRole('button', { name: 'OnSide' })
    expect(onSide).toHaveAttribute('aria-expanded', 'true')
    expect(within(nav()).getByRole('button', { name: 'Regulatory feed' })).toHaveAttribute('aria-current', 'page')
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
