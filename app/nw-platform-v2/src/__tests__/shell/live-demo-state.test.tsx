/**
 * Shell regression — live demo-state wiring in App.tsx (backbone
 * fix-wave dispatch: SH-1/CS-01 notification pipeline, SH-8 bell
 * re-press, SH-2/RAIL-02/CS-04/RPT-02 Restart = full resetDemo).
 *
 * Base anchors (leapfi-dashboards/src/leapfi-platform.html @ pin 1c230fe):
 *  - notify() unshifts NOTIFS and renderBell() re-renders the badge
 *    (source 2626–2642) — here: a store write re-renders the subscribed
 *    shell, so the badge appears without any remount.
 *  - openNotif(i) marks the clicked notification read and opens its case
 *    (source 2644–2647) — here: the bell row's Open press clears the
 *    unread badge and lands on the case detail, and pressing the same
 *    row again still re-opens the detail (SH-8: previously a dead press —
 *    Object.is-equal setState + unchanged remount key).
 *  - resetDemo() (source 3938–3961) — here: the rail's Restart restores
 *    the module singletons (CASES stages, NOTIFS, CLOCK, HOME_ORDER,
 *    BOARD_LOG) and shows the base's reset toast (source 3960).
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { notifyCaseRouted, resetDemo } from '../../state/demoStore'
import { CASES, CLOCK, NOTIFS } from '../../data/cases'
import { HOME_ORDER } from '../../data/misc'

beforeEach(() => {
  resetDemo()
})

function toggleRail(): void {
  // D18 chord (rail_d18 fix wave): Ctrl+Alt+Shift+P, matched on
  // `event.code === 'KeyP'` (RAIL-03/SH-3 macOS composition fix).
  fireEvent.keyDown(window, { key: 'P', code: 'KeyP', ctrlKey: true, altKey: true, shiftKey: true })
}

describe('notification pipeline through the shell (SH-1/CS-01; base notify → renderBell, 2626–2642)', () => {
  it('a store notify() write badges the bell live, Open lands on the case detail and clears the unread badge (openNotif 2644–2647)', async () => {
    const user = userEvent.setup()
    render(<App />)

    // PI2-D45 (USER OVERRIDE): 5 board/exec-tier cases now boot already
    // routed + notified (bootUnread === 5) — write onto a still-untouched
    // proc-tier case instead of CASES[0], so the delta and the fresh
    // panel row are unambiguous rather than duplicating an existing entry.
    const bootUnread = NOTIFS.filter((n) => n['read'] !== true).length
    expect(bootUnread).toBe(5)
    const targetCase = CASES.find((c) => c.tier === 'proc')!

    expect(screen.getByRole('button', { name: `Notifications, ${bootUnread} unread` })).toBeInTheDocument()

    // The write the cases batch fires on Accept & route (base 2691) —
    // default persona is Rachel (cro), the write's target role.
    act(() => {
      notifyCaseRouted(targetCase)
    })

    // Badge appears without any navigation/remount — the store
    // subscription is the base's renderBell() fan-out.
    const trigger = screen.getByRole('button', { name: `Notifications, ${bootUnread + 1} unread` })
    await user.click(trigger)
    const panel = screen.getByRole('group', { name: 'Notifications · Chief Risk Officer' })
    const freshTitle = within(panel).getByText(`Approval needed · ${targetCase.title}`)
    expect(freshTitle).toBeInTheDocument()

    await user.click(within(freshTitle.closest('li') as HTMLElement).getByRole('button', { name: 'Open' }))

    // Landed on the Cases detail for that case.
    expect(screen.getByRole('button', { name: '← All cases' })).toBeInTheDocument()
    // Read-flip: unread badge cleared (base openNotif x.read=true) — the
    // fresh write is unshifted to the front (base notify(), source 2626).
    expect(NOTIFS[0]?.['read']).toBe(true)
    expect(screen.getByRole('button', { name: `Notifications, ${bootUnread} unread` })).toBeInTheDocument()
  })

  it('SH-8: re-opening the SAME case from the bell after backing out in-screen is not a dead press', async () => {
    const user = userEvent.setup()
    render(<App />)

    // PI2-D45 (USER OVERRIDE): same reasoning as the previous test — use a
    // still-untouched proc-tier case rather than CASES[0].
    const bootUnread = NOTIFS.filter((n) => n['read'] !== true).length
    const targetCase = CASES.find((c) => c.tier === 'proc')!

    act(() => {
      notifyCaseRouted(targetCase)
    })

    // First open from the bell.
    await user.click(screen.getByRole('button', { name: `Notifications, ${bootUnread + 1} unread` }))
    const panel1 = screen.getByRole('group', { name: 'Notifications · Chief Risk Officer' })
    const row1 = within(panel1).getByText(`Approval needed · ${targetCase.title}`).closest('li') as HTMLElement
    await user.click(within(row1).getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('button', { name: '← All cases' })).toBeInTheDocument()

    // Back to the list INSIDE the Cases screen (screenId stays 'cases',
    // pendingCaseId still holds this case id).
    //
    // REGRESSION FIX (PI2-D14 host migration, docflow/lane-2): this
    // assertion originally read synchronously (no `waitFor`), pinning
    // pre-D14 behavior — `CaseDetail.tsx` was a standalone full page and
    // "← All cases" swapped `screenId` back to the list instantly. PI2-D14
    // (design_system_spec.md §2.10 preamble, "CaseDetail.tsx's full-page
    // exception DISSOLVES... its approval logic migrates into the case
    // side-car Drawer") dissolves exactly that: the case detail now renders
    // as the SAME shared Drawer (C7) every other screen's detail overlay
    // uses (`Cases.tsx`, PI2-D14 host migration comment), and "← All cases"
    // closes it through C7's own standard ~200ms exit transition
    // (`Drawer.tsx`'s `TRANSITION_MS`) rather than unmounting synchronously
    // — the content stays mounted through `phase: 'closing'` by design (see
    // `case_sidecar_migration.test.tsx`'s own fake-timer pin of this exact
    // transition). This is the new, intentional behavior, not a defect:
    // waiting for it here is the correct assertion, not a workaround.
    await user.click(screen.getByRole('button', { name: '← All cases' }))
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: '← All cases' })).not.toBeInTheDocument()
    })

    // Same bell row, same case — previously a no-op setState (unchanged
    // key, no remount); the per-press nonce now forces the remount. The
    // target's notification is now read, so the badge is back to
    // `bootUnread` (its own entry no longer counts as unread).
    await user.click(screen.getByRole('button', { name: `Notifications, ${bootUnread} unread` }))
    const panel2 = screen.getByRole('group', { name: 'Notifications · Chief Risk Officer' })
    const row2 = within(panel2).getByText(`Approval needed · ${targetCase.title}`).closest('li') as HTMLElement
    await user.click(within(row2).getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('button', { name: '← All cases' })).toBeInTheDocument()
  })
})

describe('Restart = full demo reset (SH-2/RAIL-02/CS-04/RPT-02; base resetDemo 3938–3961)', () => {
  it('the rail Restart restores mutated singletons and shows the base reset toast (3960)', async () => {
    const user = userEvent.setup()
    render(<App />)
    toggleRail()

    // Rehearsal mutations: an extra routed case (stage + notification +
    // clock ticks) and a customized Home layout. PI2-D45 (USER OVERRIDE):
    // boot already carries 5 notifications and CLOCK.i===11 — mutate a
    // still-untouched proc-tier case instead of CASES[0], on top of that
    // baseline.
    const bootNotifs = NOTIFS.length
    const bootClock = CLOCK.i
    const targetCase = CASES.find((c) => c.tier === 'proc')!
    targetCase.stage = 'cro'
    act(() => {
      notifyCaseRouted(targetCase)
    })
    HOME_ORDER['cro'] = ['ai']
    expect(NOTIFS.length).toBe(bootNotifs + 1)
    expect(CLOCK.i).toBeGreaterThan(bootClock)

    const rail = screen.getByRole('region', { name: 'Presenter rail' })
    await user.click(within(rail).getByRole('button', { name: 'Restart' }))

    // Opening frame restored to the PI2-D45 boot state: eight open, the 3
    // proc-tier cases undecided, the 5 board/exec-tier cases routed with
    // their notifications, clock back at the boot-seed tick count, layout
    // customization gone.
    expect(CASES.length).toBe(8)
    expect(CASES.filter((c) => c.tier === 'proc').every((c) => c.stage === 'analyst')).toBe(true)
    expect(CASES.filter((c) => c.tier === 'board' || c.tier === 'exec').every((c) => c.stage === 'cro')).toBe(true)
    expect(NOTIFS.length).toBe(bootNotifs)
    expect(CLOCK.i).toBe(bootClock)
    expect(HOME_ORDER).toEqual({})
    expect(screen.getByRole('button', { name: `Notifications, ${bootNotifs} unread` })).toBeInTheDocument()
    expect(
      screen.getByText('Demo reset. Every gap, redline, lever, filter, and conversation is back to the opening state.'),
    ).toBeInTheDocument()
  })
})
