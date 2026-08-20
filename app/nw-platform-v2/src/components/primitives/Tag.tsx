/**
 * Tag — Primitive P4, informational pill (design_system_spec.md §2.1)
 *
 * Variants: status-positive / status-caution / status-alert / hitl /
 * count / locked / raci-mark (A2 — §2.5). Non-interactive by design (spec
 * Key props column lists only `text`, `variant`, `icon?`,
 * `accessibleText?` — no press handler). The spec's own a11y note for the
 * `count` variant ("supports hover/focus only when it doubles as a link,
 * e.g. bell count -> digest") is a composition rule, not a prop this
 * primitive exposes: a composite that needs that behavior wraps a Tag
 * inside an interactive element (e.g. Button/ghost) rather than Tag
 * growing its own press handler and diverging from the spec's declared
 * prop list.
 *
 * a11y baseline: "Never the sole carrier of meaning — always paired with
 * the status word in text" — enforced structurally here: the `text` prop
 * is always rendered, there is no icon-only render path.
 *
 * `accessibleText` (A2): optional for every variant except `raci-mark`,
 * where it is REQUIRED, enforced by the prop type (§2.1 P4 row, §2.5;
 * amendment A6, delta §8 R-4(a)) — a `raci-mark` Tag with no
 * `accessibleText` fails to compile, it never falls back to the visible
 * letter as its accessible name (that fallback is the exact failure this
 * variant exists to prevent: announcing the bare letter code an
 * assistive-tech user cannot decode without the legend). Expressed below
 * as a discriminated union on `variant` — the same mechanism class used
 * for `DataTableProps<T>`'s `grouping` config (`DataTable.tsx`, §2.4 G1),
 * so a caller literally cannot construct a `raci-mark` Tag without the
 * word to announce. When `accessibleText` is supplied on a non-raci-mark
 * variant, it replaces the visible `text` as the Tag's accessible name
 * (via `aria-label`) — for the abbreviation case the spec's P4 row
 * describes; when absent, the visible text remains the accessible name,
 * so every pre-A2 Tag call site is unchanged.
 *
 * `raci-mark` (A2, §2.5 — relocated from OnSideOwnership.tsx's
 * screen-local `RaciBadge`, delta §8 R-4(c)): a compact single-letter
 * R/A/C/I assignment badge. State set is `default` only — no hover,
 * focus, active, disabled or loading; it is never a click target (the row
 * that contains it is — §2.4 G5/G6). Accessible name mechanism is
 * `role="img"` + `accessibleText` carrying the complete word
 * ("Responsible" etc.) as the badge's ONLY accessible name — the visible
 * letter is *replaced* content for assistive tech, not additionally
 * announced, the same name-replaces-content technique `Icon.tsx`'s own
 * labelled/`role="img"` mode already uses (D24 reuse). This satisfies
 * P4's "never rely on color alone" baseline by a different, already-
 * sanctioned mechanism than the flat-fill status variants: legibility
 * without color and without knowing the letter code, not a color pairing
 * — the visible R/A/C/I legend carried by the matrix's own section is
 * what makes the letter legible to sighted users (§2.5 "the legend is
 * load-bearing, not decorative"); this primitive does not render one.
 *
 * THEME-SAFE MARK COLORS (moved here verbatim from OnSideOwnership.tsx's
 * former `RaciBadge`/`RACI_BADGE_TEXT`/`RACI_BADGE_BORDER` — D13
 * dual-theme, brand_doctrine 4.5:1 AA floor): of tokens.css's roles, only
 * three actually swap value per theme AND independently clear 4.5:1 on
 * `--panel` in both themes: `--accent` (13.16:1 dark / 5.57:1 light),
 * `--chart-axis` (5.33:1 dark / 4.97:1 light), `--ink3` (4.98:1 dark /
 * 6.87:1 light) — used for R, C, I respectively (matches
 * design_system_spec.md §2.5's ratified role table). `--accent2` (v1's
 * "A" hue) does NOT swap between themes and measures only 3.52:1 on dark
 * `--panel` — below the 4.5:1 floor — so it is NOT used as "A" badge
 * TEXT; "A" instead uses `--ink` for text (18.24:1 dark / 14.39:1 light
 * on `--panel`), with `--accent2` kept only as a decorative border (no
 * text-contrast requirement applies to a border; it still clears the
 * lower 3:1 non-text-UI floor in both themes). Per design_system_spec.md
 * §2.5's own table, the "A" pairing is **HELD** for a joint pass with the
 * brand-steward persona (§10 OQ-6) — this file carries the shipped
 * pairing forward unchanged, neither ratifying nor overturning it, and it
 * is not precedent for any other component until OQ-6 closes. DO NOT
 * change `--accent2` or the "A" pairing here.
 *
 * `accessibleText` NON-EMPTY GUARD (Sprint 1 hostile-review finding B4):
 * `accessibleText: string` (required for `raci-mark`) only proves a value
 * was SUPPLIED — `""` satisfies `string` just as well as "Responsible"
 * does, so the type alone does not guarantee the content assistive tech
 * actually needs. An empty (or whitespace-only) `aria-label` announces
 * NOTHING — worse than the bare-letter fallback this variant exists to
 * prevent, because at least a bare letter is *something* to (mis)hear.
 * Both current call sites (`OnSideOwnership.tsx`, via the RACI legend's
 * `RACI_WORD` map) are correct — this closes a latent contract gap, not an
 * observed defect. Enforced at RUNTIME (not compile-time): TypeScript has
 * no built-in non-empty-string type, and branding/narrowing it here would
 * require making `Tag` generic over a literal type parameter purely to
 * reject one degenerate value, which is disproportionate to the actual
 * risk (a caller passing a literal `""` is a copy-paste/placeholder
 * mistake, not a type-safety gap the compiler needs to close). A thrown
 * `Error` at render time fails the same way a missing required prop would
 * in a stricter language — loud, in development and in tests, never a
 * silently-broken accessible name in production. Applies to `accessibleText`
 * whenever it is supplied — required (`raci-mark`) or optional (every
 * other variant) — since an explicit empty override on any variant defeats
 * P4's a11y baseline ("never rely on color alone... always paired with the
 * status word in text") the same way.
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

export type TagVariant = 'status-positive' | 'status-caution' | 'status-alert' | 'hitl' | 'count' | 'locked' | 'raci-mark';

/** Every Tag variant except `raci-mark` — the type every call site that
 * builds a status/variant lookup for a *non*-RACI use case should use
 * (rather than the full `TagVariant`), so that value stays a specific,
 * narrowed literal `TagProps` can discriminate on. A value typed as the
 * full `TagVariant` union cannot select `TagProps`'s non-raci-mark
 * branch, since TypeScript cannot prove at that call site it isn't
 * `'raci-mark'` (§2.5 / A6's `accessibleText` requirement only attaches
 * to that one variant). */
export type NonRaciTagVariant = Exclude<TagVariant, 'raci-mark'>;

/** The four RACI assignment letters `raci-mark` ever renders — narrowed
 * (not a bare `string`) so the per-mark color lookup below is exhaustive
 * and needs no runtime fallback for an unrepresentable mark. */
export type RaciMark = 'R' | 'A' | 'C' | 'I';

interface TagBaseProps {
  text: string;
  icon?: IconName;
}

export type TagProps =
  | (TagBaseProps & {
      variant: NonRaciTagVariant;
      /** Replaces `text` as the Tag's accessible name where `text` is an
       * abbreviation of its meaning; absent, `text` itself is the
       * accessible name (every pre-A2 Tag is unchanged). */
      accessibleText?: string;
    })
  | (TagBaseProps & {
      variant: 'raci-mark';
      text: RaciMark;
      /** REQUIRED for `raci-mark` — the complete word (e.g. "Responsible")
       * that becomes this badge's only accessible name. Omitting it is a
       * spec violation caught at compile time (§2.5, amendment A6): a
       * `raci-mark` Tag never falls back to announcing the bare letter. */
      accessibleText: string;
    });

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

const VARIANT_STYLE: Record<NonRaciTagVariant, CSSProperties> = {
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

// raci-mark — see file header "THEME-SAFE MARK COLORS". Text (and, for
// R/C/I, border) color per mark, plus a separate border override for "A"
// (HELD, §10 OQ-6 — do not change).
const RACI_MARK_TEXT_COLOR: Record<RaciMark, string> = {
  R: 'var(--accent)',
  A: 'var(--ink)',
  C: 'var(--chart-axis)',
  I: 'var(--ink3)',
};
const RACI_MARK_BORDER_COLOR: Record<RaciMark, string> = {
  ...RACI_MARK_TEXT_COLOR,
  A: 'var(--accent2)',
};
const RACI_MARK_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '1.5rem',
  height: '1.5rem',
  padding: '0 0.3rem',
  borderRadius: 'var(--radius-xs, 4px)',
  border: '1px solid',
  background: 'var(--panel)',
  fontSize: '0.75rem',
  fontWeight: 800,
  lineHeight: 1,
};

/** B4 guard — see file header "`accessibleText` NON-EMPTY GUARD". Throws
 * (fail closed, at render time) when `accessibleText` was supplied but
 * carries no meaningful content, rather than letting an empty/whitespace
 * string silently become (or silently override) the Tag's accessible
 * name. Returns the value unchanged when it is meaningful, or `undefined`
 * when it was never supplied (the optional-prop, non-raci-mark case) so
 * callers can pass the result straight through to `aria-label`. */
function assertMeaningfulAccessibleText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value.trim().length === 0) {
    throw new Error(
      'Tag: accessibleText must not be an empty or whitespace-only string — an empty aria-label announces nothing to assistive tech, defeating the accessible-name contract accessibleText exists to guarantee (design_system_spec.md §2.1 P4 / §2.5).',
    );
  }
  return value;
}

export function Tag(props: TagProps) {
  const { text, variant, icon } = props;

  if (variant === 'raci-mark') {
    const accessibleText = assertMeaningfulAccessibleText(props.accessibleText);
    return (
      <span
        data-lf-primitive="tag"
        data-variant={variant}
        role="img"
        aria-label={accessibleText}
        style={{
          ...RACI_MARK_STYLE,
          color: RACI_MARK_TEXT_COLOR[text],
          borderColor: RACI_MARK_BORDER_COLOR[text],
        }}
      >
        {text}
      </span>
    );
  }

  const accessibleText = assertMeaningfulAccessibleText(props.accessibleText);
  return (
    <span
      data-lf-primitive="tag"
      data-variant={variant}
      aria-label={accessibleText}
      style={{ ...baseStyle, ...VARIANT_STYLE[variant] }}
    >
      {icon ? <Icon name={icon} size={16} style={{ color: 'currentColor', width: 12, height: 12 }} /> : null}
      {text}
    </span>
  );
}
