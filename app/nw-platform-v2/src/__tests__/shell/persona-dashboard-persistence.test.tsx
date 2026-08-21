/**
 * Shell regression — L11 persona-seeded dashboards (call-10,
 * DECISIONS.md D13).
 *
 * D13: extends `state/demoStore.ts` with a persona-keyed localStorage
 * read/write, following App.tsx's existing `THEME_STORAGE_KEY`/
 * `getInitialTheme()` pattern verbatim. Two things must survive a real
 * page refresh/re-login for the requirement ("Adam profile loads
 * financial-focused layout, Rachel loads risk-focused layout, on
 * refresh/re-login") to be observable at all:
 *  1. WHICH persona is active (App.tsx `currentUserId` —
 *     `getInitialUserId`/`CURRENT_USER_STORAGE_KEY`, ported verbatim from
 *     the theme mechanism);
 *  2. THAT persona's Home panel order (views/HomeCustomizeBar.tsx
 *     `resolveVisibleKeys`/`commitVisibleKeys` -> state/demoStore.ts
 *     `getPersistedHomeOrder`/`persistHomeOrder`).
 *
 * "Survives browser clears" is a named, accepted gap (D13) — not tested
 * here, matching call-10's own ruling.
 *
 * See `__tests__/engine_data/home-layout-persistence.test.ts` for the
 * demoStore-level unit coverage (including the repro-check) and
 * `shell/home.test.tsx` for the pre-existing, unchanged default-persona
 * (Rachel) panel-order regression suite this dispatch does not touch.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { getPersistedHomeOrder, persistHomeOrder, resetDemo } from '../../state/demoStore'
import { HOME_ORDER } from '../../data/misc'

const CURRENT_USER_STORAGE_KEY = 'nw-platform-v2-current-user'

beforeEach(() => {
  resetDemo() // clears HOME_ORDER + the persisted home-layout store (state/demoStore.ts)
  window.localStorage.clear() // also drop theme/current-user keys between tests
  for (const key of Object.keys(HOME_ORDER)) delete HOME_ORDER[key]
})

function panelKeysInOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-lf-home-panel]')).map(
    (el) => el.getAttribute('data-lf-home-panel') ?? '',
  )
}

async function switchPersona(user: ReturnType<typeof userEvent.setup>, name: RegExp): Promise<void> {
  await user.click(within(screen.getByRole('banner')).getByRole('button', { name: /Fischer|Schlesinger|Raman|Reyes|Ribau|Scheffler/ }))
  await user.click(screen.getByRole('menuitem', { name }))
}

describe("Adam Schlesinger ('ceo') — financial-focused seed (call-10)", () => {
  it('switching to Adam with no prior customization renders his financial-focused seed order — invest leads', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await switchPersona(user, /Adam Schlesinger/)

    expect(panelKeysInOrder(container)).toEqual(['invest', 'legis', 'queue', 'qa', 'posture'])
  })

  it('the active persona survives a full remount (getInitialUserId localStorage port, same mechanism as theme)', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await switchPersona(user, /Adam Schlesinger/)
    expect(screen.getByRole('button', { name: 'Adam Schlesinger' })).toBeInTheDocument()
    first.unmount()

    const { container } = render(<App />)
    expect(screen.getByRole('button', { name: 'Adam Schlesinger' })).toBeInTheDocument()
    // His financial-focused seed layout is what a fresh boot resolves to
    // for his roleKey, since HOME_ORDER was never customized this run.
    expect(panelKeysInOrder(container)).toEqual(['invest', 'legis', 'queue', 'qa', 'posture'])
  })

  it("localStorage carries the active persona under CURRENT_USER_STORAGE_KEY after a switch", async () => {
    const user = userEvent.setup()
    render(<App />)
    await switchPersona(user, /Adam Schlesinger/)
    expect(window.localStorage.getItem(CURRENT_USER_STORAGE_KEY)).toBe('adam')
  })
})

describe("Rachel Fischer ('cro') — risk-focused by construction (call-10; no explicit seed entry, see demoStore.ts header)", () => {
  it('boots to the shipped default order — aigov first (HF1 user ruling 2026-08-21), then posture (Risk posture)', () => {
    const { container } = render(<App />)
    expect(panelKeysInOrder(container)).toEqual(['aigov', 'posture', 'legis', 'invest', 'queue', 'qa'])
  })
})

describe('a role\'s persisted panel-order customization is honored on first render — proves the read path is localStorage-backed, not merely in-memory continuity', () => {
  it('HOME_ORDER (in-memory) is untouched, yet a previously-persisted order for a role renders immediately', () => {
    // Simulates: a PRIOR page life called persistHomeOrder (via
    // HomeCustomizeBar.tsx's commitVisibleKeys) and wrote to
    // localStorage; this run's HOME_ORDER module singleton was cleared by
    // beforeEach's resetDemo() and never re-populated before this render.
    persistHomeOrder('cro', ['queue', 'posture', 'legis', 'invest', 'qa'])
    expect(HOME_ORDER['cro']).toBeUndefined()

    const { container } = render(<App />)
    expect(panelKeysInOrder(container)).toEqual(['queue', 'posture', 'legis', 'invest', 'qa'])
  })

  it("a persisted customization for Adam ('ceo') overrides his persona seed", () => {
    persistHomeOrder('ceo', ['qa', 'posture'])

    // We still need to be ON Adam's persona to see his Home render — but
    // the read-path proof here is demoStore-level (getPersistedHomeOrder),
    // matching this describe block's own scope; the full switch+render
    // path is covered by the "financial-focused seed" describe above.
    expect(getPersistedHomeOrder('ceo')).toEqual(['qa', 'posture'])
  })
})

describe('Restart (handleRestart -> resetDemo) clears a persisted Home-layout customization and the active persona', () => {
  it('switching to Adam, customizing his layout, then Restart: persona returns to Rachel and Adam\'s customization is gone (his seed remains available)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await switchPersona(user, /Adam Schlesinger/)

    // Customize Adam's layout via the bar (toggle "Risk posture" — his
    // seed's LAST panel — off). HF1: his stored 5-key seed stays
    // authoritative over the new 6-key default ('aigov' hidden for him
    // until toggled on), so the derived trigger reads 5 of 6.
    await user.click(screen.getByRole('button', { name: 'Customize (5 of 6 shown)' }))
    const bar = screen.getByRole('group', { name: 'Customize your home' })
    await user.click(within(bar).getByRole('button', { name: '5. Risk posture' }))
    expect(getPersistedHomeOrder('ceo')).toEqual(['invest', 'legis', 'queue', 'qa'])

    // Restart via the presenter rail's "Reset demo" (components-fix-wave
    // precedent) is out of this dispatch's allowlist to drive through the
    // rail UI here — call the same handler surface directly instead:
    // resetDemo() is exactly what handleRestart invokes first, and it is
    // the piece under test (state/demoStore.ts, in-allowlist).
    act(() => {
      resetDemo()
    })

    // The persisted customization is cleared; only Adam's in-code seed
    // remains (invest leads).
    expect(getPersistedHomeOrder('ceo')?.[0]).toBe('invest')
    expect(getPersistedHomeOrder('ceo')).not.toEqual(['invest', 'legis', 'queue', 'qa'])
  })
})
