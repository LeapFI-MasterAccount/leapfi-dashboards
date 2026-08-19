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
 * OUT-OF-SCOPE SIDEBAR DESTINATIONS (AMBIGUITY RESOLVED): `Sidebar.tsx`
 * (a sibling dispatch, unmodified here) ships leaf nav items this program's
 * 7 script screens do not cover — OnSide·Ownership, Connect·AllRailz,
 * Connect·Vantage, Reporting, Settings·Toggles, Settings·About.
 * design_system_spec.md §9 explicitly scopes these out ("Reporting...
 * Out of arc"; "Settings... not one of the 7 screens, minimal coverage per
 * scope"; Ownership isn't named in §5 at all; Connect/AllRailz/Vantage's
 * Soon splash is reached only via `Roadmap`'s own Step-6 flow, never via a
 * direct Sidebar click per §5.6). Building real screens for these is
 * outside this dispatch's ALLOWLIST and outside design_system_spec.md's own
 * 7-screen scope. Silently redirecting a Sidebar click on one of these to
 * some other screen would misrepresent what happened (Core Principle 3 —
 * never fabricate a state); this file instead renders `OutOfScopeScreen`, a
 * plain, honestly-labelled placeholder (still inside Topbar+Sidebar shell
 * chrome for wayfinding) rather than a fabricated full screen or a silent
 * no-op. STOP-item if a future dispatch builds real screens for any of
 * these — this file's `default` switch branch is the integration point.
 *
 * NOTIFICATION BELL: `Topbar`'s `notificationCount`/`onOpenNotifications`
 * are both omitted (per `Topbar.tsx`'s own doc: "Omit `onOpenNotifications`
 * if there is nowhere to route the click yet") — no ported dataset in this
 * worktree carries a per-notification shape (`data/onside.ts`'s `DIGEST` is
 * a cadence *setting* object, not a notification list; see
 * `OnSideFeed.tsx`'s identical finding). Fabricating a count with no data
 * anchor would violate Core Principle 3. STOP-item for whichever dispatch
 * ports a real digest/notification feed.
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
 * RESTART / resetDemo SCOPE (AMBIGUITY RESOLVED, §4 "Restarting" state):
 * every one of the 7 screens owns its own mutable demo-state locally
 * (`OnSideDocuments`' adopted redlines, `StudioAsk`'s discovered
 * opportunity, `InvestmentDesign`'s sliders) — each sibling dispatch
 * explicitly deferred *cross-navigation* persistence of that state to
 * "whichever dispatch does true app-shell/routing integration." Because
 * this shell mounts exactly one screen at a time (see above), navigating
 * away from any screen already unmounts it and discards its local state by
 * construction — every revisit to a screen starts fresh, with or without
 * an explicit Restart. `handleRestart` therefore only needs to (1) reset
 * the persona (the one piece of cross-screen state this file itself owns)
 * and (2) navigate to Home, which — via the same unmount mechanism —
 * already clears whatever screen was showing. STOP-item, flagged rather
 * than silently treated as equivalent to the base engine: this differs
 * from the base engine's own persistent-until-`resetDemo()` global state
 * (a presenter navigating away from an adopted redline and back would see
 * it reset here, where the base page would not) — a known port-fidelity
 * gap for a future dispatch that wants cross-navigation persistence, not
 * something this shell's own Restart wiring needs to solve.
 *
 * DEMO_DATE_LABEL: a fixed demo constant ("Friday, August 15, 2026"),
 * matching demo_script_draft.md Step 1's own "See" line and the board
 * deck's "Aug 15, 2026" stamp (§5.7) verbatim — this is the scripted
 * demo's internal fixed date, not a live clock; rendering the real system
 * date here would be the actual violation of Core Principle 3 (a claim the
 * data doesn't back), not the other way around.
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner installed, matching
 * every sibling file already landed here. Verified via `npx tsc --noEmit`
 * against the whole `src/` tree (strict mode, `exactOptionalPropertyTypes`)
 * and `npm run build` (full production build) to confirm this file
 * type-checks and bundles against the real prop shapes of every screen and
 * shell composite it wires together.
 */
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './App.css'
import { Home } from './screens/Home'
import { OnSideFeed } from './screens/OnSideFeed'
import { OnSideDocuments } from './screens/OnSideDocuments'
import { StudioAsk } from './screens/StudioAsk'
import { InvestmentDesign } from './screens/InvestmentDesign'
import { Roadmap } from './screens/Roadmap'
import { BoardDeck } from './screens/BoardDeck'
import { Sidebar } from './components/Sidebar'
import type { SidebarProps } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import type { TopbarBackTarget, TopbarProfileMenuItem, TopbarProps } from './components/Topbar'
import { PresenterRail } from './components/PresenterRail'
import type { PresenterRailHandle } from './components/PresenterRail'
import { Toast } from './components/Toast'
import { Switch } from './components/primitives/Switch'
import { CURRENT, USERS } from './data/studio'
import { DEFAULT_SCRIPT_KEY, resolveTarget, SCRIPTS } from './data/script'

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

/** Every screen id this shell can switch to — the 7 script-navigable ids (data/script.ts `ScriptTargetId`) plus the Sidebar leaf items no script targets. Single source of truth for the `ScreenId` type below. */
const SCREEN_IDS = [
  'home',
  'onside.feed',
  'onside.documents',
  'onside.ownership',
  'studio.ask',
  'studio.investment-design',
  'studio.roadmap',
  'connect.allrailz',
  'connect.vantage',
  'reporting',
  'settings.toggles',
  'settings.about',
  'board-deck',
] as const

type ScreenId = (typeof SCREEN_IDS)[number]

function isScreenId(id: string): id is ScreenId {
  return (SCREEN_IDS as readonly string[]).includes(id)
}

const SCREEN_LABEL: Record<ScreenId, string> = {
  home: 'Home',
  'onside.feed': 'OnSide · Regulatory feed',
  'onside.documents': 'OnSide · Documents',
  'onside.ownership': 'OnSide · Ownership',
  'studio.ask': 'Studio · Ask',
  'studio.investment-design': 'Studio · Investment Design',
  'studio.roadmap': 'Studio · Roadmap',
  'connect.allrailz': 'Connect · AllRailz',
  'connect.vantage': 'Connect · Vantage',
  reporting: 'Reporting',
  'settings.toggles': 'Settings · Toggles',
  'settings.about': 'Settings · About',
  'board-deck': 'Board deck',
}

const SCREEN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  background: 'var(--bg)',
  boxSizing: 'border-box',
}
const BODY_ROW_STYLE: CSSProperties = { display: 'flex', flex: '1 1 auto', minHeight: 0 }
const SIDEBAR_REGION_STYLE: CSSProperties = { flex: '0 0 240px' }
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.75rem',
}
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }
const OUT_OF_SCOPE_NOTE_STYLE: CSSProperties = { margin: 0, maxWidth: '38rem', fontSize: '0.9375rem', color: 'var(--ink2)', lineHeight: 1.5 }
const TOAST_WRAP_STYLE: CSSProperties = { position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 60 }

/** See file header "OUT-OF-SCOPE SIDEBAR DESTINATIONS." */
function OutOfScopeScreen({ topbar, sidebarProps, title }: { topbar: TopbarProps; sidebarProps: SidebarProps; title: string }) {
  return (
    <div data-lf-screen="out-of-scope" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="out-of-scope-main" style={MAIN_STYLE} aria-labelledby="out-of-scope-title">
          <h1 id="out-of-scope-title" style={TITLE_STYLE}>
            {title}
          </h1>
          <p style={OUT_OF_SCOPE_NOTE_STYLE}>
            This module isn&rsquo;t one of the seven screens this build implements yet. It appears in the sidebar because it&rsquo;s part
            of the platform&rsquo;s real navigation shape — the Step 1 full-sidebar gesture shows it exists — but nothing is wired here.
          </p>
        </main>
      </div>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [screenId, setScreenId] = useState<ScreenId>('home')
  const [previousScreenId, setPreviousScreenId] = useState<ScreenId | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>(CURRENT.id)
  const [designPartnerToast, setDesignPartnerToast] = useState(false)
  const presenterRailRef = useRef<PresenterRailHandle>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  function navigateToScreen(id: string): void {
    if (!isScreenId(id)) return
    if (id === screenId) return
    setPreviousScreenId(id === 'home' ? null : screenId)
    setScreenId(id)
  }

  function handleStartDemo(): void {
    presenterRailRef.current?.start()
  }

  function handlePresenterNavigate(target: string): void {
    const resolved = resolveTarget(target)
    if (resolved) navigateToScreen(resolved)
  }

  function handleRestart(): void {
    setCurrentUserId(CURRENT.id)
    navigateToScreen('home')
  }

  function handleDesignPartnerRequest(): void {
    setDesignPartnerToast(true)
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
  }

  function renderActiveScreen(): ReactNode {
    switch (screenId) {
      case 'home':
        return <Home topbar={topbarProps} onNavigate={navigateToScreen} onStartDemo={handleStartDemo} />
      case 'onside.feed':
        return <OnSideFeed topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'onside.documents':
        return <OnSideDocuments topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'studio.ask':
        return <StudioAsk topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'studio.investment-design':
        return <InvestmentDesign topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'studio.roadmap':
        return <Roadmap topbar={topbarProps} onNavigate={navigateToScreen} />
      case 'board-deck':
        return <BoardDeck topbar={topbarProps} onDesignPartnerRequest={handleDesignPartnerRequest} />
      default:
        return (
          <OutOfScopeScreen
            topbar={topbarProps}
            sidebarProps={{ activeId: screenId, onNavigate: navigateToScreen }}
            title={SCREEN_LABEL[screenId]}
          />
        )
    }
  }

  return (
    <>
      {renderActiveScreen()}
      <PresenterRail ref={presenterRailRef} script={ACTIVE_SCRIPT} onNavigate={handlePresenterNavigate} onRestart={handleRestart} />
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
    </>
  )
}

export default App
