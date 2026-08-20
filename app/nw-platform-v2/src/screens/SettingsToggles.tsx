/**
 * SettingsToggles — parity_ia_addendum.md §1.4 "Settings" row 1
 * ("Identity & access + Notifications toggles + Approval matrix card"),
 * dispatched as Batch 6. Not one of the 7 script screens
 * (design_system_spec.md §9: "Settings toggles / About (1032–1140) — Switch
 * (P8), Label (P3) — no new composite; not one of the 7 screens, minimal
 * coverage per scope").
 *
 * Base engine anchors ported: settings toggles/cards markup
 * leapfi-platform.html 1032–1140 (Identity & access rows 44–47,
 * Notifications rows 51–54); approval matrix `renderApprovalSettings()`
 * 3968–3983.
 *
 * Region map: Topbar (shell) → page title → Approval-matrix card (full
 * width, matches source's `#approval-card` sitting above the two-column
 * `.set-grid` — now itself carrying one committee-vote Switch per tier
 * plus the committee-name input, B-15) → Identity & access card +
 * Notifications card (two-column row, 4 Switch (P8) each = 8, matching
 * parity_ia_addendum.md's "Switch (P8) ×8" component budget for THOSE two
 * cards specifically — see the B-15 header note below on why the matrix's
 * own controls are additional, not counted against that figure).
 *
 * SUPERSEDED — Topbar/Sidebar data ownership (amendment A11,
 * design_system_spec.md §3.0): both composites now mount exactly once, in
 * App.tsx's persistent Shell — this screen no longer accepts a `topbar`
 * prop or builds a local `SidebarProps`. It also no longer accepts
 * `onNavigate`: this screen never called it directly (every control here
 * is a local Switch/input, no cross-screen action), so that plumbing was
 * dead the moment its only consumer (the local `sidebarProps`
 * construction) was removed.
 *
 * AMBIGUITY RESOLVED — toggle persistence/backend: the base engine's own
 * toggle handler is `onclick="this.classList.toggle('on')"` — a pure
 * client-side visual flip with no server call, no confirmation, and no
 * claim beyond "this control now reads on/off." Porting this 1:1 as local
 * `useState` per card is therefore full behavior fidelity, not a shortcut:
 * there is no irreversible operation here (Core Principle 1 does not apply
 * — nothing is submitted, nothing can double-fire), and no backend this
 * screen could honestly claim to have written to (Core Principle 3 — a
 * toggle that silently claimed persistence it doesn't have would be the
 * violation, not the other way around).
 *
 * PER-TIER COMMITTEE-VOTE TOGGLE + EDITABLE COMMITTEE NAME RESTORED (B-15
 * fix batch — supersedes this note's earlier "Approval-matrix card carries
 * no Switch" resolution): the base engine's `renderApprovalSettings()`
 * (source 3968-3983) rendered a per-tier "Committee vote" `.toggle`
 * (`toggleTierCommittee`) and an editable committee-name `<input>`
 * (`setCommitteeName`). Both are, by this same file's own earlier-cited
 * `data/cases.ts` header, "a pure client-side visual flip with no server
 * call, no confirmation, and no claim beyond 'this control now reads
 * on/off'" — i.e. exactly the same no-persistence contract the Identity/
 * Notification `Switch` rows above already implement as local `useState`.
 * `data/cases.ts` (outside this dispatch's allowlist) still exports no
 * `toggleTierCommittee`/`setCommitteeName` mutator, so these two controls
 * are ported the identical way: local component state, seeded from
 * `APPROVAL.tiers[].committee`/`APPROVAL.committee`, never written back to
 * the shared `APPROVAL` singleton. This does overrun
 * parity_ia_addendum.md §1.4's literal "Switch (P8) ×8" count (8 Identity/
 * Notification Switches + `APPROVAL.tiers.length` committee-vote Switches +
 * 1 committee-name input) — the ratified trim this note previously
 * described is reversed by the fix dispatch's own brief, which named this
 * finding directly; flagged for design-authority sign-off same as every
 * other "AMBIGUITY RESOLVED" note in this file. `Cases.tsx`'s CS-12
 * reconciliation note (that screen's header, outside this file) is updated
 * to match: the "per-tier committee-vote toggle and editable committee
 * name" reduction it recorded as sanctioned no longer holds.
 *
 * AMBIGUITY RESOLVED — live open-case count depends on `seedCases()` having
 * run: `data/cases.ts` exports `CASES` as `export let CASES: Case[] = []`,
 * populated only when some other module calls `seedCases(DOCLIB)` (App.tsx
 * wiring, outside this dispatch's allowlist per the dispatch's own HARD
 * RULES). This screen reads the live module-level `CASES` binding directly
 * at render time rather than caching or re-deriving it — if the app hasn't
 * seeded cases yet when this screen mounts, every tier honestly reads "0
 * open cases" rather than a fabricated placeholder number (Core Principle
 * 3: render truth, including the unflattering "nothing seeded yet" case).
 * STOP-item for the wiring dispatch: confirm `seedCases()` runs before a
 * user can reach this screen, or the count will legitimately read 0.
 *
 * Accessibility: each Switch (P8) already renders `role="switch"`,
 * `aria-checked`, and a visible on/off word (never color-only) per its own
 * primitive contract. The row description sits immediately after the
 * Switch in DOM/reading order so a screen-reader user reaches it on the
 * very next stop; `Switch` (out of this dispatch's allowlist) exposes no
 * `aria-describedby` hook to associate it formally, so this is an
 * adjacency-based association, the same fallback every sibling screen uses
 * for description text next to a primitive with a fixed prop surface.
 * Card and section headings are real heading elements (`h1`/`h2`), and
 * `main` carries `aria-labelledby` pointing at the page `h1`, matching
 * every sibling screen's landmark pattern.
 *
 * No screen-level primary CTA: design_system_spec.md §9 and
 * parity_ia_addendum.md §4 both classify Settings as "a settings/reference
 * panel" with the explicit stated-reason exemption under Core Principle 2
 * ("one primary [CTA], or a stated reason none applies").
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner installed, matching
 * every sibling screen already landed here. Verified via `npx tsc --noEmit`
 * (strict mode, `exactOptionalPropertyTypes`) against the whole `src/`
 * tree to confirm this file type-checks against the real `Topbar`/
 * `Sidebar`/`Switch`/`Label`/`APPROVAL`/`CASES` shapes it consumes.
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Switch } from '../components/primitives/Switch';
import { Label } from '../components/primitives/Label';
import { APPROVAL, CASES } from '../data/cases';
import { PANEL_STYLE } from '../theme/panelStyle';

interface ToggleRow {
  key: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}

// Verbatim port, leapfi-platform.html 44–47 ("Identity & access" card).
const IDENTITY_TOGGLES: ToggleRow[] = [
  {
    key: 'ad-sync',
    label: 'Active Directory sync',
    description: "Profiles, photos & roles inherited from Entra ID · last sync 6:02 AM ET",
    defaultChecked: true,
  },
  {
    key: 'sso',
    label: 'Single sign-on',
    description: "SSO via the institution's identity provider · MFA inherited",
    defaultChecked: true,
  },
  {
    key: 'rbac',
    label: 'Role-based access',
    description: 'Homepage & module permissions derived from directory role',
    defaultChecked: true,
  },
  {
    key: 'audit-log',
    label: 'Audit logging',
    description: 'Every query, approval, alert & export logged end to end',
    defaultChecked: true,
  },
];

// Verbatim port, leapfi-platform.html 51–54 ("Notifications" card). Weekly
// digest ships off (no `on` class in source) — every other row ships on.
const NOTIFICATION_TOGGLES: ToggleRow[] = [
  {
    key: 'reg-alerts',
    label: 'Regulatory change alerts',
    description: 'Same-day detection across 15 sources on three layers',
    defaultChecked: true,
  },
  {
    key: 'approval-requests',
    label: 'Approval requests',
    description: 'Policy redlines routed to your approval chain',
    defaultChecked: true,
  },
  {
    key: 'breach-alerts',
    label: 'Control breach alerting',
    description: 'SLA-tracked alerts when a monitored control drifts',
    defaultChecked: true,
  },
  {
    key: 'weekly-digest',
    label: 'Weekly digest',
    description: 'Monday morning summary to your inbox',
    defaultChecked: false,
  },
];

// `position: 'relative'` makes this scrolling region the containing
// block for any absolutely-positioned descendant (sr-only spans today,
// third-party overlays tomorrow) so an unpinned absolute box resolves
// inside the scroll context instead of against the document root —
// see the invariant note on DataTable.tsx's `srOnlyStyle`.
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  position: 'relative',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.75rem',
};
const HEADER_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.375rem' };
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const GRID_STYLE: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' };
export const CARD_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
  padding: '1.1rem 1.25rem',
  ...PANEL_STYLE,
  boxSizing: 'border-box',
  minWidth: 0,
};
const CARD_TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)' };
const TOGGLE_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '0.625rem 0',
  borderTop: '1px solid var(--border)',
};
const TOGGLE_ROW_FIRST_STYLE: CSSProperties = { ...TOGGLE_ROW_STYLE, borderTop: 'none', paddingTop: 0 };
const TIER_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '0.75rem 0',
  borderTop: '1px solid var(--border)',
};
const TIER_ROW_FIRST_STYLE: CSSProperties = { ...TIER_ROW_STYLE, borderTop: 'none', paddingTop: 0 };
const TIER_DESC_STYLE: CSSProperties = { margin: '0.125rem 0 0', fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.5 };
const TIER_META_ROW_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem', marginTop: '0.125rem' };
const STATIC_ROW_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem 0', borderTop: '1px solid var(--border)' };
/** Visually-hidden recipe — `top`/`left` pinned to 0 is load-bearing;
 * see the invariant note on `DataTable.tsx`'s `srOnlyStyle`. Without it
 * an unpositioned absolute box falls back to its in-flow static
 * position, which can extend `html.scrollHeight` past this screen's
 * scrolling `<main>` (now also `position: 'relative'`, same reason). */
const srOnlyStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};
const COMMITTEE_NAME_INPUT_STYLE: CSSProperties = {
  font: 'inherit',
  fontSize: '0.875rem',
  color: 'var(--ink)',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm, 6px)',
  padding: '0.4rem 0.6rem',
  maxWidth: '22rem',
  width: '100%',
  boxSizing: 'border-box',
};

/** No props — `topbar`/`onNavigate` were removed as dead once Sidebar/Topbar mount moved to App.tsx's Shell (see file header); this screen never called `onNavigate` directly, only fed it to the Sidebar it no longer renders. */
export type SettingsTogglesProps = object;

function initialToggleState(rows: ToggleRow[]): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  rows.forEach((row) => {
    state[row.key] = row.defaultChecked;
  });
  return state;
}

function initialCommitteeState(): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  APPROVAL.tiers.forEach((tier) => {
    state[tier.k] = tier.committee;
  });
  return state;
}

export function SettingsToggles() {
  const [identityState, setIdentityState] = useState<Record<string, boolean>>(() => initialToggleState(IDENTITY_TOGGLES));
  const [notificationState, setNotificationState] = useState<Record<string, boolean>>(() => initialToggleState(NOTIFICATION_TOGGLES));
  // B-15: base `toggleTierCommittee`/`setCommitteeName` (source 3968-3983) —
  // same local, unpersisted visual-flip contract as identity/notification
  // toggles above (see file header). Seeded from the live `APPROVAL`
  // singleton, never written back to it.
  const [committeeState, setCommitteeState] = useState<Record<string, boolean>>(initialCommitteeState);
  const [committeeName, setCommitteeName] = useState<string>(APPROVAL.committee);

  function renderToggleCard(title: string, rows: ToggleRow[], state: Record<string, boolean>, setState: (next: Record<string, boolean>) => void, headingId: string) {
    return (
      <div style={CARD_STYLE} role="group" aria-labelledby={headingId}>
        <h2 id={headingId} style={CARD_TITLE_STYLE}>
          {title}
        </h2>
        {rows.map((row, index) => (
          <div key={row.key} style={index === 0 ? TOGGLE_ROW_FIRST_STYLE : TOGGLE_ROW_STYLE}>
            <Switch
              checked={state[row.key] ?? row.defaultChecked}
              label={row.label}
              onChange={(checked) => setState({ ...state, [row.key]: checked })}
            />
            <Label text={row.description} variant="body-secondary" />
          </div>
        ))}
      </div>
    );
  }

  const conditionsText = APPROVAL.conditions.join(' · ');

  return (
    <main id="settings-toggles-main" style={MAIN_STYLE} aria-labelledby="settings-toggles-title">
          <div style={HEADER_STYLE}>
            <Label text="Platform" variant="eyebrow" />
            <h1 id="settings-toggles-title" style={TITLE_STYLE}>
              Settings · Toggles
            </h1>
          </div>

          <div style={CARD_STYLE} role="group" aria-labelledby="approval-matrix-heading">
            <h2 id="approval-matrix-heading" style={CARD_TITLE_STYLE}>
              Approval matrix
            </h2>
            {APPROVAL.tiers.map((tier, index) => {
              const openCount = CASES.filter((c) => c.tier === tier.k).length;
              const caseCountText = `${openCount} open case${openCount === 1 ? '' : 's'}`;
              const requiresCommittee = committeeState[tier.k] ?? tier.committee;
              return (
                <div key={tier.k} style={index === 0 ? TIER_ROW_FIRST_STYLE : TIER_ROW_STYLE}>
                  <Label text={tier.n} variant="eyebrow" />
                  <p style={TIER_DESC_STYLE}>{tier.d}</p>
                  <Label text={`Example: ${tier.ex}`} variant="body-secondary" />
                  <div style={TIER_META_ROW_STYLE}>
                    <Label text={caseCountText} variant="body-secondary" />
                  </div>
                  {/* B-15: base per-tier `.toggle` (`toggleTierCommittee`, source 3975). */}
                  <Switch
                    checked={requiresCommittee}
                    label="Committee vote required before final approval"
                    onChange={(checked) => setCommitteeState({ ...committeeState, [tier.k]: checked })}
                  />
                </div>
              );
            })}
            <div style={STATIC_ROW_STYLE}>
              <Label text="Approving committee" variant="eyebrow" />
              {/* B-15: base editable committee-name `<input>` (`setCommitteeName`, source 3968-3983). */}
              <label>
                <span style={srOnlyStyle}>Approving committee name</span>
                <input
                  type="text"
                  value={committeeName}
                  onChange={(event) => setCommitteeName(event.target.value)}
                  style={COMMITTEE_NAME_INPUT_STYLE}
                />
              </label>
            </div>
            <div style={STATIC_ROW_STYLE}>
              <Label text="Conditions the CRO can attach" variant="eyebrow" />
              <Label text={conditionsText} variant="body-secondary" />
            </div>
          </div>

          <div style={GRID_STYLE}>
            {renderToggleCard('Identity & access', IDENTITY_TOGGLES, identityState, setIdentityState, 'identity-access-heading')}
            {renderToggleCard('Notifications', NOTIFICATION_TOGGLES, notificationState, setNotificationState, 'notifications-heading')}
          </div>
    </main>
  );
}
