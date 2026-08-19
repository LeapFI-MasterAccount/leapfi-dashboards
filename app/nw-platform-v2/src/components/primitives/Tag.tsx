/**
 * Tag — Primitive P4, informational pill (design_system_spec.md §2.1)
 *
 * Variants: status-positive / status-caution / status-alert / hitl /
 * count / locked. Non-interactive by design (spec Key props column lists
 * only `text`, `variant`, `icon?` — no press handler). The spec's own
 * a11y note for the `count` variant ("supports hover/focus only when it
 * doubles as a link, e.g. bell count -> digest") is a composition rule,
 * not a prop this primitive exposes: a composite that needs that
 * behavior wraps a Tag inside an interactive element (e.g. Button/ghost)
 * rather than Tag growing its own press handler and diverging from the
 * spec's declared prop list.
 *
 * a11y baseline: "Never the sole carrier of meaning — always paired with
 * the status word in text" — enforced structurally here: the `text` prop
 * is always rendered, there is no icon-only render path.
 *
 * AMBIGUITY / STOP-ITEM (light-theme outline-ring treatment):
 * lightmode_amendment_proposal.md §6.3, referenced by this spec's P4 row
 * ("on light theme, status variants carry the outline-ring treatment"),
 * requires a 1.5px "Midnight" (i.e. `--ink` in light theme) outline
 * around flat-fill status tags on light surfaces. tokens.css's own
 * comment marks this "component-level concern, out of scope for token
 * file" — but no token in §1.1's named-role list represents "outline,
 * present in light theme only, absent in dark theme": every named role
 * is a single color that both themes define, and §1.2 forbids branching
 * component *structure* per theme (an outline is a structural
 * addition, not a pure color swap under the current token set). I could
 * not implement the theme-conditional outline without either adding a
 * new token to tokens.css (outside this dispatch's allowlist) or
 * branching this component's rendering on the theme attribute (forbidden
 * by spec §1.2). Rendering it unconditionally in both themes would
 * itself violate the spec (outline-ring is described as a light-theme-
 * only fix). Status tags below render as flat semantic fills only, with
 * no outline-ring in either theme — reporting this gap rather than
 * guessing a token name.
 */
import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

export type TagVariant = 'status-positive' | 'status-caution' | 'status-alert' | 'hitl' | 'count' | 'locked';

export interface TagProps {
  text: string;
  variant: TagVariant;
  icon?: IconName;
}

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  font: 'inherit',
  fontSize: '0.75rem',
  fontWeight: 600,
  lineHeight: 1,
  padding: '0.3rem 0.55rem',
  borderRadius: 'var(--radius-pill, 999px)',
  border: '1px solid transparent',
  whiteSpace: 'nowrap',
};

const VARIANT_STYLE: Record<TagVariant, CSSProperties> = {
  'status-positive': { background: 'var(--sem-positive)', color: 'var(--bg)' },
  'status-caution': { background: 'var(--sem-caution)', color: 'var(--bg)' },
  'status-alert': { background: 'var(--sem-alert)', color: 'var(--bg)' },
  // hitl (human-in-the-loop marker): accent is reserved as "THE ONLY
  // primary accent" per tokens.css — used here as an outline+text tint
  // (not a competing solid fill) so it stays a secondary, informational
  // signal rather than reading as a primary CTA.
  hitl: { background: 'transparent', color: 'var(--accent)', borderColor: 'var(--accent)' },
  count: { background: 'var(--panel)', color: 'var(--ink)', borderColor: 'var(--border)' },
  locked: { background: 'transparent', color: 'var(--ink3)', borderColor: 'var(--border)' },
};

export function Tag({ text, variant, icon }: TagProps) {
  return (
    <span data-lf-primitive="tag" data-variant={variant} style={{ ...baseStyle, ...VARIANT_STYLE[variant] }}>
      {icon ? <Icon name={icon} size={16} style={{ color: 'currentColor', width: 12, height: 12 }} /> : null}
      {text}
    </span>
  );
}
