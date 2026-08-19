/**
 * ConnectSoon — the Connect / AllRailz / Vantage "Soon" splash screen
 * (design_system_spec.md §5.6 secondary surface; demo_script_draft.md
 * Step 6 Do/See lines; fix-wave gate SH-4 / RAIL-06 / STU-12)
 *
 * One screen file hosting all three locked platform modules, selected by
 * `moduleKey` — the base page's own "soon-module page system (identical
 * across Connect · AllRailz · Vantage)" comment (leapfi-platform.html CSS
 * 708–736) is explicit that these three pages are one template over the
 * `SOON` data records (base 3735–3769, ported verbatim in `data/misc.ts`;
 * base `renderSoon` 3780–3793 renders whichever module `go()` lands on).
 *
 * WHY THIS SCREEN EXISTS (SH-4/RAIL-06): the base sidebar routes
 * `go('connect')` / `go('allrailz')` / `go('vantage')` (source 803,
 * 814–815) to the full in-fiction module splash — it never shows a
 * placeholder on a direct sidebar click. The twin previously routed
 * `connect.allrailz`/`connect.vantage` to `App.tsx`'s `OutOfScopeScreen`,
 * whose copy narrated the build program itself ("the seven screens this
 * build implements", "the Step 1 full-sidebar gesture") to the audience —
 * exactly the demo-scaffolding fiction break D18's rationale forbids, at
 * the exact click demo_script_draft.md Step 6 directs ("click Connect in
 * the sidebar to land on its 'Soon' splash"). An earlier `App.tsx` header
 * attributed a "reached only via Roadmap, never via a direct Sidebar
 * click" disposition to §5.6; §5.6 contains no such sentence (SH-4
 * CONFIRMED). This screen is the §5.6 anatomy, routed from the sidebar.
 *
 * Region map (§5.6 "Connect / AllRailz / Vantage Soon splash"): Topbar →
 * module title → SoonSplash (C16: SetupCard `locked` ×N + explanatory
 * copy, incl. the G4/G9 enforcement-push line inside each entry's own
 * `lead`/`note` data). Components used per spec: Topbar, Sidebar,
 * SoonSplash (C16), SetupCard (C15, `locked`). **Primary CTA: none** —
 * "locked preview, nothing to action yet"; a design-partner CTA would
 * collide with Step 7's closing ask (G12), so this surface is
 * deliberately action-free.
 *
 * SIBLING MODULES ROW (STU-12; demo_script_draft.md Step 6): the Do line
 * requires landing on the Connect splash "with AllRailz and Vantage
 * visible as the remaining locked modules beneath it", and the See line's
 * "platform visibly bigger than what was just demoed" depends on that
 * stacked-modules visual. The previous home of this surface (an
 * either/or swap inside `Roadmap.tsx`) unmounted the sibling cards the
 * moment the splash opened — STU-12 CONFIRMED. Here the remaining two
 * modules render beneath the active module's splash as `locked`
 * SetupCards (name + tagline from the same `SOON` records), in the fixed
 * Connect → AllRailz → Vantage say-line order. This row is additive
 * versus the base page (the base shows siblings only in its sidebar) —
 * required by the script's own Step 6 wording, data-sourced, no invented
 * copy.
 *
 * KNOWN C16 RESIDUAL (pre-existing, `SoonSplash.tsx`'s own header):
 * `SoonEntry.stats` ("What it delivers") and `.cmp`/`.close` ("What
 * changes", base renderSoon 3785–3791) have no named component in §2.2's
 * C16 row, so SoonSplash renders neither — that STOP-item remains with
 * the design authority; this routing fix neither widens nor resolves it.
 *
 * AMBIGUITY RESOLVED — Sidebar `activeId`: intrinsic to `moduleKey`
 * (`'connect'` / `'connect.allrailz'` / `'connect.vantage'`), hardcoded
 * per the same rationale as every sibling screen. For `'connect'` no
 * sidebar row highlights (the Connect group header is a toggle, not a
 * leaf); the group ships `defaultExpanded`, so AllRailz and Vantage stay
 * visible in the sidebar per §3.1's Step-1-gesture rationale.
 *
 * Layout constants: same implementer-judgment category as `Home.tsx`'s /
 * `Roadmap.tsx`'s identical header note (design_system_spec.md §1.4
 * carries no px/spacing values by design).
 *
 * Tests: `src/__tests__/shell/connect-soon.test.tsx` (vitest) pins the
 * sidebar routing, the absence of the out-of-scope meta copy, and the
 * sibling-modules row.
 */
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { SoonSplash } from '../components/SoonSplash';
import type { SoonSplashProps } from '../components/SoonSplash';
import { SetupCard } from '../components/SetupCard';
import { SOON } from '../data/misc';
import type { SoonEntry } from '../data/misc';

/** Fixed module order — demo_script_draft.md Step 6 say-line ordering (Connect → AllRailz → Vantage), same as `Roadmap.tsx`'s card row. */
const MODULE_ORDER = ['connect', 'allrailz', 'vantage'] as const;
export type ConnectModuleKey = (typeof MODULE_ORDER)[number];

/** Sidebar `activeId` + short page title per module (SCREEN_LABEL's own last segment; the branded full name lives in the SoonSplash heading). */
const MODULE_META: Record<ConnectModuleKey, { activeId: string; title: string }> = {
  connect: { activeId: 'connect', title: 'Connect' },
  allrailz: { activeId: 'connect.allrailz', title: 'AllRailz' },
  vantage: { activeId: 'connect.vantage', title: 'Vantage' },
};

const MODULE_ENTRIES: Array<{ key: ConnectModuleKey; entry: SoonEntry }> = MODULE_ORDER.flatMap((key) => {
  const entry = SOON[key];
  return entry ? [{ key, entry }] : [];
});

/** Maps `data/misc.ts`'s `SoonEntry` onto SoonSplash's composite-scoped props (SoonSplash.tsx's own documented adaptation point; identical mapping previously hosted by `Roadmap.tsx`). */
function toSoonSplashProps(entry: SoonEntry): SoonSplashProps {
  return {
    moduleName: entry.name,
    tagline: entry.tag,
    phase: entry.phase,
    lead: entry.lead,
    steps: entry.steps.map((title) => ({ title })),
    note: entry.note,
  };
}

const SCREEN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  background: 'var(--bg)',
  boxSizing: 'border-box',
};
const BODY_ROW_STYLE: CSSProperties = { display: 'flex', flex: '1 1 auto', minHeight: 0 };
const SIDEBAR_REGION_STYLE: CSSProperties = { flex: '0 0 240px' };
// `position: 'relative'` makes this scrolling region the containing
// block for any absolutely-positioned descendant (sr-only spans today,
// third-party overlays tomorrow) so an unpinned absolute box resolves
// inside the scroll context instead of against the document root —
// see the invariant note on DataTable.tsx's `srOnlyStyle`.
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  position: 'relative',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.75rem',
  maxWidth: 1120,
};
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const SIBLING_SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 720 };
const SIBLING_HEADING_STYLE: CSSProperties = { font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };
const SIBLING_ROW_STYLE: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1rem' };

export interface ConnectSoonProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as every sibling screen). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to `moduleKey` and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  /** Which locked module this render shows — the remaining two render beneath it (see file header "SIBLING MODULES ROW"). */
  moduleKey: ConnectModuleKey;
  sidebarVersionLabel?: string;
}

export function ConnectSoon({ topbar, onNavigate, moduleKey, sidebarVersionLabel }: ConnectSoonProps) {
  const active = MODULE_ENTRIES.find((candidate) => candidate.key === moduleKey) ?? null;
  const siblings = MODULE_ENTRIES.filter((candidate) => candidate.key !== moduleKey);
  const meta = MODULE_META[moduleKey];

  // Built conditionally — `exactOptionalPropertyTypes`; same pattern as
  // `Home.tsx`/`Roadmap.tsx` document.
  const sidebarProps: SidebarProps = {
    activeId: meta.activeId,
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="connect-soon" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="connect-soon-main" style={MAIN_STYLE} aria-labelledby="connect-soon-title">
          <h1 id="connect-soon-title" style={TITLE_STYLE}>
            {meta.title}
          </h1>
          {active ? <SoonSplash {...toSoonSplashProps(active.entry)} /> : null}
          {siblings.length > 0 ? (
            // Script Step 6: "the remaining locked modules beneath it" —
            // see file header "SIBLING MODULES ROW."
            <section style={SIBLING_SECTION_STYLE} aria-labelledby="connect-soon-siblings">
              <h2 id="connect-soon-siblings" style={SIBLING_HEADING_STYLE}>
                More of the platform
              </h2>
              <div style={SIBLING_ROW_STYLE}>
                {siblings.map(({ key, entry }) => (
                  <SetupCard key={key} title={entry.name} description={entry.tag} variant="locked" />
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
