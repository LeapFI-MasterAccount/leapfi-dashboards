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

  // STOP-ITEM (kept correct-to-dispatch, marked failing — D17: never bend
  // the assertion to the code): the dispatch pins "announces via aria-live",
  // but the shipped toggle (Switch P8 rendered in Topbar's themeToggleSlot,
  // App.tsx line ~381) announces only via role="switch"/aria-checked plus an
  // aria-hidden "On/Off" text — NO aria-live region anywhere in the shell
  // carries a theme-change announcement. Deviation, not a test defect.
  it.fails('STOP-ITEM: theme change is announced via an aria-live region (dispatch pin — current code has no such region)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('switch', { name: 'Light theme' }))

    const liveRegions = Array.from(document.querySelectorAll('[aria-live]'))
    const announcesTheme = liveRegions.some((region) => /theme|light|dark/i.test(region.textContent ?? ''))
    expect(announcesTheme).toBe(true)
  })
})
