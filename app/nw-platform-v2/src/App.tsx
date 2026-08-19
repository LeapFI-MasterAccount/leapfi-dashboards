/**
 * App — shell assembly (design_system_spec.md §3 Shell anatomy, §4
 * PresenterRail anatomy; demo_script_draft.md §3 SCRIPT data model)
 *
 * Final-wiring dispatch: every screen (`Home`, `OnSideFeed`,
 * `OnSideDocuments`, `StudioAsk`, `InvestmentDesign`, `Roadmap`,
 * `BoardDeck`) and every shell composite (`Sidebar` C3, `Topbar` C4,
 * `PresenterRail` C21) already exists, built by sibling dispatches to each
 * screen's own §5.x anatomy. This file is the wiring that turns them into
 * the one running app: a single `screenId` state switches which screen is
 * mounted (no router library, per the TASK line — the base engine's own
 * nav model is a plain state switch, not URL routing, and this is a D14
 * port of that engine, not a new IA), plus the cross-screen state no
 * individual screen owns (persona, theme, presenter-rail activation).
 *
 * NO ROUTER LIB / ONE SCREEN MOUNTED AT A TIME: `screenId` (a closed id
 * union, see `SCREEN_IDS` below) selects exactly one screen element to
 * render; every other screen is fully unmounted, not hidden via CSS. This
 * is the same assumption every sibling screen's own "Drawer instance
 * ownership" ambiguity note already depends on ("a standard
 * single-active-route SPA... never produces two simultaneously-open Drawer
 * instances... STOP-item for whichever dispatch does true app-shell/routing
 * integration: if screens are ever composed side-by-side... hoist Drawer to
 * a shared shell instead"). This file IS that routing integration, and it
 * satisfies the STOP-item's own stated condition (routed one-at-a-time) —
 * so no `<Drawer>` is mounted here. Every screen that needs one already
 * owns a correctly-scoped local instance under this exact routing model;
 * none of the 7 screens has cross-screen drawer content that would justify
 * lifting ownership up to this file.
 *
 * BackChip one-level-back (AMBIGUITY RESOLVED, §3.2 state machine):
 * `previousScreenId` tracks a single value, never a stack, per the spec's
 * own "never a stack" wording. Landing on `home` always clears it (Home is
 * the arc's root — §5.1 — so it never shows a Back chip); landing anywhere
 * else sets it to whatever screen was just left. This is exactly the
 * "at-root ↔ one-level-back" binary the spec describes, with no history
 * depth beyond one hop.
 *
 * PARITY-ASSEMBLY DISPATCH (parity_ia_addendum.md, D16): this file was
 * revised by the parity-assembly dispatch to route/host the addendum's new
 * screens whose "home" is a self-contained `screens/` file (the addendum's
 * own vocabulary, its "Method note" section) — `OnSideOverview`,
 * `OnSideOwnership`, `Cases`, `Reporting`, `SettingsToggles`,
 * `SettingsAbout` — plus the shell-level Notification Bell (§1.5). See
 * "OUT-OF-SCOPE SIDEBAR DESTINATIONS" and "NOTIFICATION BELL" below for
 * what changed and the STOP-item on what deliberately did not.
 *
 * EVERY SIDEBAR DESTINATION ROUTES TO A REAL SCREEN (rewritten by the
 * fix-wave gate dispatch — SH-4/RAIL-06; supersedes this header's earlier
 * "OUT-OF-SCOPE SIDEBAR DESTINATIONS" section, which attributed to
 * design_system_spec.md §5.6 a "reached only via Roadmap's Step-6 flow,
 * never via a direct Sidebar click" disposition §5.6 does not contain —
 * SH-4 CONFIRMED): `connect`, `connect.allrailz`, and `connect.vantage`
 * now route to `screens/ConnectSoon.tsx`, the §5.6 Soon-splash surface
 * (SoonSplash C16 over `data/misc.ts`'s verbatim-ported SOON records),
 * matching the base page, whose sidebar `go('connect'/'allrailz'/
 * 'vantage')` clicks (source 803, 814–815) land on the in-fiction module
 * splash — never a placeholder. The former `OutOfScopeScreen` (whose
 * build-program meta copy — "the seven screens this build implements",
 * "the Step 1 full-sidebar gesture" — broke the product fiction on the
 * projector at demo_script_draft.md Step 6's own directed click) is
 * deleted; the `ScreenId` switch below is exhaustive, so no audience-
 * reachable click can land outside a real screen. `'connect'` itself is a
 * routed ScreenId for the Connect module splash — today it is reached via
 * Roadmap's "What's next" Connect SetupCard (§5.6's resolved primary
 * CTA); the Sidebar's Connect group header still toggles expansion per
 * C3's contract (Sidebar.tsx is outside the gate dispatch's allowlist —
 * flagged for the component-owning dispatch if design authority wants the
 * group header to also navigate, matching the script's literal "click
 * Connect in the sidebar" wording).
 *
 * D18 RESIDUE RESOLVED (gate dispatch, closing the rail_d18 batch's
 * STOP-item): `handleStartDemo` and the `<Home onStartDemo>` pass-through
 * are deleted per presenter_entry_redesign.md §4, and `Home.tsx` no
 * longer declares the prop — the §3.1 end-state (Home contains no demo
 * reference) is reached. §4's App-hosted `?present=1` mount check is
 * instead hosted by `PresenterRail`'s own mount effect (that batch's
 * documented, behavior-identical placement — same `start()` path, pinned
 * by `presenter-entry-d18.test.tsx`), so this shell keeps no rail ref;
 * one implementation, not two.
 *
 * STOP-ITEM RESOLVED (parity-wiring wave): the six previously-unwired view
 * files are now composed into their owning script screens by that wave's
 * builders — Batch 2's `views/RegulatoryFeedSources.tsx` +
 * `RegulatoryFeedLifecycle.tsx` + `RegulatoryFeedInforce.tsx` into
 * `OnSideFeed.tsx` (W1), Batch 7's `views/HomeCustomizeBar.tsx` +
 * `HomePanels.tsx` into `Home.tsx` (W2), and Batch 8's
 * `views/ChatIntakeWizard.tsx` into `StudioAsk.tsx` (W3) — and Batch 8's
 * board-log sub-flow (`views/BoardLogForm.tsx` + `data/boardLog.ts`, W4) is
 * wired into `Reporting.tsx`/`views/ReportView.tsx` by the wave's gate
 * dispatch. This file's wave-gate additions: `Home` now receives
 * `roleKey`/`roleFirstName` (W2's flagged follow-up — the persona switcher
 * propagates into Home's role-aware panels) and `Reporting` receives
 * `currentUser` (stamps `who` on board-log commits). Nothing else here
 * changed — the views' own screens import them; this shell still imports
 * only `screens/` files plus `views/NotificationBellPanel.tsx`.
 *
 * NOTIFICATION BELL (updated by the backbone fix-wave dispatch —
 * SH-1/CS-01/SH-8): `Topbar`'s `notificationSlot` extension point is
 * filled with `views/NotificationBellPanel.tsx`, wired to
 * `data/cases.ts`'s real `NOTIFS` array, role-filtered to the active
 * persona. `NOTIFS` starts empty until `seedCases()` runs; this file
 * imports `./screens/Cases` unconditionally for routing, and that module's
 * own top-level guard (`if (CASES.length === 0) seedCases(DOCLIB)`) runs as
 * an import-time side effect the moment this file loads — so case data is
 * seeded before first paint. Writers now exist: `state/demoStore.ts` owns
 * the base `notify()` pipeline (source 2626–2629 + the six case-action
 * write sites 2691–2758), and this shell subscribes via `useDemoStore()`,
 * so every NOTIFS write re-renders the bell (the base's renderBell()
 * fan-out). Opening a bell row calls `handleOpenCaseFromBell`, which (1)
 * marks the notification read via `openNotificationForCase` — the base
 * `openNotif` read-flip, source 2644–2647, so the unread badge clears —
 * and (2) navigates to `cases`, remounting that screen via a `key` built
 * from the target case id PLUS a per-press nonce so `initialCaseId` is
 * honored even when the bell targets the case already in `pendingCaseId`
 * (SH-8: a bare case-id key made the same-case re-press a dead click —
 * Object.is-equal setState, unchanged key, no remount). `Cases.tsx` itself
 * is unmodified; this is a pure parent-side `key` composition technique.
 *
 * PERSONA / USER-SWITCHER WIRING (TASK line): `profileMenuItems` is built
 * from `data/studio.ts`'s `USERS` (unmodified, six seeded personas);
 * selecting one sets `currentUserId`, which drives `Topbar`'s `profile`
 * name/initials. No other screen in this worktree reads the active
 * persona (none of the 7 screens' props accept one), so this wiring is
 * scoped to Topbar identity display only, matching the TASK line's actual
 * ask ("user-switcher wiring from data/studio.ts USERS") rather than a
 * deeper persona-aware-rendering feature no screen currently supports.
 * Restart (below) resets the persona back to `CURRENT` (`USERS[0]`,
 * Rachel Fischer) per demo_script_draft.md's own standing rule: "default
 * persona Rachel Fischer, CRO, stays as-is."
 *
 * THEME TOGGLE: the D13 scaffold's `theme`/`getInitialTheme`/localStorage
 * logic is ported verbatim (byte-identical mechanism, just re-hosted) into
 * `Topbar`'s documented `themeToggleSlot` extension point, rendered via the
 * `Switch` primitive (P8) — a real on/off toggle with an announced state,
 * a better a11y fit than the scaffold's own bespoke `<button>` for the same
 * job. Theme is a display preference, not demo data, so Restart (below)
 * deliberately leaves it untouched (§4: resetDemo "mutates demo data only,
 * never rail state" — theme is neither).
 *
 * DESIGN-PARTNER REQUEST (BoardDeck's `onDesignPartnerRequest`, G12): no
 * backend exists to submit a real lead to in this worktree/program (D14
 * ports the base page's existing engines; no CRM/lead-capture engine is
 * cited anywhere in survey_map.md). This handler shows a local success
 * `Toast` acknowledging the click was registered for this session — it
 * never claims a message was sent anywhere, since none is (Core Principle
 * 3: never fabricate a stronger claim than what actually happened). No
 * network call, no form submission, no data leaves the browser.
 *
 * RESTART / resetDemo SCOPE (rewritten by the backbone fix-wave dispatch —
 * SH-2/RAIL-02/CS-04/RPT-02; supersedes the earlier claim that navigation
 * unmount alone was sufficient, which was only true for React component
 * state, not the module singletons): the demo's durable state lives in
 * module singletons mutated in place across the session — CASES stage/
 * history (Cases.tsx performAction), NOTIFS, BOARD_LOG (Reporting's
 * board-log commits), HOME_ORDER/HOME_HIDE (HomeCustomizeBar), CLOCK.i,
 * DOCLIB redline flips on adoption, the live lever state, OPPS Discovery
 * additions, SCOPE_EVENTS, and the OBL/DOMAINS/GAPS adopt cascade.
 * `handleRestart` now calls `state/demoStore.ts`'s `resetDemo()` — the
 * port of the base engine's resetDemo (leapfi-platform.html 3938–3961,
 * DEMO_SEED snapshot mechanism 3928–3937) — BEFORE resetting the persona
 * (base 3957 `switchUser('rachel')`) and navigating Home (base 3958
 * `go('home')`), and then shows the base's own reset toast (base 3960).
 * design_system_spec.md §4 "Restarting" ("after resetDemo() completes")
 * is now satisfied: a rehearsal run no longer leaks adopted cases, board
 * log entries, cleared Home panels, advanced clock ticks, or moved levers
 * into the live run.
 *
 * DEMO_DATE_LABEL: a fixed demo constant ("Friday, August 15, 2026"),
 * matching demo_script_draft.md Step 1's own "See" line and the board
 * deck's "Aug 15, 2026" stamp (§5.7) verbatim — this is the scripted
 * demo's internal fixed date, not a live clock; rendering the real system
 * date here would be the actual violation of Core Principle 3 (a claim the
 * data doesn't back), not the other way around.
 *
 * TESTS (stale claim corrected by the backbone fix-wave dispatch — an
 * earlier header revision said no test runner was installed): Vitest is
 * installed and this shell is covered by `src/__tests__/shell/` (bell
 * panel, presenter rail, topbar, sidebar, home, theme toggle, live demo
 * state) and type-checked via `npx tsc --noEmit` (strict,
 * `exactOptionalPropertyTypes`).
 */
import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './App.css'
import { Home } from './screens/Home'
import { ConnectSoon } from './screens/ConnectSoon'
import { OnSideFeed } from './screens/OnSideFeed'
import { OnSideDocuments } from './screens/OnSideDocuments'
import { OnSideOverview } from './screens/OnSideOverview'
import { OnSideOwnership } from './screens/OnSideOwnership'
import { StudioAsk } from './screens/StudioAsk'
import { InvestmentDesign } from './screens/InvestmentDesign'
import { Roadmap } from './screens/Roadmap'
import { BoardDeck } from './screens/BoardDeck'
import { Cases } from './screens/Cases'
import { Reporting } from './screens/Reporting'
import { SettingsToggles } from './screens/SettingsToggles'
import { SettingsAbout } from './screens/SettingsAbout'
import type { TopbarBackTarget, TopbarProfileMenuItem, TopbarProps } from './components/Topbar'
import { PresenterRail } from './components/PresenterRail'
import { Toast } from './components/Toast'
import { Switch } from './components/primitives/Switch'
import { NotificationBellPanel } from './views/NotificationBellPanel'
import { CURRENT, USERS } from './data/studio'
import { NOTIFS } from './data/cases'
import { DEFAULT_SCRIPT_KEY, resolveTarget, SCRIPTS } from './data/script'
import { getDemoSliders, openNotificationForCase, resetDemo, useDemoStore } from './state/demoStore'

type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'nw-platform-v2-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

/** demo_script_draft.md Step 1 "See" line / §5.7 board-deck stamp — see file header "DEMO_DATE_LABEL." */
const DEMO_DATE_LABEL = 'Friday, August 15, 2026'

/** See data/script.ts's own "let ACTIVE_SCRIPT" note — this shell's active-script selection. Swapping to a second script (D4) costs exactly this line plus one SCRIPTS registry entry. */
const ACTIVE_SCRIPT = SCRIPTS[DEFAULT_SCRIPT_KEY]

/** Every screen id this shell can switch to — the 7 script-navigable ids (data/script.ts `ScriptTargetId`), the Sidebar leaf items no script targets, and `'connect'` (the Connect module splash, reached via Roadmap's "What's next" Connect SetupCard — see file header "EVERY SIDEBAR DESTINATION ROUTES TO A REAL SCREEN"). Single source of truth for the `ScreenId` type below. */
const SCREEN_IDS = [
  'home',
  'onside.overview',
  'onside.feed',
  'onside.documents',
  'onside.ownership',
  'studio.ask',
  'studio.investment-design',
  'studio.roadmap',
  'connect',
  'connect.allrailz',
  'connect.vantage',
  'reporting',
  'settings.toggles',
  'settings.about',
  'cases',
  'board-deck',
] as const

type ScreenId = (typeof SCREEN_IDS)[number]

function isScreenId(id: string): id is ScreenId {
  return (SCREEN_IDS as readonly string[]).includes(id)
}

const SCREEN_LABEL: Record<ScreenId, string> = {
  home: 'Home',
  'onside.overview': 'OnSide · Overview',
  'onside.feed': 'OnSide · Regulatory feed',
  'onside.documents': 'OnSide · Documents',
  'onside.ownership': 'OnSide · Ownership',
  'studio.ask': 'Studio · Ask',
  'studio.investment-design': 'Studio · Investment Design',
  'studio.roadmap': 'Studio · Roadmap',
  connect: 'Connect',
  'connect.allrailz': 'Connect · AllRailz',
  'connect.vantage': 'Connect · Vantage',
  reporting: 'Reporting',
  'settings.toggles': 'Settings · Toggles',
  'settings.about': 'Settings · About',
  cases: 'Cases',
  'board-deck': 'Board deck',
}

const TOAST_WRAP_STYLE: CSSProperties = { position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 60 }

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [screenId, setScreenId] = useState<ScreenId>('home')
  const [previousScreenId, setPreviousScreenId] = useState<ScreenId | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>(CURRENT.id)
  const [designPartnerToast, setDesignPartnerToast] = useState(false)
  // See file header "NOTIFICATION BELL" — the case a bell row asked to
  // open; also doubles as the Cases screen's remount key so a bell press
  // while already on `cases` still lands on the right case detail.
  const [pendingCaseId, setPendingCaseId] = useState<string | null>(null)
  // SH-8: per-press nonce folded into the Cases `key` so re-opening the
  // SAME case from the bell still forces the remount (a bare case-id key
  // is Object.is-equal on the re-press and never remounts).
  const [bellPressNonce, setBellPressNonce] = useState(0)
  const [restartToast, setRestartToast] = useState(false)

  // Subscribe this shell to every demo-state write (state/demoStore.ts) —
  // the React stand-in for the base's renderBell()/renderHome() fan-out.
  // NOTIFS pushes, resetDemo, lever changes, and scope events all
  // re-render from here (the bell badge is the direct consumer).
  useDemoStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  function navigateToScreen(id: string): void {
    if (!isScreenId(id)) return
    // Every generic path into Cases (OnSideOverview's "Cases · approvals"
    // row, Reporting's gapboard "Open cases →" link, ...) lands on the
    // list — only the dedicated bell path (handleOpenCaseFromBell, which
    // does not call this function) opens a specific case. See file header
    // "NOTIFICATION BELL."
    if (id === 'cases') setPendingCaseId(null)
    if (id === screenId) return
    setPreviousScreenId(id === 'home' ? null : screenId)
    setScreenId(id)
  }

  function handlePresenterNavigate(target: string): void {
    const resolved = resolveTarget(target)
    if (resolved) navigateToScreen(resolved)
  }

  function handleRestart(): void {
    // Full demo reset FIRST (base resetDemo, leapfi-platform.html
    // 3938–3961) — see file header "RESTART / resetDemo SCOPE."
    resetDemo()
    setCurrentUserId(CURRENT.id) // base 3957 switchUser('rachel')
    setPendingCaseId(null)
    navigateToScreen('home') // base 3958 go('home')
    setRestartToast(true) // base 3960 toast
  }

  function handleDesignPartnerRequest(): void {
    setDesignPartnerToast(true)
  }

  /** See file header "NOTIFICATION BELL." Does not go through
   * `navigateToScreen` — that function clears `pendingCaseId` on every
   * generic nav to `cases` (see its own comment) and early-returns when
   * already on the target screen, neither of which this handler wants:
   * opening a bell row must always honor the specific case id, including
   * when the bell is opened while Cases is already the active screen (the
   * `key` on the `case 'cases'` render below — case id + press nonce —
   * then forces the remount that makes `initialCaseId` take effect
   * again, even for the case already in `pendingCaseId`; SH-8). */
  function handleOpenCaseFromBell(caseId: string): void {
    // Base openNotif (source 2644–2647): opening marks the notification
    // read, clearing it from the unread badge count.
    openNotificationForCase(caseId, currentUser.roleKey)
    setBellPressNonce((nonce) => nonce + 1)
    setPendingCaseId(caseId)
    if (screenId !== 'cases') {
      setPreviousScreenId(screenId)
      setScreenId('cases')
    }
  }

  const currentUser = USERS.find((user) => user.id === currentUserId) ?? CURRENT

  const profileMenuItems: TopbarProfileMenuItem[] = USERS.map((user) => ({
    id: user.id,
    label: user.id === currentUserId ? `${user.name} — ${user.role} (current)` : `${user.name} — ${user.role}`,
    onPress: () => setCurrentUserId(user.id),
  }))

  const backTarget: TopbarBackTarget | null = previousScreenId
    ? { label: `Back to ${SCREEN_LABEL[previousScreenId]}`, onPress: () => navigateToScreen(previousScreenId) }
    : null

  const topbarProps: TopbarProps = {
    breadcrumb: SCREEN_LABEL[screenId],
    backTarget,
    onOpenBoardDeck: () => navigateToScreen('board-deck'),
    date: DEMO_DATE_LABEL,
    profile: { name: currentUser.name, initials: currentUser.ini },
    profileMenuItems,
    themeToggleSlot: <Switch checked={theme === 'light'} label="Light theme" onChange={(checked) => setTheme(checked ? 'light' : 'dark')} />,
    // See file header "NOTIFICATION BELL" — raw NOTIFS singleton passed
    // through; NotificationBellPanel does its own role filtering (matches
    // the base engine's own `myNotifs()` scoping, per its file header).
    notificationSlot: (
      <NotificationBellPanel
        notifs={NOTIFS}
        currentRoleKey={currentUser.roleKey}
        currentRoleLabel={currentUser.role}
        onOpenCase={handleOpenCaseFromBell}
      />
    ),
  }

  function renderActiveScreen(): ReactNode {
    switch (screenId) {
      case 'home':
        // `roleKey`/`roleFirstName`: W2's flagged follow-up wiring (Home.tsx
        // header "WIRING RECIPE") — propagates the Topbar persona switcher
        // into Home's role-aware queue/customization. Boot/Restart persona is
        // CURRENT (Rachel, 'cro'), Home's own default, so the scripted first
        // paint is unchanged.
        return (
          <Home
            topbar={topbarProps}
            onNavigate={navigateToScreen}
            roleKey={currentUser.roleKey}
            roleFirstName={currentUser.first}
          />
        )
      case 'onside.overview':
        return <OnSideOverview topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'onside.feed':
        return <OnSideFeed topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'onside.documents':
        return <OnSideDocuments topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'onside.ownership':
        return <OnSideOwnership topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'studio.ask':
        return <StudioAsk topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'studio.investment-design':
        // `initialSliders`: App-level live-lever provisioning (SH-6/RPT-04
        // backbone) — every mount starts from the store's live lever
        // state instead of the hardcoded defaults, so lever positions
        // survive navigation once the screen publishes changes back via
        // `setDemoSliders` (state/demoStore.ts header documents the
        // publish contract; the screen-side publish call is the studio
        // batch's wiring).
        return <InvestmentDesign topbar={topbarProps} onNavigate={navigateToScreen} initialSliders={getDemoSliders()} />
      case 'studio.roadmap':
        return <Roadmap topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'connect':
      case 'connect.allrailz':
      case 'connect.vantage':
        // §5.6 Soon-splash surface (SH-4/RAIL-06 fix) — see file header
        // "EVERY SIDEBAR DESTINATION ROUTES TO A REAL SCREEN."
        return (
          <ConnectSoon
            topbar={topbarProps}
            onNavigate={navigateToScreen}
            moduleKey={screenId === 'connect' ? 'connect' : screenId === 'connect.allrailz' ? 'allrailz' : 'vantage'}
          />
        )
      case 'reporting':
        // `currentUser`: stamps `who` on committed board-log updates (the
        // regchange report's "Log an update →" sub-flow — base boardSave
        // reads the live persona global CURRENT, source 3589).
        return <Reporting topbar={topbarProps} onNavigate={navigateToScreen} currentUser={currentUser} />
      case 'settings.toggles':
        return <SettingsToggles topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'settings.about':
        return <SettingsAbout topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'cases':
        // `key`: see file header "NOTIFICATION BELL" — forces a remount so
        // `initialCaseId` is re-honored when a bell row is opened while
        // Cases is already the active screen (Cases.tsx itself is
        // unmodified; this is a pure parent-side composition technique).
        return (
          <Cases
            key={pendingCaseId !== null ? `${pendingCaseId}·${bellPressNonce}` : 'cases-list'}
            topbar={topbarProps}
            onNavigate={navigateToScreen}
            currentUser={currentUser}
            {...(pendingCaseId !== null ? { initialCaseId: pendingCaseId } : {})}
          />
        )
      case 'board-deck':
        return <BoardDeck topbar={topbarProps} onDesignPartnerRequest={handleDesignPartnerRequest} />
    }
  }

  return (
    <>
      {renderActiveScreen()}
      <PresenterRail script={ACTIVE_SCRIPT} onNavigate={handlePresenterNavigate} onRestart={handleRestart} />
      {designPartnerToast ? (
        <div style={TOAST_WRAP_STYLE}>
          <Toast
            variant="success"
            message="Design partner interest noted for this session."
            onDismiss={() => setDesignPartnerToast(false)}
            autoDismissMs={5000}
          />
        </div>
      ) : null}
      {restartToast ? (
        <div style={TOAST_WRAP_STYLE}>
          <Toast
            variant="success"
            message="Demo reset. Every gap, redline, lever, filter, and conversation is back to the opening state."
            onDismiss={() => setRestartToast(false)}
            autoDismissMs={5000}
          />
        </div>
      ) : null}
    </>
  )
}

export default App
