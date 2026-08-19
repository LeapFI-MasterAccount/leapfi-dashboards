/**
 * Roadmap — Studio · Roadmap screen (+ Connect/AllRailz/Vantage "Soon"
 * splash as its linked secondary surface)
 * (design_system_spec.md §5.6; demo_script_draft.md Step 6 "Built now")
 *
 * §2.3's component-inventory summary counts the 7 script screens as
 * "…Studio · Roadmap [+ Connect Soon splash as a linked secondary surface
 * within Step 6]…" — the bracket groups both surfaces under ONE screen
 * entry.
 *
 * SOON SPLASH IS NOW A ROUTED SCREEN (fix-wave gate dispatch —
 * STU-12/SH-4/RAIL-06; supersedes this header's earlier "owns both
 * states" reading, under which pressing a "What's next" card swapped this
 * screen's main region to an inline SoonSplash and UNMOUNTED the card row
 * — so AllRailz and Vantage were not visible beneath the open Connect
 * splash, violating demo_script_draft.md Step 6's Do line ("…with
 * AllRailz and Vantage visible as the remaining locked modules beneath
 * it") at the exact close-arc beat — STU-12 CONFIRMED): the splash
 * surface lives in `screens/ConnectSoon.tsx` (§5.6's own anatomy: Topbar
 * → Sidebar → module title → SoonSplash C16, with the remaining locked
 * modules visible beneath), routed by `App.tsx` under the ScreenIds
 * `connect` / `connect.allrailz` / `connect.vantage`. Each "What's next"
 * SetupCard now navigates there via the `onNavigate` prop this screen
 * already receives — §5.6's Exit row ("'Connect' SetupCard → Connect Soon
 * splash") unchanged in effect, and this screen keeps exactly one state.
 *
 * LIVE GANTT (fix-wave STU-11, replacing the earlier fabricated
 * 30-generic-"Sprint N" static seed): the base Gantt is LEVER-DRIVEN
 * (renderGantt, leapfi-platform.html:1305-1355, called from recompute()
 * on every lever change) — funded plays chipped into Year-1 quarters,
 * Year-2/3 queues derived from bench/gated + the Unified-data-foundation
 * dependency spine, and a 4-tile KPI row (rm-kpis, 1308-1312). This
 * screen now derives all of that from `demoStore.computeLivePlan()` on
 * every render (live levers + live opportunity pool, incl. Discovery-
 * accepted plays), ported from the base verbatim:
 *   - rm-kpis (1308-1312): Year 1 investment / Annual value at adoption /
 *     Expected 3-yr ROI vs hurdle / Blended payback.
 *   - Year 1 ordering (1314-1317): foundational first, then cost/value
 *     ratio; chipped into 4 quarters, per = ceil(n/4) (1318-1319), each
 *     chip carrying build/value-at-adoption/payback (1321-1326), with the
 *     per-quarter spend and cumulative run-rate markers (1330-1337).
 *   - Year 2 (1341-1346): bench + the gated plays that depend on the
 *     Unified data foundation (the "spine"), UDF sorted first, each chip
 *     noting what it waits on; the UDF link line between the years.
 *   - Year 3 (1347-1351): the remaining gated plays, noting their first
 *     two gating control families.
 *   - Year group headers verbatim: "Year 1 · tactical" (1330), "Year 2 ·
 *     expansion" (1348), "Year 3 · vision" (1351).
 * RoadmapGantt (C14) renders the bar visualization from the same derived
 * play segments (one segment per play; the first Year-1 segment is
 * 'in-progress' — renderPipe's hardcoded "sprint 1 in progress" fact,
 * 4298-4314 / Step 6 say line); the play-chip detail is this screen's own
 * markup beneath it, same "drop-in real markup, no new composite"
 * approach InvestmentDesign's side lists already use. Known residual:
 * RoadmapGantt's phase-trailing count text says "N sprints" (component-
 * owned wording, out of this dispatch's allowlist); the screen's own
 * chip rows directly below carry the correct play semantics.
 *
 * PLAY CHIPS OPEN FULL SCOPE (fix B-dead-interactions-04): every play chip
 * across all three years now honors the Year-1 note's own shipped copy —
 * "Click one for full scope." (`yearNoteStyle`, base leapfi-platform.html
 * gantt chips `data-play` at 1324, delegated click on `gantt-body` →
 * `openPlay`, 4493-4499) — as a real `<button>`, not the plain `<div>` it
 * was. This screen mounts no Drawer of its own (matching
 * `InvestmentDesign.tsx`'s "Drawer instance ownership" note — a single
 * screen-local Drawer instance, never duplicated), so a chip press fires
 * `onDeepLink({ screen: 'studio.investment-design', kind: 'play', id })`
 * via the nav-payload mechanism (App.tsx file header "NAVIGATION-WITH-
 * PAYLOAD / DEEP LINKS") — the presenter lands on Investment Design with
 * that exact play's full drawer already open, the nearest twin-shaped
 * equivalent to the base's single global overlay.
 *
 * AMBIGUITY RESOLVED — "What's next" row membership: §5.6's region map
 * names the "Connect" SetupCard as the resolved primary CTA (§6 CTA map)
 * but also explicitly allows "optionally AllRailz/Vantage as additional
 * cards in the same row… (Talon system item 3's entity-level pattern)."
 * This screen includes all three (Connect, AllRailz, Vantage), Connect
 * first — matching the Step 6 `say` line's own ordering.
 *
 * FLAGGED — SetupCard has no visual-weight/emphasis prop: §6's CTA map
 * names "Connect" SetupCard specifically as this screen's one primary
 * CTA, but SetupCard (C15, outside this allowlist) exposes no emphasis
 * prop. Connect is rendered first (reading-order primacy) as a partial,
 * non-visual mitigation. STOP-item for design-authority / a future
 * SetupCard emphasis-prop addition.
 *
 * AMBIGUITY RESOLVED — SetupCard `icon` omitted: `data/misc.ts`'s `SOON`
 * entries carry arbitrary Unicode glyphs that don't map onto Icon's (P1)
 * closed `IconName` vocabulary — left unset rather than inventing a
 * mapping table SetupCard's own author did not sanction.
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: identical
 * passthrough pattern to the sibling screens (`Home.tsx`, `BoardDeck.tsx`,
 * `OnSideFeed.tsx`): a full `topbar: TopbarProps` bundle prop, and for
 * Sidebar only `onNavigate` + optional `sidebarVersionLabel` — `activeId`
 * hardcoded to `'studio.roadmap'`.
 *
 * Layout constants: same implementer-judgment category as `Home.tsx`'s/
 * `InvestmentDesign.tsx`'s identical header note (design_system_spec.md
 * §1.4 carries no px/spacing values by design).
 *
 * Tests: src/__tests__/studio/roadmap.test.tsx executes this screen
 * against the base anchors above (vitest + @testing-library).
 */
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { RoadmapGantt } from '../components/RoadmapGantt';
import type { RoadmapPhase, RoadmapSegment } from '../components/RoadmapGantt';
import { SetupCard } from '../components/SetupCard';
import { SOON } from '../data/misc';
import type { SoonEntry } from '../data/misc';
import { DETAIL } from '../data/studio';
import { fmt } from '../engine/plan';
import type { PlanOpportunity, PlanResult } from '../engine/plan';
import { computeLivePlan, useDemoStore } from '../state/demoStore';
import type { DeepLinkScreenProps } from '../App';

/** One play chip in a year row/quarter — base `chip()` (1321-1326). */
interface PlayChip {
  play: PlanOpportunity;
  /** The chip's third line: economics for Year 1 (base 1325), a waits-on note for Years 2/3 (base 1345/1350). */
  note: string;
}

interface QuarterColumn {
  label: string;
  spendText: string;
  chips: PlayChip[];
  /** Cumulative run-rate marker (base 1336): "≈ $X/yr running by end of QN" or the empty-capacity line. */
  marker: string;
}

interface YearView {
  name: string;
  /** Base `gs` group-header status text (1330/1348/1351). */
  status: string;
  quarters?: QuarterColumn[];
  chips?: PlayChip[];
}

interface RoadmapDerivation {
  plan: PlanResult;
  phases: RoadmapPhase[];
  years: YearView[];
  /** Base glink UDF line between Year 1 and Year 2 (1340), or null when no spine exists. */
  foundationLink: string | null;
  summary: string;
  kpis: Array<{ label: string; value: string; sub: string }>;
}

/**
 * Port of renderGantt's derivations (leapfi-platform.html:1306-1355) from
 * the LIVE plan — see file header "LIVE GANTT."
 */
function deriveRoadmap(): RoadmapDerivation {
  const P = computeLivePlan();
  const L = P.L;

  // Base 1314-1317: Year 1 = funded, foundational first, then cost/value.
  const y1 = [...P.funded].sort((a, b) => {
    const f = (b.found ? 1 : 0) - (a.found ? 1 : 0);
    if (f) return f;
    return a.cost / (a.val || 1) - b.cost / (b.val || 1);
  });

  // Base 1318-1319: chip into 4 quarters, per = ceil(n/4).
  const per = Math.ceil(y1.length / 4) || 1;
  const quarterPlays: PlanOpportunity[][] = [[], [], [], []];
  y1.forEach((o, i) => {
    quarterPlays[Math.min(3, Math.floor(i / per))]?.push(o);
  });

  let cum = 0;
  const quarters: QuarterColumn[] = quarterPlays.map((plays, q) => {
    let spend = 0;
    let value = 0;
    plays.forEach((o) => {
      spend += o.cost;
      value += o.val * L.eff;
    });
    cum += value;
    return {
      label: `Q${q + 1}`,
      spendText: plays.length ? fmt(spend) : '·',
      chips: plays.map((o) => ({
        play: o,
        // Base 1325: cost · value at adoption · per-play payback.
        note: `${fmt(o.cost)} build · ${fmt(o.val * L.eff)}/yr · payback ${Math.round((o.cost / (o.val * L.eff)) * 12)} mo`,
      })),
      marker: cum > 0 ? `≈ ${fmt(cum)}/yr running by end of Q${q + 1}` : 'Capacity held for scoping',
    };
  });

  // Base 1339-1343: Year 2 = bench + the gated plays depending on the
  // Unified data foundation (the spine), UDF first; Year 3 = the rest.
  const spine = P.gated.filter((o) => (DETAIL[o.n]?.deps ?? []).includes('Unified data foundation'));
  const y2 = [...P.bench, ...spine].sort(
    (a, b) => (b.n === 'Unified data foundation' ? 1 : 0) - (a.n === 'Unified data foundation' ? 1 : 0),
  );
  const y3 = P.gated.filter((o) => !spine.includes(o));
  const udfY1 = P.funded.some((o) => o.n === 'Unified data foundation');

  const y2Chips: PlayChip[] = y2.map((o) => ({
    play: o,
    // Base 1345 chip note.
    note: `${fmt(o.cost)} est · ${
      o.n === 'Unified data foundation'
        ? 'leads the year · first call on the envelope'
        : spine.includes(o)
          ? 'unlocked by the data foundation'
          : 'waits on budget headroom'
    }`,
  }));
  const y3Chips: PlayChip[] = y3.map((o) => ({
    play: o,
    // Base 1350 chip note.
    note: `${fmt(o.cost)} est · waits on ${o.g.length ? o.g.slice(0, 2).join(', ') : 'Year 1 results'}`,
  }));

  // Base 1340: the UDF link line between the years.
  const foundationLink = spine.length
    ? udfY1
      ? 'The Unified data foundation lands in Year 1 and unlocks the Year 2 sequence'
      : 'The Unified data foundation leads Year 2 · the plays that depend on it sequence behind it'
    : null;

  const years: YearView[] = [
    {
      // Base group headers verbatim: 1330 / 1348 / 1351.
      name: 'Year 1 · tactical',
      status: `${P.funded.length} plays · ${fmt(P.spent)} committed · sequenced by your horizon lever`,
      quarters,
    },
    {
      name: 'Year 2 · expansion',
      status: `${y2.length} plays queued · firms up as Year 1 lands`,
      chips: y2Chips,
    },
    {
      name: 'Year 3 · vision',
      status: `${y3.length} plays · direction the board can steer`,
      chips: y3Chips,
    },
  ];

  // Bar segments for RoadmapGantt: one per play; the first Year-1 segment
  // is in progress (renderPipe's "sprint 1 in progress" fact, 4298-4314).
  const toSegments = (plays: PlanOpportunity[], year: number): RoadmapSegment[] =>
    plays.map((o, i) => ({
      id: `y${year}-${o.n}`,
      label: o.n,
      status: year === 1 && i === 0 ? 'in-progress' : 'upcoming',
    }));
  const phases: RoadmapPhase[] = [
    { id: 'year-1', name: 'Year 1 · tactical', segments: toSegments(y1, 1) },
    { id: 'year-2', name: 'Year 2 · expansion', segments: toSegments(y2, 2) },
    { id: 'year-3', name: 'Year 3 · vision', segments: toSegments(y3, 3) },
  ];

  // Base rm-kpis (1308-1312), verbatim text.
  const kpis = [
    {
      label: 'Year 1 investment',
      value: fmt(P.spent),
      sub: `of ${fmt(L.budget)} envelope · ${P.funded.length} plays funded`,
    },
    {
      label: 'Annual value',
      value: fmt(P.annual),
      sub: `at ${Math.round(L.eff * 100)}% adoption, full ramp`,
    },
    {
      label: 'Expected 3-yr ROI',
      value: `${P.roi.toFixed(1)}×`,
      sub: `${P.roi >= L.roiTgt ? 'clears' : 'below'} your ${L.roiTgt.toFixed(1)}× hurdle`,
    },
    {
      label: 'Blended payback',
      value: P.payM ? `${P.payM} mo` : '·',
      sub: 'across the funded portfolio',
    },
  ];

  const summary = `${P.funded.length} plays funded in Year 1 · ${fmt(P.spent)} committed · sequenced by your horizon lever · Sprint 1 in progress.`;

  return { plan: P, phases, years, foundationLink, summary, kpis };
}

const MODULE_KEYS = ['connect', 'allrailz', 'vantage'] as const;
export type RoadmapModuleKey = (typeof MODULE_KEYS)[number];

const MODULE_ENTRIES: Array<{ key: RoadmapModuleKey; entry: SoonEntry }> = MODULE_KEYS.flatMap((key) => {
  const entry = SOON[key];
  return entry ? [{ key, entry }] : [];
});

/** Card key → `App.tsx` ScreenId for the routed §5.6 Soon-splash surface (see file header "SOON SPLASH IS NOW A ROUTED SCREEN"). */
const MODULE_SCREEN_ID: Record<RoadmapModuleKey, string> = {
  connect: 'connect',
  allrailz: 'connect.allrailz',
  vantage: 'connect.vantage',
};

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
const sectionStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const sectionHeadingStyle: CSSProperties = { font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };
const setupCardRowStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1rem' };

const kpiRowStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: '0.75rem' };
const kpiCardStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md, 10px)',
  background: 'var(--panel)',
  padding: '0.875rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};
const kpiLabelStyle: CSSProperties = { fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink2)', fontWeight: 700 };
const kpiValueStyle: CSSProperties = { fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)' };
const kpiSubStyle: CSSProperties = { fontSize: '0.75rem', color: 'var(--ink2)' };

const yearBlockStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const yearHeaderStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.625rem' };
const yearNameStyle: CSSProperties = { fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };
const yearStatusStyle: CSSProperties = { fontSize: '0.75rem', color: 'var(--ink2)' };
const quarterGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' };
const quarterColStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md, 10px)',
  background: 'var(--panel)',
  padding: '0.625rem 0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};
const quarterHeadStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink2)', fontWeight: 700 };
const chipStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm, 6px)',
  background: 'var(--bg)',
  padding: '0.5rem 0.625rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
};
const chipNameStyle: CSSProperties = { fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink)' };
const chipCatStyle: CSSProperties = { fontSize: '0.6875rem', color: 'var(--ink2)' };
const chipNoteStyle: CSSProperties = { fontSize: '0.75rem', color: 'var(--ink2)' };
const quarterMarkerStyle: CSSProperties = { fontSize: '0.6875rem', color: 'var(--ink2)', marginTop: 'auto' };
const chipRowStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))', gap: '0.625rem' };
const foundationLinkStyle: CSSProperties = { fontSize: '0.75rem', color: 'var(--ink2)', margin: 0, textAlign: 'center' };

/** Fix B-dead-interactions-04: a real, keyboard-operable button (base
 * `data-play` chip, gantt delegated click → `openPlay`) rather than a
 * plain `<div>` — see file header "PLAY CHIPS OPEN FULL SCOPE." */
const chipButtonStyle: CSSProperties = { ...chipStyle, width: '100%', textAlign: 'left', font: 'inherit', cursor: 'pointer' };

function PlayChipCard({ chip, onOpenPlay }: { chip: PlayChip; onOpenPlay: (name: string) => void }) {
  return (
    <button type="button" style={chipButtonStyle} onClick={() => onOpenPlay(chip.play.n)}>
      <span style={chipNameStyle}>
        {chip.play.n}
        {chip.play.found ? ' · foundational' : ''}
        {chip.play.disc ? ' · from Discovery' : ''}
      </span>
      <span style={chipCatStyle}>{chip.play.c}</span>
      <span style={chipNoteStyle}>{chip.note}</span>
    </button>
  );
}

export interface RoadmapProps extends DeepLinkScreenProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as `Home.tsx`/`BoardDeck.tsx`/`OnSideFeed.tsx`/`InvestmentDesign.tsx`). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('studio.roadmap') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
}

export function Roadmap({ topbar, onNavigate, onDeepLink, sidebarVersionLabel }: RoadmapProps) {
  // Re-derives the Gantt from the LIVE plan on every store write (lever
  // changes, Discovery accepts) — base recompute() calls renderGantt(P)
  // on every input (1302; fix-wave STU-11).
  useDemoStore();
  const roadmap = deriveRoadmap();

  /** Fix B-dead-interactions-04 — see file header "PLAY CHIPS OPEN FULL
   * SCOPE." */
  const handleOpenPlay = (name: string) => {
    onDeepLink?.({ screen: 'studio.investment-design', kind: 'play', id: name });
  };

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
          </div>

          {/* Base rm-kpis row (1308-1312), live-derived. */}
          <div style={kpiRowStyle} role="group" aria-label="Roadmap economics">
            {roadmap.kpis.map((kpi) => (
              <div key={kpi.label} style={kpiCardStyle}>
                <span style={kpiLabelStyle}>{kpi.label}</span>
                <span style={kpiValueStyle}>{kpi.value}</span>
                <span style={kpiSubStyle}>{kpi.sub}</span>
              </div>
            ))}
          </div>

          <div style={sectionStyle}>
            <RoadmapGantt phases={roadmap.phases} summary={roadmap.summary} />
          </div>

          {/* Per-year play placement — base renderGantt's chip layout
              (1321-1351), this screen's own markup. */}
          {roadmap.years.map((year, index) => (
            <div key={year.name} style={yearBlockStyle}>
              {index === 1 && roadmap.foundationLink ? <p style={foundationLinkStyle}>▾ {roadmap.foundationLink} ▾</p> : null}
              <div style={yearHeaderStyle}>
                <h2 style={yearNameStyle}>{year.name}</h2>
                <span style={yearStatusStyle}>{year.status}</span>
              </div>
              {year.quarters ? (
                <div style={quarterGridStyle}>
                  {year.quarters.map((quarter) => (
                    <div key={quarter.label} style={quarterColStyle}>
                      <div style={quarterHeadStyle}>
                        <span>{quarter.label}</span>
                        <span>{quarter.spendText}</span>
                      </div>
                      {quarter.chips.map((chip) => (
                        <PlayChipCard key={chip.play.n} chip={chip} onOpenPlay={handleOpenPlay} />
                      ))}
                      <span style={quarterMarkerStyle}>{quarter.marker}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {year.chips ? (
                <div style={chipRowStyle}>
                  {year.chips.length ? (
                    year.chips.map((chip) => <PlayChipCard key={chip.play.n} chip={chip} onOpenPlay={handleOpenPlay} />)
                  ) : (
                    <span style={chipNoteStyle}>{index === 1 ? 'Opens as controls close' : 'Shaped by Year 1 results'}</span>
                  )}
                </div>
              ) : null}
            </div>
          ))}

          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>What&rsquo;s next</h2>
            <div style={setupCardRowStyle}>
              {MODULE_ENTRIES.map(({ key, entry }) => (
                <SetupCard
                  key={key}
                  title={entry.name}
                  description={entry.tag}
                  variant="interactive"
                  // §5.6 Exit row — navigates to the routed Soon-splash
                  // screen (see file header "SOON SPLASH IS NOW A ROUTED
                  // SCREEN"; STU-12).
                  onPress={() => onNavigate(MODULE_SCREEN_ID[key])}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
