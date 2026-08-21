/**
 * DrawerContent — Composite C8 (design_system_spec.md §2.2)
 *
 * "Built from: field rows (Label+value pairs), Tag(s), Button(s)."
 * `kind`: signal / play / doc — purely a semantic/data-attribute hint here
 * (`data-kind`), not a structural branch: §1.2's theme rule ("no component
 * ... may branch its structure") is written about theme, but the same
 * discipline applies for the same reason across kinds here — the three
 * kinds all resolve to the same field-rows/Tags/Buttons shape in §5.2/§5.3/
 * §5.5, so the differences between a signal, doc, and play detail view are
 * entirely in the DATA the consuming screen supplies (`fields`, `tags`,
 * `actions`), not in this component's markup.
 *
 * Composite states: loading (while content resolves), loaded.
 *
 * A11y baseline: "Content region labelled by the Drawer's own heading (C7);
 * no independent landmark" — this component renders a plain `<div>` with no
 * `role`/landmark of its own; it only makes sense mounted inside Drawer's
 * body slot, where Drawer's `role="dialog"` + `aria-labelledby` already
 * supplies the accessible name for this whole region.
 *
 * Cross-primitive reference: imports Button (P2), Tag (P4), Icon (P1's
 * `IconName` type only). Per dispatch instructions these may reference
 * sibling-dispatch files by the spec's naming even where this dispatch
 * does not itself build them — integration is checked later.
 *
 * CLICK-AFFORDANCE STANDARD (D19b, `affordance_standard.md` §3, §5 items
 * 6–7):
 *  - `DrawerContentField.onPress` (§3.2) renders the field's `<dd>` value
 *    as an inline navigating-link — `--accent` text, no button chrome,
 *    trailing `arrow-right` Icon (the "leaves the current drawer subject"
 *    glyph, distinct from `chevron-right`'s in-place-reveal meaning),
 *    underline added on hover as the one legitimate hover-only signal
 *    this standard keeps (§0: legitimate because the accent color is
 *    already present at rest). Implemented as `<button type="button">`
 *    styled as inline text, not `<a>`, since the destination is in-app
 *    state, not a URL — this is what keeps it keyboard-operable and
 *    `--focus-ring`-eligible for free (§3.2). A field without `onPress`
 *    renders exactly as before this change: plain text, no button —
 *    backward compatible.
 *  - `MAX_PRIMARY_ACTIONS` (§5 item 7) makes R3 ("never two competing
 *    primaries") a dev-time build-time-adjacent guarantee for the footer
 *    `actions` slot: a `console.error` fires when more than one action
 *    carries `variant: 'primary'`. This is a diagnostic, not a filter —
 *    it does not mutate what renders, so a violating screen's actions
 *    still all render (loudly flagged) rather than being silently
 *    dropped, which would hide the authoring bug instead of surfacing it.
 */
import { Fragment, useState } from 'react';
import { Icon } from './primitives/Icon';
import type { IconName } from './primitives/Icon';
import { Button } from './primitives/Button';
import type { ButtonVariant } from './primitives/Button';
import { Tag } from './primitives/Tag';
import type { NonRaciTagVariant } from './primitives/Tag';
import { Label } from './primitives/Label';

/** `'source'` added by the T6.3 follow-up (OnSideFeed.tsx's own W1
 * "AMBIGUITY RESOLVED" STOP-item: the source-connector detail rendered
 * `kind="signal"` only because this literal was missing and this file was
 * out of that dispatch's allowlist). `'domain'` added by amendment A20
 * (design_system_spec.md Section 2.9.9, PI2-D47) — StudioAsk's response canvas
 * `compliance-attainment` layout mounts DrawerContent with `kind: 'domain'`
 * for an OnSide domain's posture (fields: Regulatory bodies/Owner; tags:
 * status; actions: "See in OnSide"). Same non-structural, additive,
 * "purely a semantic/data-attribute hint" widening this file's own header
 * already establishes for `kind` in general — an R-2 extension, never a
 * new composite. `kind` remains a non-structural `data-kind` hint — no
 * branching. NOTE for the gate dispatch: OnSideFeed.tsx still passes
 * `kind="signal"` for its source detail; flip that literal to `"source"`
 * there (out of the reporting batch's allowlist). */
export type DrawerContentKind = 'signal' | 'play' | 'doc' | 'source' | 'domain';

/** One Label+value pair (spec: "field rows (Label+value pairs)"). */
export interface DrawerContentField {
  label: string;
  value: string;
  /** Inline navigating-link treatment (§3.2) — a cross-reference the
   * reader can optionally follow while looking at the current field,
   * never the drawer's main verb (that stays a footer `actions` Button,
   * §3.1). Omit for plain text (today's only shape). */
  onPress?: () => void;
}

export interface DrawerContentTag {
  text: string;
  variant: NonRaciTagVariant;
  icon?: IconName;
}

export interface DrawerContentAction {
  label: string;
  variant: ButtonVariant;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
}

export interface DrawerContentProps {
  kind: DrawerContentKind;
  /** Field rows to render once loaded. Ignored while `loading` (skeleton rows render instead). */
  fields: DrawerContentField[];
  tags?: DrawerContentTag[];
  actions?: DrawerContentAction[];
  loading?: boolean;
}

const SKELETON_ROW_COUNT = 4;

/** §5 item 7 — "never two competing primaries" (R3), enforced structurally
 * for the footer `actions` slot rather than left as a convention
 * implementers have to remember. Diagnostic only (see file header note):
 * fires `console.error` and lets the offending render proceed, so the bug
 * is loud in dev without the component silently deciding which primary to
 * drop. `import.meta.env.DEV` gates it out of production bundles. */
const MAX_PRIMARY_ACTIONS = 1;

function assertAtMostOnePrimaryAction(actions: DrawerContentAction[] | undefined): void {
  if (!actions || !import.meta.env.DEV) return;
  const primaryCount = actions.filter((action) => action.variant === 'primary').length;
  if (primaryCount > MAX_PRIMARY_ACTIONS) {
    console.error(
      `DrawerContent: at most ${MAX_PRIMARY_ACTIONS} action may carry variant="primary" (received ${primaryCount}). ` +
        'Two competing primary actions confuse which is the drawer\'s own verb — affordance_standard.md §3.1 (R3).',
    );
  }
}

interface DrawerContentFieldValueProps {
  value: string;
  onPress?: () => void;
}

/** Local subcomponent (not exported), same reasoning as the sibling
 * per-row/per-cell subcomponents elsewhere in this dispatch: hover/focus
 * need a real per-field hook instance, which a plain `.map()` callback in
 * the parent's render body cannot provide without violating the rules of
 * hooks. */
function DrawerContentFieldValue({ value, onPress }: DrawerContentFieldValueProps) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);

  if (!onPress) {
    // Backward compatible: no `onPress` renders exactly as before this
    // standard — plain text, no button chrome.
    return <>{value}</>;
  }

  return (
    <button
      type="button"
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        font: 'inherit',
        color: 'var(--accent)',
        cursor: 'pointer',
        textDecoration: hover ? 'underline' : 'none',
        borderRadius: 'var(--radius-xs, 4px)',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
      }}
    >
      {value}
      <Icon name="arrow-right" size={16} tone="interactive" />
    </button>
  );
}

export function DrawerContent({ kind, fields, tags, actions, loading = false }: DrawerContentProps) {
  assertAtMostOnePrimaryAction(actions);

  return (
    <div data-lf-composite="drawer-content" data-kind={kind} data-state={loading ? 'loading' : 'loaded'}>
      {tags && tags.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {tags.map((tag) => (
            <Tag key={`${tag.variant}:${tag.text}`} text={tag.text} variant={tag.variant} {...(tag.icon !== undefined ? { icon: tag.icon } : {})} />
          ))}
        </div>
      ) : null}

      {loading ? (
        <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            // eslint-disable-next-line react/no-array-index-key -- fixed-length skeleton placeholder list, order never changes
            <div
              key={index}
              style={{
                height: '1rem',
                width: index % 2 === 0 ? '85%' : '60%',
                borderRadius: 'var(--radius-xs, 4px)',
                background: 'var(--border)',
                opacity: 0.5,
                animation: 'lf-drawer-content-skeleton-pulse 1.4s ease-in-out infinite',
                animationDelay: `${index * 120}ms`,
              }}
            />
          ))}
          <style>{`
            @keyframes lf-drawer-content-skeleton-pulse {
              0%, 100% { opacity: 0.35; }
              50% { opacity: 0.7; }
            }
          `}</style>
        </div>
      ) : (
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 0.4fr) minmax(0, 0.6fr)',
            rowGap: '0.75rem',
            columnGap: '1rem',
            margin: 0,
          }}
        >
          {fields.map((field) => (
            <Fragment key={field.label}>
              {/* A14 (design_system_spec.md §2.7): every real consumer of
                  this component renders it inside a Drawer (C7), whose root
                  background is var(--panel) — panel-seated. */}
              <dt style={{ margin: 0 }}>
                <Label text={field.label} variant="body-secondary" surface="panel" />
              </dt>
              <dd style={{ margin: 0, color: 'var(--ink)', fontSize: '0.9375rem', alignSelf: 'start' }}>
                <DrawerContentFieldValue value={field.value} {...(field.onPress ? { onPress: field.onPress } : {})} />
              </dd>
            </Fragment>
          ))}
        </dl>
      )}

      {actions && actions.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
          {actions.map((action) => (
            <Button
              key={action.label}
              label={action.label}
              variant={action.variant}
              onPress={action.onPress}
              disabled={action.disabled ?? false}
              {...(action.icon !== undefined ? { icon: action.icon } : {})}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
