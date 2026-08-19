/**
 * HomeCustomizeBar — view (parity_ia_addendum.md §1.7 "Home customization",
 * Batch 7), composed below `Home.tsx`'s existing, untouched StatCard row +
 * "Start the demo" primary CTA by a future wiring dispatch — see "WIRING
 * RECIPE" below (`Home.tsx` is outside this dispatch's ALLOWLIST).
 *
 * Ports `toggleHomeCust`/`renderCustBar`/`homePanelToggle`/
 * `homePanelsClear`/`homePanelsReset`/`homeOrder` (leapfi-platform.html
 * 4122-4193) as a controlled disclosure: the same trigger-Button+panel
 * shape `FilterBar.tsx` (C5) already uses, applied to panel visibility
 * instead of data filtering (this dispatch's brief: "Button (ghost,
 * trigger — same disclosure shape FilterBar already uses)").
 *
 * "kpis" (`HP`'s first entry, "Top metrics") IS `Home.tsx`'s existing,
 * byte-identical StatCard row — the hard constraint this whole batch is
 * built under ("never touch that existing top-of-page region... demo-flow
 * primacy") rules out ever hiding or reordering it, so it is deliberately
 * excluded from `HOME_PANEL_DEFS`/every toggle/Chip below. This file only
 * ever manages the 5 keys this dispatch actually owns: posture, legis,
 * invest, queue, qa.
 *
 * STATE OWNERSHIP / A DEFECT AVOIDED (STOP-item, flagged rather than
 * propagated): `data/misc.ts` exports `HOME_ORDER: Record<string,
 * string[]>` — correctly nested per role, matching the base engine's own
 * `HOME_ORDER[roleKey]=[...]` model — but exports `HOME_HIDE: Record<string,
 * boolean>`, a *flat* shape that cannot represent the base engine's actual
 * per-role hidden-set model (`HOME_HIDE[roleKey][panelKey]=true`). This is
 * a pre-existing type defect in an already-shipped, out-of-allowlist data
 * file (data/misc.ts is not in this dispatch's ALLOWLIST to correct).
 * Rather than write through a shape that cannot hold what it needs to hold
 * — which would silently share "hidden" state across every role instead of
 * scoping it per role, corrupting `HOME_ORDER`'s own correctly-scoped
 * sibling — this file never reads or writes `HOME_HIDE` at all.
 * `HOME_ORDER[roleKey]`'s ordered *visible* sequence is sufficient on its
 * own to reconstruct both "visible" (the array) and "hidden" (its
 * complement against `HOME_PANEL_DEFS`), so nothing is lost by avoiding the
 * defective export. STOP-item for whoever owns `data/misc.ts`: correct
 * `HOME_HIDE`'s type to `Record<string, Record<string, boolean>>` if a
 * future consumer needs a hidden-set independent of `HOME_ORDER`.
 *
 * Because `HOME_ORDER` is a plain, mutable, module-level object — the same
 * "export let/const mutable singleton" pattern `data/cases.ts` already
 * establishes for `CASES`/`NOTIFS` — mutating it triggers no React
 * re-render on its own. `commitVisibleKeys` (write) is always followed by
 * this component calling `onChange` (tell the integrating screen's own
 * React state to update): the same two-step "mutate the singleton, then
 * force a render" shape `screens/Cases.tsx`'s `performAction`/`renderTick`
 * already establishes for the same category of cross-screen shared state.
 *
 * WIRING RECIPE for the future `Home.tsx` dispatch
 * (parity_ia_addendum.md Batch 7's own wiring note: "Home.tsx composes the
 * new bar + panels below its existing, untouched StatCard row and primary
 * CTA" — follow-up integration work, outside every batch's file allowlist
 * per the addendum's own stated convention, not a gap in this file):
 *
 *   const [visibleKeys, setVisibleKeys] = useState(() => resolveVisibleKeys(currentUser.roleKey));
 *   // ...unchanged StatCard row / "Start the demo" Button block above...
 *   <HomeCustomizeBar roleKey={currentUser.roleKey} roleFirstName={currentUser.first} visibleKeys={visibleKeys} onChange={setVisibleKeys} />
 *   <HomePanels visibleKeys={visibleKeys} roleKey={currentUser.roleKey} onNavigate={onNavigate} onOpenCase={onOpenCase} />
 *
 * `visibleKeys` is intentionally lifted to the integrating screen (owned by
 * neither file itself) so this bar's toggles and `HomePanels`' rendered set
 * are always the same array, never two copies that can drift — the same
 * "one piece of state, two consumers" shape `InvestmentDesign.tsx`'s own
 * `sliders` state already uses between `SliderControlRow` and `PlanTable`.
 *
 * AMBIGUITY RESOLVED — Chip variant per row: the 5 panel toggles use
 * `filter` (P5's own toggle-button semantics, `aria-pressed`, matching
 * `FilterBar.tsx`'s identical use for option toggles); "Clear all"/"Reset
 * layout" use `suggestion` (P5's plain-button semantics, no
 * `aria-pressed`) — they are one-shot commands, not persistent toggle
 * state, so `filter`'s `aria-pressed` semantics would misdescribe them.
 * Both are the same closed Chip vocabulary (P5) already spec'd for this
 * composite; no new component requested.
 *
 * STOP-ITEM / cross-file gap (identical to `FilterBar.tsx`'s own
 * documented finding): `Button` (P2) exposes no ARIA passthrough and no
 * forwarded ref, so this file cannot attach `aria-expanded`/
 * `aria-controls` to the trigger's real DOM node. The same three
 * mitigations `FilterBar.tsx` already applies are ported verbatim here:
 * (1) a visually-hidden `aria-live="polite"` expand/collapse announcement,
 * (2) focus moves into the panel (first Chip) on open, (3) Escape restores
 * focus to the trigger via this file's own wrapper-span ref.
 *
 * Accessibility gate (persona directive 7): trigger is a real disclosure
 * Button; panel is `role="group"`, labelled; every Chip carries visible
 * text (a position number + the label) — never color-only for "currently
 * shown."
 *
 * Irreversibility gate: N/A — every action here is a reversible display
 * preference, not a claim about a server-side operation's completion.
 *
 * STOP-item — no executable test run: matches every sibling file in this
 * worktree — no test runner installed (`package.json`, outside this
 * dispatch's ALLOWLIST). Verified via `npx tsc --noEmit` (strict,
 * `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) against the
 * whole `src/` tree instead.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { Button } from '../components/primitives/Button';
import { Chip } from '../components/primitives/Chip';
import { Label } from '../components/primitives/Label';
import { HP, HOME_ORDER } from '../data/misc';

export type HomePanelKey = 'posture' | 'legis' | 'invest' | 'queue' | 'qa';

function isHomePanelKey(key: string): key is HomePanelKey {
  return key === 'posture' || key === 'legis' || key === 'invest' || key === 'queue' || key === 'qa';
}

/** `HP` (data/misc.ts) minus 'kpis' — see file header. */
export const HOME_PANEL_DEFS: ReadonlyArray<{ key: HomePanelKey; label: string }> = HP.filter(([key]) => isHomePanelKey(key)).map(([key, , label]) => ({
  key: key as HomePanelKey,
  label: label as string,
}));

export const DEFAULT_VISIBLE_KEYS: readonly HomePanelKey[] = HOME_PANEL_DEFS.map((p) => p.key);

/** Port of `homeOrder()`'s healing logic (source 4126-4133), scoped to the
 * 5-key universe this dispatch owns and deliberately never reading
 * `HOME_HIDE` — see file header "STATE OWNERSHIP." Never customized
 * (`HOME_ORDER[roleKey]` is `undefined`) heals to the full shipped order;
 * once customized (even to `[]`, after "Clear all"), the stored sequence —
 * filtered to still-valid keys — is authoritative. */
export function resolveVisibleKeys(roleKey: string): HomePanelKey[] {
  const stored = HOME_ORDER[roleKey];
  if (stored === undefined) return [...DEFAULT_VISIBLE_KEYS];
  const out: HomePanelKey[] = [];
  stored.forEach((k) => {
    if (isHomePanelKey(k) && !out.includes(k)) out.push(k);
  });
  return out;
}

/** Port of the write side of `homePanelToggle()`/`homePanelsClear()`/
 * `homePanelsReset()` (source 4149-4172), expressed as one idempotent "set
 * the next visible sequence" operation. */
export function commitVisibleKeys(roleKey: string, nextVisibleKeys: readonly HomePanelKey[]): void {
  HOME_ORDER[roleKey] = [...nextVisibleKeys];
}

export interface HomeCustomizeBarProps {
  roleKey: string;
  roleFirstName: string;
  /** Controlled — see file header "WIRING RECIPE." Always the same array `HomePanels` renders from. */
  visibleKeys: readonly HomePanelKey[];
  onChange: (nextVisibleKeys: readonly HomePanelKey[]) => void;
}

const barWrapStyle: CSSProperties = { position: 'relative', display: 'flex', flexDirection: 'column' };
const panelStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 0.4rem)',
  left: 0,
  zIndex: 10,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.5rem',
  minWidth: '20rem',
  maxWidth: '36rem',
  boxSizing: 'border-box',
  padding: '0.875rem',
  borderRadius: 'var(--radius-md, 10px)',
  border: '1px solid var(--border)',
  background: 'var(--panel)',
};
const noteStyle: CSSProperties = { flexBasis: '100%', marginTop: '0.25rem' };
const srOnlyStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function HomeCustomizeBar({ roleKey, roleFirstName, visibleKeys, onChange }: HomeCustomizeBarProps) {
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const triggerWrapRef = useRef<HTMLSpanElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Mitigation (2): move focus into the just-opened panel once it mounts (FilterBar.tsx's own pattern).
  useEffect(() => {
    if (!open) return;
    const firstChip = panelRef.current?.querySelector('button');
    firstChip?.focus();
  }, [open]);

  function closeBar(restoreFocus: boolean): void {
    setOpen(false);
    setAnnouncement('Customize panel collapsed');
    // Mitigation (3): restore focus to the trigger's real DOM button via our own wrapper ref.
    if (restoreFocus) triggerWrapRef.current?.querySelector('button')?.focus();
  }

  function toggleOpen(): void {
    if (open) {
      closeBar(false);
    } else {
      setOpen(true);
      setAnnouncement('Customize panel expanded');
    }
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeBar(true);
    }
  }

  function togglePanel(key: HomePanelKey): void {
    const next = visibleKeys.includes(key) ? visibleKeys.filter((k) => k !== key) : [...visibleKeys, key];
    commitVisibleKeys(roleKey, next);
    onChange(next);
  }

  function clearAll(): void {
    commitVisibleKeys(roleKey, []);
    onChange([]);
  }

  function resetLayout(): void {
    commitVisibleKeys(roleKey, DEFAULT_VISIBLE_KEYS);
    onChange(DEFAULT_VISIBLE_KEYS);
  }

  const triggerLabel = `Customize (${visibleKeys.length} of ${HOME_PANEL_DEFS.length} shown)`;
  const noteText = `${
    visibleKeys.length > 0 ? `Showing ${visibleKeys.length} of ${HOME_PANEL_DEFS.length}` : 'Nothing showing'
  } · saved for ${roleFirstName}.`;

  return (
    <div style={barWrapStyle} data-lf-composite="home-customize-bar">
      {/* Mitigation (1): stands in for the aria-expanded announcement the trigger Button can't carry. */}
      <span aria-live="polite" style={srOnlyStyle}>
        {announcement}
      </span>
      <span ref={triggerWrapRef}>
        <Button variant="ghost" icon="chevron-down" label={triggerLabel} onPress={toggleOpen} />
      </span>
      {open ? (
        <div ref={panelRef} role="group" aria-label="Customize your home" style={panelStyle} onKeyDown={handlePanelKeyDown}>
          {HOME_PANEL_DEFS.map(({ key, label }) => {
            const pos = visibleKeys.indexOf(key);
            const shown = pos >= 0;
            return <Chip key={key} text={shown ? `${pos + 1}. ${label}` : label} variant="filter" selected={shown} onPress={() => togglePanel(key)} />;
          })}
          <Chip text="Clear all" variant="suggestion" onPress={clearAll} />
          <Chip text="Reset layout" variant="suggestion" onPress={resetLayout} />
          <div style={noteStyle}>
            <Label text={noteText} variant="body-secondary" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
