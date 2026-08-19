/**
 * Shell regression — D18 presenter-entry redesign + rail_d18 fix wave.
 *
 * Pins, per presenter_entry_redesign.md and the T6.7 rail_d18 findings:
 *  - D18 §1: Home's primary CTA is product-native ("Open today's
 *    regulatory feed" → onside.feed, script step 2's own `do` action);
 *    "Start the demo" is struck.
 *  - D18 §2.2 / RAIL-03 / SH-3: reveal chord is Ctrl+Alt+Shift+P matched
 *    on `event.code` — it must fire even when macOS composes
 *    Option+Shift+P into `event.key === '∏'`, and the old two-modifier
 *    Alt+Shift+P must NOT fire (it sits inside Windows' documented
 *    input-language-switch chord family).
 *  - D18 §2.3: `?present=1` at boot pre-stages the rail (Hidden →
 *    Visible[step=1]) with no live keypress.
 *  - D18 §3.4: toggling off UNMOUNTS the rail (null render), never dims it.
 *  - RAIL-05: chords are ignored when the keydown target is an editable
 *    surface (input/textarea/contenteditable) — on macOS,
 *    Option+Shift+Arrow is word-selection; a rail chord must never
 *    navigate steps out from under a presenter editing text.
 *  - RAIL-01/RAIL-09: while visible the rail publishes its height as
 *    `--lf-presenter-rail-h` and injects inset rules for every
 *    `[data-lf-screen]` root and the shared `[data-lf-composite="drawer"]`
 *    so drawer footers (step 3's Adopt/Reject) and scroll bottoms are
 *    never occluded or click-blocked; hiding the rail cleans both up.
 *  - SH-10: index.html stamps the stored theme pre-paint via an inline
 *    head script (jsdom never executes index.html, so this is pinned as a
 *    file-content contract).
 */
import { afterEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
// `?raw` (vite/client, handled natively by Vitest): the SH-10 pin is a
// file-content contract — jsdom never executes index.html's inline script.
import indexHtml from '../../../index.html?raw'
import App from '../../App'

function pressRevealChord(overrides: Partial<KeyboardEventInit> = {}): void {
  fireEvent.keyDown(window, { key: 'P', code: 'KeyP', ctrlKey: true, altKey: true, shiftKey: true, ...overrides })
}

function railQuery(): HTMLElement | null {
  return screen.queryByRole('region', { name: 'Presenter rail' })
}

afterEach(() => {
  window.history.replaceState(null, '', '/')
})

describe("D18 §1 — Home's product-native primary CTA (presenter_entry_redesign.md §1; supersedes design_system_spec.md §6 Home row)", () => {
  it('renders "Open today\'s regulatory feed" as the primary CTA and no "Start the demo" button anywhere', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: "Open today's regulatory feed" })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start the demo' })).not.toBeInTheDocument()
  })

  it('the CTA navigates to OnSide · Regulatory feed (script step 2\'s own `do` destination) without revealing the rail', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: "Open today's regulatory feed" }))
    expect(within(screen.getByRole('banner')).getByText('OnSide · Regulatory feed')).toBeInTheDocument()
    expect(railQuery()).not.toBeInTheDocument()
  })
})

describe('D18 §2.2 / RAIL-03 / SH-3 — chord rebind, matched on event.code', () => {
  it('fires on macOS character composition: Ctrl+Alt+Shift with key "∏" but code "KeyP" toggles the rail both ways', () => {
    render(<App />)
    expect(railQuery()).not.toBeInTheDocument()

    pressRevealChord({ key: '∏' }) // macOS Option+Shift+P composed character
    expect(railQuery()).toBeInTheDocument()

    pressRevealChord({ key: '∏' })
    // D18 §3.4: hiding fully unmounts the rail's DOM node — never dims it.
    expect(railQuery()).not.toBeInTheDocument()
  })

  it('does NOT fire on the struck two-modifier Alt+Shift+P chord (the Windows input-language-switch family D18 rebinds away from)', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: 'P', code: 'KeyP', altKey: true, shiftKey: true })
    expect(railQuery()).not.toBeInTheDocument()
  })
})

describe('D18 §2.3 — ?present=1 boot pre-stage', () => {
  it('boots with the rail already Visible[step=1] when ?present=1 is in the URL, with no keypress', () => {
    window.history.replaceState(null, '', '/?present=1')
    render(<App />)
    const rail = railQuery()
    expect(rail).toBeInTheDocument()
    expect(within(rail as HTMLElement).getByText('STEP 1 OF 7')).toBeInTheDocument()
  })

  it('stays Hidden at boot when the querystring is absent', () => {
    render(<App />)
    expect(railQuery()).not.toBeInTheDocument()
  })
})

describe('RAIL-05 — editable-element guard on every rail chord', () => {
  it('ignores chords whose keydown target is an input or contenteditable surface, for toggle and step navigation alike', () => {
    render(<App />)
    pressRevealChord()
    expect(within(railQuery() as HTMLElement).getByText('STEP 1 OF 7')).toBeInTheDocument()

    const input = document.createElement('input')
    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    document.body.append(input, editable)
    try {
      // Step chord from a text field: must not navigate (base failure: the
      // active screen unmounts and typed state is destroyed mid-demo).
      fireEvent.keyDown(input, { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true, altKey: true, shiftKey: true })
      expect(within(railQuery() as HTMLElement).getByText('STEP 1 OF 7')).toBeInTheDocument()

      // Toggle chord from a contenteditable: rail must stay visible.
      fireEvent.keyDown(editable, { key: 'P', code: 'KeyP', ctrlKey: true, altKey: true, shiftKey: true })
      expect(railQuery()).toBeInTheDocument()

      // Same chords from a non-editable target still work.
      fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true, altKey: true, shiftKey: true })
      expect(within(railQuery() as HTMLElement).getByText('STEP 2 OF 7')).toBeInTheDocument()
    } finally {
      input.remove()
      editable.remove()
    }
  })
})

describe('RAIL-01 / RAIL-09 — occlusion compensation while the rail is visible', () => {
  it('publishes --lf-presenter-rail-h on <html> and injects screen + drawer inset rules; both are removed when the rail hides', () => {
    render(<App />)
    const root = document.documentElement

    pressRevealChord()
    expect(root.style.getPropertyValue('--lf-presenter-rail-h')).not.toBe('')
    const injected = Array.from(document.querySelectorAll('style'))
      .map((el) => el.textContent ?? '')
      .find((css) => css.includes('--lf-presenter-rail-h'))
    expect(injected, 'rail inset stylesheet').toBeDefined()
    // (a) every screen root is shortened so scroll bottoms clear the rail…
    expect(injected).toContain('[data-lf-screen]')
    expect(injected).toContain('calc(100vh - var(--lf-presenter-rail-h, 0px))')
    // (b) …and the shared Drawer's bottom edge (footer = step 3 Adopt/Reject)
    // is raised above the rail instead of sitting behind it at z 70 vs 50.
    expect(injected).toContain('[data-lf-composite="drawer"]')
    expect(injected).toContain('bottom: var(--lf-presenter-rail-h, 0px)')

    pressRevealChord()
    expect(root.style.getPropertyValue('--lf-presenter-rail-h')).toBe('')
    const stillInjected = Array.from(document.querySelectorAll('style'))
      .map((el) => el.textContent ?? '')
      .find((css) => css.includes('--lf-presenter-rail-h'))
    expect(stillInjected).toBeUndefined()
  })
})

describe('SH-10 — pre-paint theme stamp in index.html (file-content contract; jsdom never executes index.html)', () => {
  it('carries an inline head script that stamps data-theme from the stored preference before the module bundle loads', () => {
    const html = indexHtml
    const inlineScriptAt = html.indexOf('nw-platform-v2-theme')
    const moduleScriptAt = html.indexOf('src="/src/main.tsx"')
    expect(inlineScriptAt, 'inline stamp script references the App.tsx THEME_STORAGE_KEY').toBeGreaterThan(-1)
    expect(moduleScriptAt).toBeGreaterThan(-1)
    expect(inlineScriptAt, 'stamp runs before the app bundle').toBeLessThan(moduleScriptAt)
    expect(html).toContain("setAttribute('data-theme', stored)")
    // The static default stays dark for first-run/no-preference loads.
    expect(html).toContain('<html lang="en" data-theme="dark">')
  })
})
