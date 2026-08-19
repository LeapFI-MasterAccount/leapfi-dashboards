/**
 * Shell regression — Notification Bell (views/NotificationBellPanel.tsx).
 *
 * D17: base anchors (leapfi-platform.html @1c230fe):
 *  - source 2626–2629  `notify(roleKey,title,cid,kind)` — pushes
 *    `{to,title,cid,kind:kind||'app',when,read:false}` (kind defaults 'app').
 *  - source 2630 (dispatch anchor "myNotifs 2621")
 *    `myNotifs(){return NOTIFS.filter(x => x.to===CURRENT.roleKey)}` —
 *    role-scoped view of the shared NOTIFS singleton.
 *  - source 2631–2641  `renderBell()` — unread count badge over myNotifs,
 *    panel header "Notifications · <role>", rows "<title>" +
 *    "<when> · <cid> · in-app|email + in-app", and the exact empty-state
 *    copy "Nothing waiting on you. ..." when myNotifs is empty.
 *  - source 2644–2647  `openNotif(i)` — a row press closes the panel and
 *    opens that notification's case.
 *  - source 2593–2603  `seedCases()` resets NOTIFS to [] — boot state is
 *    an empty bell.
 *
 * The role-filter and row rendering are pinned at component level with
 * synthetic NOTIFS entries. (Updated by the backbone fix-wave dispatch:
 * `state/demoStore.ts` now ports the base `notify()` pipeline and the six
 * case-action write sites, and the shell subscribes so writes re-render
 * the bell — see shell/live-demo-state.test.tsx for the live pipeline.
 * NOTIFS is still empty at BOOT, so the boot-state suite below is
 * unchanged; the Cases screen's performAction call-site wiring is the
 * cases batch's swap.)
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { NotificationBellPanel, filterNotifsForRole } from '../../views/NotificationBellPanel'
import type { Notif } from '../../data/cases'

const SEED: Notif[] = [
  { to: 'cro', title: 'CASE-2026-001 is waiting on you', cid: 'CASE-2026-001', kind: 'app', when: 'Aug 15, 2026 · 9:14 AM ET', read: false },
  { to: 'analyst', title: 'CASE-2026-002 is waiting on you', cid: 'CASE-2026-002', kind: 'app', when: 'Aug 15, 2026 · 9:41 AM ET', read: false },
  { to: 'cro', title: 'CASE-2026-003 routed for approval', cid: 'CASE-2026-003', kind: 'email', when: 'Aug 15, 2026 · 10:06 AM ET', read: true },
  // No `kind` key at all — base notify() defaults it to 'app' (source 2626–2629).
  { to: 'cro', title: 'CASE-2026-004 returned', cid: 'CASE-2026-004', when: 'Aug 15, 2026 · 10:32 AM ET', read: false },
]

describe('filterNotifsForRole (base myNotifs, source 2630 / dispatch anchor 2621)', () => {
  it('returns only entries whose `to` matches the role key, preserving NOTIFS order', () => {
    const mine = filterNotifsForRole(SEED, 'cro')
    expect(mine.map((n) => n.cid)).toEqual(['CASE-2026-001', 'CASE-2026-003', 'CASE-2026-004'])
    expect(filterNotifsForRole(SEED, 'analyst').map((n) => n.cid)).toEqual(['CASE-2026-002'])
    expect(filterNotifsForRole(SEED, 'legal')).toEqual([])
  })

  it('defaults a missing kind to "app" (base notify kind||\'app\', source 2626–2629)', () => {
    const mine = filterNotifsForRole(SEED, 'cro')
    expect(mine.find((n) => n.cid === 'CASE-2026-004')?.kind).toBe('app')
    expect(mine.find((n) => n.cid === 'CASE-2026-003')?.kind).toBe('email')
  })
})

describe('bell trigger + panel (base renderBell, source 2631–2641)', () => {
  it('badges the trigger with the active role\'s UNREAD count only (base un=myNotifs unread, 2631–2637)', () => {
    render(<NotificationBellPanel notifs={SEED} currentRoleKey="cro" currentRoleLabel="Chief Risk Officer" onOpenCase={() => {}} />)
    // cro has 3 notifs, 2 unread — the accessible name counts unread, not total.
    expect(screen.getByRole('button', { name: 'Notifications, 2 unread' })).toBeInTheDocument()
  })

  it('opens to a role-titled panel listing ONLY the active role\'s rows with the base row subtitle format (2638–2641)', async () => {
    const user = userEvent.setup()
    render(<NotificationBellPanel notifs={SEED} currentRoleKey="cro" currentRoleLabel="Chief Risk Officer" onOpenCase={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Notifications, 2 unread' }))

    const panel = screen.getByRole('group', { name: 'Notifications · Chief Risk Officer' })
    expect(within(panel).getByText('Notifications · Chief Risk Officer')).toBeInTheDocument()
    // The analyst-routed row never renders for the CRO.
    expect(within(panel).queryByText('CASE-2026-002 is waiting on you')).not.toBeInTheDocument()
    // Row subtitle: "<when> · <cid> · in-app" / "email + in-app" (base 2641).
    expect(within(panel).getByText('Aug 15, 2026 · 9:14 AM ET · CASE-2026-001 · in-app')).toBeInTheDocument()
    expect(within(panel).getByText('Aug 15, 2026 · 10:06 AM ET · CASE-2026-003 · email + in-app')).toBeInTheDocument()
    expect(within(panel).getByText('Aug 15, 2026 · 10:32 AM ET · CASE-2026-004 · in-app')).toBeInTheDocument()
  })

  it('shows the base\'s honest empty state, verbatim, when the active role has no notifications (base 2641)', async () => {
    const user = userEvent.setup()
    render(<NotificationBellPanel notifs={SEED} currentRoleKey="legal" currentRoleLabel="General Counsel" onOpenCase={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(
      screen.getByText('Nothing waiting on you. Cases you are asked to action land here, and by email if the case says so.'),
    ).toBeInTheDocument()
  })

  it('a row\'s Open action closes the panel and opens that notification\'s case (base openNotif, 2644–2647)', async () => {
    const user = userEvent.setup()
    const onOpenCase = vi.fn()
    render(<NotificationBellPanel notifs={SEED} currentRoleKey="cro" currentRoleLabel="Chief Risk Officer" onOpenCase={onOpenCase} />)

    await user.click(screen.getByRole('button', { name: 'Notifications, 2 unread' }))
    const panel = screen.getByRole('group', { name: 'Notifications · Chief Risk Officer' })
    const openButtons = within(panel).getAllByRole('button', { name: 'Open' })
    expect(openButtons.length).toBe(3)
    await user.click(openButtons[0] as HTMLElement)

    expect(onOpenCase).toHaveBeenCalledWith('CASE-2026-001')
    expect(screen.queryByRole('group', { name: 'Notifications · Chief Risk Officer' })).not.toBeInTheDocument()
  })
})

describe('bell through the shell at boot (base seedCases resets NOTIFS=[], source 2593–2603)', () => {
  it('boot bell is empty for the default CRO persona: no unread badge, honest empty state on open', async () => {
    const user = userEvent.setup()
    render(<App />)

    // No unread count in the accessible name at boot (NOTIFS seeded empty).
    const trigger = screen.getByRole('button', { name: 'Notifications' })
    await user.click(trigger)
    expect(
      screen.getByText('Nothing waiting on you. Cases you are asked to action land here, and by email if the case says so.'),
    ).toBeInTheDocument()
    // Panel is titled for the base default persona's role (L823–854: Rachel Fischer CRO).
    expect(screen.getByRole('group', { name: 'Notifications · Chief Risk Officer' })).toBeInTheDocument()
  })
})
