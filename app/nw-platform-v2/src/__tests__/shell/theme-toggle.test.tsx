/**
 * Shell regression — theme toggle (Topbar `themeToggleSlot`, App theme state).
 *
 * ANCHOR NOTE (D17): the base page is single-theme dark (survey_map.md §(a)
 * intro: "a dark-themed ... Platform"); light mode is the v2 program's own
 * lightmode_amendment_proposal.md surface, so no base line anchor exists
 * for the toggle itself. Pinned per the shell dispatch brief instead:
 * "theme toggle light<->dark flips data-theme and announces via aria-live".
 * The data-theme mechanism is the ported D13 scaffold logic App.tsx hosts
 * verbatim (App.tsx header "THEME TOGGLE").
 *
 * D18: no test here touches Home's "Start the demo" affordance.
 *
 * SPRINT 1 HOSTILE-REVIEW CORRECTION (S2, findings B2/B3 — Topbar.tsx:835):
 * the shell dispatch brief's "announces via aria-live" instruction was
 * satisfied by a custom live region coupled to the theme VALUE rather than
 * a change event — it mounted already populated with "Theme changed to
 * {theme} mode" on first render (announcing a change that never happened)
 * and duplicated the native `role="switch"`/`aria-checked` state-change
 * announcement Switch (P8) already provides with different wording. Per
 * the finding's own disposition ("the native control's own announcement is
 * generally preferred"), the custom region is removed outright — the
 * native switch state change (pinned above, "toggling flips data-theme...
 * switch state tracking it") IS this dispatch brief's "announces via
 * aria-live" requirement now: `role="switch"` + `aria-checked` is itself an
 * ARIA live-state mechanism assistive tech announces on change, without a
 * second, separately-worded `aria-live` region duplicating it. The final
 * `it` below (previously pinning the removed custom region) is replaced by
 * the negative assertion that it no longer exists — see topbar.test.tsx's
 * "theme live region — Sprint 1 hostile-review findings S2" block for the
 * full B2/B3 coverage at the Topbar-component level.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('theme toggle (dispatch pin; scaffold port per App.tsx "THEME TOGGLE")', () => {
  it('boots dark: data-theme="dark" and the Light theme switch reads unchecked', () => {
    render(<App />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(screen.getByRole('switch', { name: 'Light theme' })).toHaveAttribute('aria-checked', 'false')
  })

  it('toggling flips data-theme dark -> light -> dark, switch state tracking it', async () => {
    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getByRole('switch', { name: 'Light theme' })

    await user.click(toggle)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(screen.getByRole('switch', { name: 'Light theme' })).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('switch', { name: 'Light theme' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(screen.getByRole('switch', { name: 'Light theme' })).toHaveAttribute('aria-checked', 'false')
  })

  it('persists the chosen theme across a full remount (getInitialTheme localStorage port)', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await user.click(screen.getByRole('switch', { name: 'Light theme' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    first.unmount()

    render(<App />)
    expect(screen.getByRole('switch', { name: 'Light theme' })).toHaveAttribute('aria-checked', 'true')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('B2/B3: booting the app does NOT falsely announce a theme change — no "theme changed" claim exists before anything has changed', () => {
    render(<App />)
    const falseClaims = Array.from(document.querySelectorAll('[aria-live]')).filter((region) =>
      /theme changed/i.test(region.textContent ?? ''),
    )
    expect(falseClaims).toHaveLength(0)
  })

  it('B3: toggling the theme produces exactly ONE state-change signal — the native switch\'s aria-checked flip — never a second, differently-worded custom live-region announcement', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('switch', { name: 'Light theme' }))

    // The native mechanism (already pinned above: aria-checked flips
    // true/false) is the sole authoritative announcement. No separate
    // "Theme changed to ... mode" live region duplicates it.
    const duplicateAnnouncements = Array.from(document.querySelectorAll('[aria-live]')).filter((region) =>
      /theme/i.test(region.textContent ?? ''),
    )
    expect(duplicateAnnouncements).toHaveLength(0)
  })
})
