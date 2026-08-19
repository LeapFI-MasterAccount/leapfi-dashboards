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
 */
import { Fragment } from 'react';
import type { IconName } from './primitives/Icon';
import { Button } from './primitives/Button';
import type { ButtonVariant } from './primitives/Button';
import { Tag } from './primitives/Tag';
import type { TagVariant } from './primitives/Tag';
import { Label } from './primitives/Label';

export type DrawerContentKind = 'signal' | 'play' | 'doc';

/** One Label+value pair (spec: "field rows (Label+value pairs)"). */
export interface DrawerContentField {
  label: string;
  value: string;
}

export interface DrawerContentTag {
  text: string;
  variant: TagVariant;
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

export function DrawerContent({ kind, fields, tags, actions, loading = false }: DrawerContentProps) {
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
              <dt style={{ margin: 0 }}>
                <Label text={field.label} variant="body-secondary" />
              </dt>
              <dd style={{ margin: 0, color: 'var(--ink)', fontSize: '0.9375rem', alignSelf: 'start' }}>{field.value}</dd>
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
