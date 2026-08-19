/**
 * RoadmapGantt — Composite C14 (design_system_spec.md §2.2)
 *
 * Built from: bar-chart primitives (chart tokens §1.1). No variants.
 * Composite state: `loaded` only — "static per session, no loading
 * state; data is seeded" (spec). This component therefore has no
 * loading/empty branch: it always renders whatever `phases` it is
 * given, matching the ported `renderGantt`/`renderPipe` engine's own
 * seeded-data assumption (survey_map.md 4298–4314, 1305–55, cited by
 * spec §9).
 *
 * a11y baseline (spec C14): "Current/'in progress' segment is marked in
 * text (not fill color alone); chart region has an accessible summary
 * (e.g. 'Sprint 1 of 30, in progress') for non-visual access."
 *
 * Implementation of that baseline: the colored bar visualization itself
 * is `aria-hidden` (pure decoration — color/position convey nothing a
 * screen reader user needs that isn't restated as text), while every
 * phase name, segment label, and status word is real, unhidden text in
 * the accessible tree, plus a summary sentence computed from the seeded
 * data (spec's own example phrasing: "Sprint n of total, in progress").
 * This is the stronger reading of "accessible summary" — a real
 * sentence available to assistive tech, not merely a short `aria-label`
 * standing in for the whole chart.
 *
 * Token use: categorical tokens (`--cat-1`…`--cat-6`, §1.1) color each
 * phase's bar (cycling if there are more than 6 phases); the
 * in-progress segment additionally gets an `--accent` outline plus an
 * inline status word so its meaning never depends on the categorical
 * fill alone (brand_doctrine.md Accessibility: "never rely on color
 * alone" — cited throughout §2.1/§2.2 for every status-bearing
 * primitive/composite).
 */
import type { CSSProperties } from 'react';

export type RoadmapSegmentStatus = 'complete' | 'in-progress' | 'upcoming';

export interface RoadmapSegment {
  id: string;
  /** e.g. "Sprint 1". */
  label: string;
  status: RoadmapSegmentStatus;
}

export interface RoadmapPhase {
  id: string;
  name: string;
  segments: RoadmapSegment[];
}

export interface RoadmapGanttProps {
  phases: RoadmapPhase[];
  /** Overrides the computed accessible summary sentence, if supplied. */
  summary?: string;
}

const CAT_TOKENS = ['--cat-1', '--cat-2', '--cat-3', '--cat-4', '--cat-5', '--cat-6'];

const STATUS_WORD: Record<RoadmapSegmentStatus, string> = {
  complete: 'Complete',
  'in-progress': 'In progress',
  upcoming: 'Upcoming',
};

function computeSummary(phases: RoadmapPhase[]): string {
  const allSegments = phases.flatMap((phase) => phase.segments);
  const total = allSegments.length;
  const currentIndex = allSegments.findIndex((segment) => segment.status === 'in-progress');

  if (total === 0) {
    return 'Roadmap: no phases seeded.';
  }
  if (currentIndex === -1) {
    return `Roadmap: ${total} sprint${total === 1 ? '' : 's'} total, none currently in progress.`;
  }
  const current = allSegments[currentIndex];
  return `Sprint ${currentIndex + 1} of ${total}, in progress${current ? ` (${current.label})` : ''}.`;
}

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const PHASE_LABEL_STYLE: CSSProperties = {
  flex: '0 0 auto',
  width: '9rem',
  font: 'inherit',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--ink)',
};

const BAR_TRACK_STYLE: CSSProperties = {
  flex: '1 1 auto',
  display: 'flex',
  gap: 2,
  height: 20,
  borderRadius: 'var(--radius-xs, 4px)',
  overflow: 'hidden',
  background: 'var(--chart-panel)',
  border: '1px solid var(--chart-grid)',
};

function segmentStyle(status: RoadmapSegmentStatus, catToken: string): CSSProperties {
  if (status === 'upcoming') {
    return { flex: '1 1 0', background: 'var(--chart-grid)' };
  }
  return {
    flex: '1 1 0',
    background: `var(${catToken})`,
    opacity: status === 'complete' ? 0.55 : 1,
    outline: status === 'in-progress' ? '2px solid var(--accent)' : 'none',
    outlineOffset: status === 'in-progress' ? -2 : undefined,
  };
}

export function RoadmapGantt({ phases, summary }: RoadmapGanttProps) {
  const summaryText = summary ?? computeSummary(phases);

  return (
    <figure data-lf-composite="roadmap-gantt" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ font: 'inherit', fontSize: '0.875rem', color: 'var(--ink2)', margin: 0 }}>{summaryText}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {phases.map((phase, phaseIndex) => {
          const catToken = CAT_TOKENS[phaseIndex % CAT_TOKENS.length] ?? '--cat-1';
          const currentSegment = phase.segments.find((segment) => segment.status === 'in-progress');

          return (
            <div key={phase.id} data-lf-composite="roadmap-gantt-phase" style={ROW_STYLE}>
              <span style={PHASE_LABEL_STYLE}>{phase.name}</span>

              <div aria-hidden="true" style={BAR_TRACK_STYLE}>
                {phase.segments.map((segment) => (
                  <div key={segment.id} title={`${segment.label} — ${STATUS_WORD[segment.status]}`} style={segmentStyle(segment.status, catToken)} />
                ))}
              </div>

              <span style={{ flex: '0 0 auto', font: 'inherit', fontSize: '0.75rem', color: currentSegment ? 'var(--accent)' : 'var(--ink3)', minWidth: '8rem', textAlign: 'right' }}>
                {currentSegment ? `${currentSegment.label} · In progress` : `${phase.segments.length} sprint${phase.segments.length === 1 ? '' : 's'}`}
              </span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
