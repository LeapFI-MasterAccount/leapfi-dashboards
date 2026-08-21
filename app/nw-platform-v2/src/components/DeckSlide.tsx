/**
 * DeckSlide — Composite C19 (design_system_spec.md §2.2)
 *
 * Built from: StatCard(s) (C1) / Label (P3) / Icon (P1) composition per
 * slide content. Variants: `economics`, `generic`. A11y baseline: "Each
 * slide has one accessible heading."
 *
 * Cross-composite reference: `StatCard` (C1) is a sibling composite
 * outside this dispatch's allowlist (ALLOWLIST covers RoadmapGantt,
 * SetupCard, SoonSplash, DeckView, DeckSlide, Toast only — not StatCard).
 * A concurrent sibling dispatch landed `./StatCard.tsx` in this worktree
 * while this file was being written; `npx tsc --noEmit` was re-run
 * against the real `StatCardProps` ({ label, value, unit?, state?:
 * 'loading'|'loaded'|'updating' }) to confirm this file's usage
 * type-checks against it, rather than against a guessed shape.
 *
 * G11 label requirement (spec §5.7): "both the Home StatCard... and the
 * deck's economics DeckSlide ('value at adoption') carry explicit
 * measure labels... this is a Label (P3) addition on each StatValue
 * (P11), not a new component." Encoded here by requiring every `stats`
 * entry to carry its own `label` (StatCard's own Label, not optional) —
 * this component has no code path that renders a StatValue without one.
 *
 * DeckView integration: `heading` is rendered as this slide's one
 * accessible heading (`<h2>`); `headingId` lets the owning DeckView
 * (C18) point its `aria-live` pagination announcement and/or
 * `aria-labelledby` at the same node instead of duplicating the text.
 *
 * `surface` prop (A14-residual wave, mirrors amendment A14's Label/
 * StatValue shape exactly — design_system_spec.md §2.7): this composite
 * has TWO defects of the same class. (1) The `eyebrow` Label call routed
 * through Label correctly but never passed a `surface`, so it always
 * resolved to `--ink2`. (2) The `body` paragraphs never routed through
 * Label at all — their color was hand-authored inline, unconditionally
 * `--ink2`. Both fail the 4.5:1 AA floor in light theme wherever this
 * DeckSlide's immediate rendering context is a `--panel` surface. DeckSlide
 * is reused in TWO different contexts via DeckView (C18): the real Board
 * Deck screen (page-seated) and Reporting's "Board Pack" report (rendered
 * inside the shared reporting Drawer, panel-seated) — an ambiguous,
 * caller-determined seating exactly like Label/StatValue's own, so this
 * takes the SAME threaded-prop shape, not a composite-local hardcode
 * (contrast StatCard/SliderControlRow's `stanceBoxStyle`, which hardcode
 * `--chart-axis` because THEY have exactly one, always-panel-seated
 * context). `surface="page"` (default) is byte-identical to pre-fix
 * behavior for both defects; `surface="panel"` resolves both the eyebrow
 * Label and the body paragraphs to `--chart-axis`.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './primitives/Icon';
import type { IconName } from './primitives/Icon';
import { Label } from './primitives/Label';
import { StatCard } from './StatCard';

export type DeckSlideKind = 'economics' | 'generic';
export type DeckSlideSurface = 'page' | 'panel';

export interface DeckSlideStat {
  value: string | number;
  unit?: string;
  label: string;
}

export interface DeckSlideProps {
  kind: DeckSlideKind;
  /** This slide's one accessible heading (spec a11y baseline). */
  heading: string;
  /** Element id applied to the heading, for the owning DeckView to reference. */
  headingId?: string;
  eyebrow?: string;
  /** Body copy paragraphs, rendered in order. */
  body?: string[];
  /** `economics` slides render these via StatCard (G11: each stat's `label` is required, never omitted). */
  stats?: DeckSlideStat[];
  icon?: IconName;
  /** Extra slide-specific content (e.g. a future DeckCTASlide's primary Button) composed below the standard content. Outside this dispatch's scope to populate. */
  children?: ReactNode;
  /** A14-residual wave — `'page'` (default, `--ink2`, byte-identical to
   * pre-fix behavior) or `'panel'` (`--chart-axis`, REQUIRED when this
   * DeckSlide's immediate rendering context is a `--panel` surface). Applies
   * to both the `eyebrow` Label and the `body` paragraphs. */
  surface?: DeckSlideSurface;
}

const SLIDE_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  width: '100%',
  boxSizing: 'border-box',
  padding: '2.5rem',
};

const HEADING_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const STATS_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
};

const SURFACE_COLOR: Record<DeckSlideSurface, string> = {
  page: 'var(--ink2)',
  panel: 'var(--chart-axis)',
};

export function DeckSlide({ kind, heading, headingId, eyebrow, body, stats, icon, children, surface = 'page' }: DeckSlideProps) {
  return (
    <div data-lf-composite="deck-slide" data-kind={kind} data-surface={surface} style={SLIDE_STYLE}>
      {eyebrow ? <Label text={eyebrow} variant="eyebrow" surface={surface} /> : null}

      <div style={HEADING_ROW_STYLE}>
        {icon ? (
          <span aria-hidden="true">
            <Icon name={icon} size={24} />
          </span>
        ) : null}
        <h2 id={headingId} style={{ font: 'inherit', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
          {heading}
        </h2>
      </div>

      {body?.map((paragraph, index) => (
        // eslint-disable-next-line react/no-array-index-key -- static per-slide paragraph sequence, never reordered
        <p key={index} style={{ font: 'inherit', fontSize: '1.0625rem', lineHeight: 1.6, color: SURFACE_COLOR[surface], margin: 0 }}>
          {paragraph}
        </p>
      ))}

      {stats && stats.length > 0 ? (
        <div data-lf-composite="deck-slide-stats" style={STATS_ROW_STYLE}>
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              state="loaded"
              {...(stat.unit !== undefined ? { unit: stat.unit } : {})}
            />
          ))}
        </div>
      ) : null}

      {children}
    </div>
  );
}
