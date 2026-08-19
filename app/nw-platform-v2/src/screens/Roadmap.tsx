/**
 * Roadmap — Studio · Roadmap screen (+ Connect/AllRailz/Vantage "Soon"
 * splash as its linked secondary surface)
 * (design_system_spec.md §5.6; demo_script_draft.md Step 6 "Built now")
 *
 * §2.3's component-inventory summary counts the 7 script screens as
 * "…Studio · Roadmap [+ Connect Soon splash as a linked secondary surface
 * within Step 6]…" — the bracket groups both surfaces under ONE screen
 * entry, matching this dispatch's single `screens/Roadmap.tsx` allowlist
 * file. This screen therefore owns both states:
 *
 *   1. Roadmap (default): RoadmapGantt (C14, phased pipeline, "sprint 1
 *      in progress") → "What's next" SetupCard (C15, `interactive`) row.
 *   2. Soon splash (entered by pressing a "What's next" card): SoonSplash
 *      (C16) for the pressed module, with a Back control to return to 1.
 *
 * AMBIGUITY RESOLVED — Gantt seed data: no engine/data module in this
 * worktree ports the base page's `renderGantt`/`renderPipe` (source lines
 * 1305-1355, 4298-4314 — explicitly OUT of `engine/plan.ts`'s own scope,
 * per that file's header: "renderGantt/renderRegister/renderPipe … out of
 * this dispatch's scope [Roadmap/RoadmapGantt (C14) is a different
 * screen's engine]"). RoadmapGantt (C14) itself takes seed `phases` as a
 * prop and is documented "static per session — no loading state; data is
 * seeded," so this screen supplies that seed directly, ported from the
 * cited read-only source rather than invented from nothing:
 *   - Total sprint count: demo_script_draft.md Step 6 "See" line —
 *     "The 30-sprint phased roadmap with the current sprint visibly
 *     live." Exactly matches C14's own doc-comment example summary
 *     sentence ("e.g. 'Sprint 1 of 30, in progress'").
 *   - Current-sprint claim: survey_map.md — `renderPipe` "hardcoded
 *     'sprint 1 in progress'" (4298-4314) and the Step 6 `say` line
 *     ("Sprint 1 is in progress on that screen right now").
 *   - Three-phase grouping + phase names: source `renderGantt`'s own
 *     `ghy` (group-header) text, ported verbatim — "Year 1 · tactical"
 *     (line 1330), "Year 2 · expansion" (line 1348), "Year 3 · vision"
 *     (line 1351).
 *   The even 10/10/10 sprint split across those three named years is
 *   this screen's own reasonable inference from the source's three-year
 *   structure — the source's own quarterly/play-driven Gantt does not
 *   literally enumerate 30 discrete "sprints," since it recomputes
 *   dynamically off the investment levers rather than showing a fixed
 *   sprint count. Only the total (30) and "sprint 1 in progress" are
 *   verbatim-sourced facts; the per-year split is this dispatch's
 *   construction. STOP-item / flagged for design-authority confirmation
 *   if a different split (or a lever-driven Gantt matching the source's
 *   dynamic behavior) is wanted — that would be new interaction logic
 *   beyond a UI port (D14 scope), consistent with OQ-2's same reasoning
 *   on Investment Design.
 *
 * AMBIGUITY RESOLVED — "What's next" row membership: §5.6's region map
 * names the "Connect" SetupCard as the resolved primary CTA (§6 CTA map)
 * but also explicitly allows "optionally AllRailz/Vantage as additional
 * cards in the same row… (Talon system item 3's entity-level pattern)."
 * This screen includes all three (Connect, AllRailz, Vantage), Connect
 * first — matching the Step 6 `say` line's own ordering ("Connect is
 * next… AllRailz puts agentic banking into production…").
 *
 * FLAGGED — SetupCard has no visual-weight/emphasis prop: §6's CTA map
 * names "Connect" SetupCard specifically as this screen's one primary
 * CTA, but SetupCard (C15, a sibling-dispatch primitive, outside this
 * allowlist) exposes only `title`/`description`/`icon`/`count`/`variant`/
 * `onPress` — no emphasis/weight prop distinguishes "the" primary card
 * from the two optional ones in the same row once AllRailz/Vantage are
 * included per the paragraph above. Building an emphasis variant would
 * require editing SetupCard.tsx, outside this dispatch's allowlist, and
 * the persona directive is to build to a component's spec'd props
 * exactly, not extend a sibling file's contract from here. Connect is
 * rendered first (reading-order primacy) as a partial, non-visual
 * mitigation. STOP-item for design-authority / a future SetupCard
 * emphasis-prop addition.
 *
 * AMBIGUITY RESOLVED — SetupCard `icon` omitted: `data/misc.ts`'s `SOON`
 * entries carry arbitrary Unicode glyphs ('⇄', '≋', '⬡') that don't map
 * onto Icon's (P1) closed `IconName` vocabulary — SetupCard's own file
 * header already flags this exact mismatch as a STOP-item and types its
 * `icon` prop to the real `IconName` contract rather than widening it.
 * This screen leaves `icon` unset on every "What's next" card rather than
 * inventing a mapping table SetupCard's own author did not sanction.
 *
 * AMBIGUITY RESOLVED — SoonSplash `note` prop source: `SoonSplashProps`'s
 * own doc says "Closing summary line (SoonEntry.note / .close). Includes
 * the G4/G9 enforcement-push line… that line is data, supplied by the
 * caller." This screen passes `SoonEntry.note` (not `.close`) — the
 * shorter, closing-summary-shaped field of the two. The G4/G9
 * "enforcement-push" substance itself (Connect: "a policy change becomes
 * a configuration change" / AllRailz: "every workflow reading live policy
 * before it acts") already appears verbatim inside each entry's own
 * `lead` field (also passed through unmodified below), which this screen
 * already renders — satisfying the region-map's G4/G9 citation without
 * any edit to `data/misc.ts` (outside this dispatch's allowlist).
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: identical passthrough
 * pattern to the three sibling screens already landed in this worktree
 * (`Home.tsx`, `BoardDeck.tsx`, `OnSideFeed.tsx`): a full `topbar:
 * TopbarProps` bundle prop, and for Sidebar only `onNavigate` + optional
 * `sidebarVersionLabel` — `activeId` is hardcoded here to
 * `'studio.roadmap'` (`Sidebar.tsx`'s own `NAV` entry id for this screen).
 *
 * Layout constants: same implementer-judgment category as `Home.tsx`'s/
 * `InvestmentDesign.tsx`'s identical header note (design_system_spec.md
 * §1.4 carries no px/spacing values by design).
 *
 * STOP-item — no executable test run: identical to every sibling screen
 * already landed in this worktree (`Home.tsx`, `BoardDeck.tsx`,
 * `OnSideFeed.tsx`, `InvestmentDesign.tsx`) — no test runner is installed
 * in this worktree (`package.json`, out of this dispatch's ALLOWLIST, has
 * `dev`/`build`/`preview` scripts only). Verified via `npx tsc --noEmit`
 * against the whole `src/` tree instead; recommending the same
 * test-tooling follow-up dispatch the sibling screens already recommend.
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { RoadmapGantt } from '../components/RoadmapGantt';
import type { RoadmapPhase, RoadmapSegment, RoadmapSegmentStatus } from '../components/RoadmapGantt';
import { SetupCard } from '../components/SetupCard';
import { SoonSplash } from '../components/SoonSplash';
import type { SoonSplashProps } from '../components/SoonSplash';
import { Button } from '../components/primitives/Button';
import { SOON } from '../data/misc';
import type { SoonEntry } from '../data/misc';

const SPRINTS_PER_YEAR = 10;
const YEAR_LABELS = ['Year 1 · Tactical', 'Year 2 · Expansion', 'Year 3 · Vision'] as const;

/** See file header "AMBIGUITY RESOLVED — Gantt seed data." */
function buildRoadmapPhases(): RoadmapPhase[] {
  let sprintNumber = 0;
  return YEAR_LABELS.map((yearLabel, yearIndex) => {
    const segments: RoadmapSegment[] = Array.from({ length: SPRINTS_PER_YEAR }, () => {
      sprintNumber += 1;
      const status: RoadmapSegmentStatus = sprintNumber === 1 ? 'in-progress' : 'upcoming';
      return { id: `sprint-${sprintNumber}`, label: `Sprint ${sprintNumber}`, status };
    });
    return { id: `year-${yearIndex + 1}`, name: yearLabel, segments };
  });
}

const ROADMAP_PHASES: RoadmapPhase[] = buildRoadmapPhases();

const MODULE_KEYS = ['connect', 'allrailz', 'vantage'] as const;
export type RoadmapModuleKey = (typeof MODULE_KEYS)[number];

const MODULE_ENTRIES: Array<{ key: RoadmapModuleKey; entry: SoonEntry }> = MODULE_KEYS.flatMap((key) => {
  const entry = SOON[key];
  return entry ? [{ key, entry }] : [];
});

/** Maps `data/misc.ts`'s `SoonEntry` onto SoonSplash's own smaller, composite-scoped props (SoonSplash.tsx's own documented adaptation point). */
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
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.75rem',
  maxWidth: 1120,
};
const headerStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const h1Style: CSSProperties = { font: 'inherit', fontSize: '1.625rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };
const ledeStyle: CSSProperties = { font: 'inherit', fontSize: '0.9375rem', color: 'var(--ink2)', margin: 0, maxWidth: 640 };
const sectionStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const sectionHeadingStyle: CSSProperties = { font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };
const setupCardRowStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1rem' };
const backRowStyle: CSSProperties = { display: 'flex' };

export interface RoadmapProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as `Home.tsx`/`BoardDeck.tsx`/`OnSideFeed.tsx`/`InvestmentDesign.tsx`). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('studio.roadmap') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
  /** Testing/override hook — defaults to the ported 30-sprint / 3-year seed (`ROADMAP_PHASES` above; see file header). */
  phases?: RoadmapPhase[];
}

export function Roadmap({ topbar, onNavigate, sidebarVersionLabel, phases = ROADMAP_PHASES }: RoadmapProps) {
  const [activeModule, setActiveModule] = useState<RoadmapModuleKey | null>(null);

  const activeEntry = activeModule ? (MODULE_ENTRIES.find((candidate) => candidate.key === activeModule) ?? null) : null;

  // Built conditionally (rather than `versionLabel={sidebarVersionLabel}`
  // directly) — this project's `exactOptionalPropertyTypes` setting treats
  // Sidebar's optional `versionLabel` as exactly `string`, not `string |
  // undefined` — same pattern `Home.tsx`/`OnSideFeed.tsx` document.
  const sidebarProps: SidebarProps = {
    activeId: 'studio.roadmap',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="roadmap" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="roadmap-main" style={MAIN_STYLE} aria-labelledby="roadmap-title">
          <div style={headerStyle}>
            <h1 id="roadmap-title" style={h1Style}>
              Roadmap
            </h1>
            <p style={ledeStyle}>OnSide v1.0 ships this year — Sprint 1 is in progress on this screen right now. Connect is next.</p>
          </div>

          {activeEntry ? (
            <div style={sectionStyle} data-lf-screen-state="soon-splash">
              <div style={backRowStyle}>
                <Button variant="ghost" icon="chevron-left" label="Back to Roadmap" onPress={() => setActiveModule(null)} />
              </div>
              <SoonSplash {...toSoonSplashProps(activeEntry.entry)} />
            </div>
          ) : (
            <>
              <div style={sectionStyle}>
                <RoadmapGantt phases={phases} />
              </div>

              <div style={sectionStyle}>
                <h2 style={sectionHeadingStyle}>What&rsquo;s next</h2>
                <div style={setupCardRowStyle}>
                  {MODULE_ENTRIES.map(({ key, entry }) => (
                    <SetupCard key={key} title={entry.name} description={entry.tag} variant="interactive" onPress={() => setActiveModule(key)} />
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
