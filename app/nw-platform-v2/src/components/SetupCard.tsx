/**
 * SetupCard / PromoCard — Composite C15 (design_system_spec.md §2.2)
 *
 * Built from: Icon (P1) + Label(s) (P3) + optional count Tag (P4) +
 * chevron Icon (P1). Variants: `interactive` (clickable, e.g. Roadmap's
 * "what's next" teaser) / `locked` (Soon splash entries — no action).
 * States: default, hover, focus, active (interactive only).
 *
 * a11y baseline (spec C15): "`locked` variant is not a button — it is a
 * description region, never a disabled-looking clickable that implies a
 * hidden action."
 *
 * AMBIGUITY RESOLVED (trailing icon per variant): the spec's Built-from
 * list names one "chevron Icon" without saying whether `locked` cards
 * render it too. Read together with the a11y baseline above — a chevron
 * is a navigation affordance ("more this way"); showing one on a card
 * that performs no action on click would itself be the "implies a hidden
 * action" defect the baseline warns against. So this component renders
 * the trailing chevron (`chevron-right`) only for `interactive`, and
 * substitutes the `lock` glyph (already in the closed P1 icon vocabulary,
 * used elsewhere for the `locked` Tag variant) for `locked` — a status
 * marker, not an affordance.
 *
 * STOP-ITEM (leading `icon` prop vs. seed data): §9's SOON data
 * (data/misc.ts `SoonEntry.icon`) stores arbitrary Unicode glyphs
 * ('⇄', '≋', '⬡') as each module's mark. Primitive P1 (Icon.tsx) is an
 * intentionally closed `IconName` vocabulary with no matching entries for
 * those marks (see Icon.tsx's own resolved-ambiguity note). This
 * component's `icon` prop is typed to the primitive's real contract
 * (`IconName`, optional) rather than widened to `string` to route around
 * that mismatch. Whoever wires SOON data into SetupCard/SoonSplash will
 * need either an IconName vocabulary extension or a glyph-to-IconName
 * mapping table — flagging rather than silently inventing a second,
 * looser icon prop on this composite.
 *
 * Cross-composite reference: consumed by SoonSplash (C16, same
 * dispatch) and by screens outside this dispatch's allowlist (Roadmap's
 * "what's next" row, §5.6) which are wired up later.
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from './primitives/Icon';
import type { IconName } from './primitives/Icon';
import { Label } from './primitives/Label';
import { Tag } from './primitives/Tag';

export type SetupCardVariant = 'interactive' | 'locked';

export interface SetupCardProps {
  title: string;
  description?: string;
  icon?: IconName;
  /** Rendered as a Tag (`count` variant) when present, e.g. "3 new". */
  count?: string;
  variant: SetupCardVariant;
  /** Required (and only meaningful) when `variant === 'interactive'`. */
  onPress?: () => void;
}

const CARD_BASE_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  width: '100%',
  textAlign: 'left',
  font: 'inherit',
  boxSizing: 'border-box',
  padding: '1rem',
  borderRadius: 'var(--radius-md, 10px)',
  border: '1px solid var(--border)',
  background: 'var(--panel)',
  outline: 'none',
  transition: 'background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
};

const ICON_BADGE_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  width: 36,
  height: 36,
  borderRadius: 'var(--radius-sm, 6px)',
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
};

const BODY_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  flex: '1 1 auto',
  minWidth: 0,
};

const TITLE_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const TITLE_TEXT_STYLE: CSSProperties = {
  font: 'inherit',
  fontSize: '0.9375rem',
  fontWeight: 600,
  color: 'var(--ink)',
};

const TRAILING_STYLE: CSSProperties = {
  flex: '0 0 auto',
  display: 'inline-flex',
  alignItems: 'center',
  marginLeft: 'auto',
  alignSelf: 'center',
};

interface SetupCardBodyProps {
  title: string;
  // Explicit `| undefined` (vs. the public SetupCardProps' plain `?:`):
  // this private helper receives its values from a destructure of an
  // already-optional prop, so the caller is passing a value that may
  // literally be `undefined`, not omitting the key — exactOptionalPropertyTypes
  // (tsconfig.json) requires the target type to say so explicitly.
  description?: string | undefined;
  icon?: IconName | undefined;
  count?: string | undefined;
}

function SetupCardBody({ title, description, icon, count }: SetupCardBodyProps) {
  return (
    <>
      {icon ? (
        <span aria-hidden="true" style={ICON_BADGE_STYLE}>
          <Icon name={icon} size={16} />
        </span>
      ) : null}
      <span style={BODY_STYLE}>
        <span style={TITLE_ROW_STYLE}>
          <span style={TITLE_TEXT_STYLE}>{title}</span>
          {count ? <Tag text={count} variant="count" /> : null}
        </span>
        {description ? <Label text={description} variant="body-secondary" /> : null}
      </span>
    </>
  );
}

export function SetupCard(props: SetupCardProps) {
  const { title, description, icon, count, variant, onPress } = props;
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(false);

  if (variant === 'locked') {
    // Description region, not a button (spec a11y baseline) — no
    // press handler, no hover/focus/active styling, `lock` status
    // glyph instead of a navigation chevron.
    return (
      <div data-lf-composite="setup-card" data-variant="locked" style={CARD_BASE_STYLE}>
        <SetupCardBody title={title} description={description} icon={icon} count={count} />
        <span aria-hidden="true" style={TRAILING_STYLE}>
          <Icon name="lock" size={16} tone="disabled" />
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-lf-composite="setup-card"
      data-variant="interactive"
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...CARD_BASE_STYLE,
        cursor: 'pointer',
        background: active ? 'var(--bg2)' : hover ? 'var(--bg2)' : 'var(--panel)',
        borderColor: focused ? 'transparent' : hover || active ? 'var(--accent)' : 'var(--border)',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
      }}
    >
      <SetupCardBody title={title} description={description} icon={icon} count={count} />
      <span aria-hidden="true" style={TRAILING_STYLE}>
        <Icon name="chevron-right" size={16} tone={hover || active ? 'interactive' : 'default'} />
      </span>
    </button>
  );
}
