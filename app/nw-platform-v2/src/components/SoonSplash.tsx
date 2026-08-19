/**
 * SoonSplash — Composite C16 (design_system_spec.md §2.2)
 *
 * Built from: SetupCard (`locked` ×N) + explanatory Label block. Used
 * for the Connect / AllRailz / Vantage locked-preview surface (§5.6
 * secondary surface). No composite states, no primary CTA at this
 * surface (spec: "locked preview, nothing to action yet").
 *
 * a11y baseline (spec C16): "Landmark-labelled section per module
 * (Connect / AllRailz / Vantage each get their own heading, not a
 * shared generic one)." Implemented as a `<section>` whose accessible
 * name is `aria-labelledby` the module's own `<h2>` — never a shared
 * "Soon" heading reused across modules, since each render of this
 * component is scoped to exactly one module.
 *
 * AMBIGUITY RESOLVED (props shape vs. data/misc.ts `SoonEntry`): this
 * dispatch's allowlist is components only, not the screen that wires
 * data/misc.ts's `SOON` record into a screen. Rather than importing
 * `SoonEntry` directly (which would couple this composite to one data
 * module's exact shape, including fields like `stats`/`cmp` that §2.2's
 * C16 "Built from" row does not name as part of this composite's
 * vocabulary), the props below are a deliberately smaller, composite-
 * scoped shape: module heading + explanatory copy + the locked
 * SetupCard sequence (`SoonEntry.steps` maps onto `steps` 1:1). A
 * future screen-assembly dispatch adapts `SoonEntry` into these props.
 * `SoonEntry.stats`/`.cmp` (the before/after comparison table) have no
 * named component in §2.2's C16 row — flagging as a STOP-item rather
 * than inventing an uncited table composite here.
 */
import { Label } from './primitives/Label';
import { SetupCard } from './SetupCard';
import type { IconName } from './primitives/Icon';

export interface SoonSplashStep {
  title: string;
  description?: string;
  icon?: IconName;
}

export interface SoonSplashProps {
  /** e.g. "LeapFI · Connect" — becomes this section's one accessible heading. */
  moduleName: string;
  /** e.g. "The MCP and API layer of LeapFI · OnSide" (SoonEntry.tag). */
  tagline?: string;
  /** e.g. "Part of OnSide · in development" (SoonEntry.phase). */
  phase?: string;
  /** Explanatory lead paragraph (SoonEntry.lead). */
  lead: string;
  /** Rendered as locked SetupCards, one per step (SoonEntry.steps). */
  steps: SoonSplashStep[];
  /**
   * Closing summary line (SoonEntry.note / .close). Includes the
   * G4/G9 enforcement-push line per the region map (§5.6) — that line
   * is data, supplied by the caller, not authored in this component.
   */
  note?: string;
}

export function SoonSplash({ moduleName, tagline, phase, lead, steps, note }: SoonSplashProps) {
  const headingId = `soon-splash-heading-${moduleName.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`;

  return (
    <section
      data-lf-composite="soon-splash"
      aria-labelledby={headingId}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 720 }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {phase ? <Label text={phase} variant="eyebrow" /> : null}
        <h2 id={headingId} style={{ font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
          {moduleName}
        </h2>
        {tagline ? <Label text={tagline} variant="body-secondary" /> : null}
      </header>

      <p style={{ font: 'inherit', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--ink2)', margin: 0 }}>{lead}</p>

      {steps.length > 0 ? (
        <ol
          data-lf-composite="soon-splash-steps"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0, listStyle: 'none' }}
        >
          {steps.map((step, index) => (
            // eslint-disable-next-line react/no-array-index-key -- static, seeded step sequence; no reordering/insertion
            <li key={index}>
              <SetupCard
                title={step.title}
                variant="locked"
                {...(step.description !== undefined ? { description: step.description } : {})}
                {...(step.icon !== undefined ? { icon: step.icon } : {})}
              />
            </li>
          ))}
        </ol>
      ) : null}

      {note ? <Label text={note} variant="body-secondary" /> : null}
    </section>
  );
}
