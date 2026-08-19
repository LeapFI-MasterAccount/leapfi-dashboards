/**
 * Home — Screen anatomy §5.1 "Home — Step 1 'Day one'" (design_system_spec.md),
 * fed by demo_script_draft.md Step 1 ("Day one") and its G1/G11 gap-register
 * entries.
 *
 * Region map (§5.1): Topbar (shell) → page title → StatCard row (C1, 2
 * cards: the freed-capacity figure and the FTE figure — survey_map.md
 * 4197–4296) → utility corner (optional "Customize tiles" ghost Button,
 * conditional) → primary CTA. Components used per spec: Topbar (C4),
 * Sidebar (C3), StatCard (C1), Button (P2).
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: both composites
 * require persona/profile/notification/date/nav-callback data this screen
 * does not own (see `Topbar.tsx`'s `TopbarProps` and `Sidebar.tsx`'s
 * `SidebarProps`). Following the exact passthrough pattern already landed
 * in this worktree by the sibling `BoardDeck.tsx` dispatch (`topbar:
 * TopbarProps` full bundle), this screen accepts a full `topbar` prop and,
 * for Sidebar, only `onNavigate` (+ optional `sidebarVersionLabel`) — the
 * `activeId` half of `SidebarProps` is intrinsic to which screen is
 * rendering, so it is hardcoded here to `'home'` rather than accepted as a
 * prop the integrator could get wrong.
 *
 * HOME CUSTOMIZATION (W2, parity_ia_addendum.md §1.7 + Batch 7 line 403 —
 * resolves this header's original "STOP-item if a future dispatch surfaces
 * real customization data"): that dispatch is this one. `HomeCustomizeBar`
 * + `HomePanels` (both already landed, previously unwired) are composed
 * below the existing CTA row, following `HomeCustomizeBar.tsx`'s own
 * documented WIRING RECIPE verbatim: `visibleKeys` is lifted here (one
 * piece of state, two consumers — bar toggles and panel render set can
 * never drift). Placement is the addendum §1.7's own instruction ("**below**
 * the existing, unchanged StatCard row + 'Start the demo' primary CTA, see
 * §4 primacy audit" — quoted as written pre-D18; the CTA slot itself now
 * carries the D18 label/action, see "D18 — PRIMARY CTA" below) — NOT
 * §5.1's "utility corner": the StatCard row and CTA slot position/weight
 * are unchanged from the pre-W2 file, the customize trigger
 * is a ghost Button, and every panel surface is secondary (DataTable/
 * StatCard/SetupCard), so the primary CTA — now "Open today's regulatory
 * feed" (D18, see below) — remains the single obvious primary action (R3).
 *
 * AMBIGUITY RESOLVED / STOP-item — persona props: the WIRING RECIPE needs
 * the active persona's `roleKey`/`first`, which this screen has never
 * received (`App.tsx`'s own header: "No other screen in this worktree reads
 * the active persona (none of the 7 screens' props accept one)"), and
 * `App.tsx`'s Home call site (line ~407) is outside this dispatch's
 * ALLOWLIST (`Home.tsx` ONLY). Making the new props required would break
 * `App.tsx`'s existing call under tsc — an out-of-allowlist edit by
 * another name — so they are optional, defaulting to `CURRENT`
 * (`data/studio.ts`, Rachel Fischer/'cro'): exactly the persona `App.tsx`
 * boots with and resets to on Restart, so the defaults are correct for the
 * scripted demo path today, not a fabrication. STOP-item for the follow-up
 * `App.tsx` dispatch: pass `roleKey={currentUser.roleKey}`
 * `roleFirstName={currentUser.first}` so the Topbar persona switcher
 * propagates here; until then a persona switched mid-session sees the
 * default (CRO) queue/preferences on Home — flagged, not silently
 * approximated. If the integrator later passes a changing `roleKey`, the
 * lifted `visibleKeys` state re-derives via the standard adjust-state-
 * during-render pattern keyed on `roleKey` (see component body), so each
 * role's stored `HOME_ORDER` layout is honored on switch.
 *
 * `HomePanels`' optional `onOpenCase` is deliberately not forwarded — its
 * own prop doc states no row this wave reaches uses it ("accepted for
 * prop-shape symmetry"); forwarding a handler this screen would also have
 * to invent a prop for would widen this screen's API for a no-op.
 *
 * G11 label requirement (§5.1, cross-referenced from §5.7): "both the Home
 * StatCard ('cost capacity already freed') and the deck's economics
 * DeckSlide ('value at adoption') carry explicit measure labels... this is
 * a Label (P3) addition on each StatValue (P11), not a new component." The
 * first StatCard's `label` prop below is set to the exact phrase G11 names
 * ("Cost capacity already freed") so this figure can never render next to
 * the deck's differently-measured $4.5M/yr figure and read as a
 * contradiction to a numerate board member.
 *
 * D18 — PRIMARY CTA (presenter_entry_redesign.md §1; supersedes the
 * design_system_spec.md §5.1/§6 "Start the demo" reading and closes §10
 * OQ-1's CTA-destination half): "Start the demo" is STRUCK as Home's
 * primary. The one primary CTA is now product-native — "Open today's
 * regulatory feed" — navigating to `onside.feed` via the `onNavigate` prop
 * this screen already receives. That destination is script step 2's own
 * `do` action ("OnSide → Regulatory feed"), keeping R3's
 * one-obvious-primary-CTA rule anchored to a script step's action with no
 * demo-shaped control on the screen; the label mirrors the destination
 * screen's own name for accurate wayfinding. Presenter entry now lives
 * entirely in PresenterRail.tsx (`Ctrl+Alt+Shift+P` chord + `?present=1`
 * boot pre-stage).
 *
 * D18 residue RESOLVED (fix-wave gate dispatch, closing the STOP-item an
 * earlier revision of this header carried): `App.tsx` no longer defines
 * `handleStartDemo` nor passes `onStartDemo`, and the formerly-deprecated
 * optional `onStartDemo` prop is deleted from `HomeProps` per
 * presenter_entry_redesign.md §4 — this screen now contains no
 * demo/presenter reference at all, the §3.1 end-state the spec describes.
 *
 * Layout constants (240px sidebar column, 2rem content padding, 1.5rem
 * title size): design_system_spec.md §1.4 states this document carries no
 * px/spacing values by design (colors only); these are therefore
 * implementer judgment calls, same category as `Drawer.tsx`'s documented
 * 480px width / 200ms transition constants — chosen for a readable,
 * conventional dashboard layout, not sourced from any doctrine file.
 *
 * TESTS (stale claim corrected by the T6.7 fix wave — an earlier header
 * revision said no test runner was installed): Vitest is installed; this
 * screen is covered by `src/__tests__/shell/home.test.tsx` and
 * `presenter-entry-d18.test.tsx`, plus `npx tsc --noEmit` (strict,
 * `exactOptionalPropertyTypes`).
 *
 * SEAM 1 RESOLVED (B3 dispatch) — `HomePanels.tsx`'s own file header
 * ("CLICKABLE TOUCH CHIPS...") flagged this exact gap: `App.tsx`'s
 * NAVIGATION-WITH-PAYLOAD contract (that file's header, lines 120-188) was
 * spread onto this screen already (`{...deepLinkProps}` at the `Home` call
 * site) but never threaded past it — every HomePanels go-link/drawer
 * action fell back to plain `onNavigate`, landing on the right screen but
 * never opening the specific item. `HomeProps` now `extends
 * DeepLinkScreenProps`; only `onDeepLink` (the FIRE half) is threaded down
 * to `HomePanels` — `deepLink`/`onDeepLinkConsumed` (the CONSUME half) are
 * accepted here (App spreads all three unconditionally) but intentionally
 * left unused: Home is never a deep-link TARGET screen in the KIND
 * VOCABULARY (App.tsx header 157-167) — no kind routes back to `'home'` —
 * so there is nothing for this screen to consume. See `HomePanels.tsx`'s
 * own header for exactly which of its actions now deliver a real payload
 * versus which stay plain screen-level nav (no id to carry).
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { DeepLinkScreenProps } from '../App';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/primitives/Button';
import { HomeCustomizeBar, resolveVisibleKeys } from '../views/HomeCustomizeBar';
import type { HomePanelKey } from '../views/HomeCustomizeBar';
import { HomePanels } from '../views/HomePanels';
import { CURRENT } from '../data/studio';

const SCREEN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  background: 'var(--bg)',
  boxSizing: 'border-box',
};

const BODY_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flex: '1 1 auto',
  minHeight: 0,
};

const SIDEBAR_REGION_STYLE: CSSProperties = {
  flex: '0 0 240px',
};

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

const TITLE_STYLE: CSSProperties = {
  margin: 0,
  font: 'inherit',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'var(--ink)',
};

const STAT_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
};

const CTA_ROW_STYLE: CSSProperties = {
  display: 'flex',
};

export interface HomeProps extends DeepLinkScreenProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as `BoardDeck.tsx`). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('home') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
  /**
   * Active persona's role key / first name for the customization surfaces
   * (§1.7). Optional with `CURRENT` defaults — see file header "AMBIGUITY
   * RESOLVED / STOP-item — persona props" for why these are not required
   * and what the follow-up `App.tsx` dispatch should pass.
   */
  roleKey?: string;
  roleFirstName?: string;
}

export function Home({ topbar, onNavigate, sidebarVersionLabel, roleKey = CURRENT.roleKey, roleFirstName = CURRENT.first, onDeepLink }: HomeProps) {
  // Lifted customization state (HomeCustomizeBar.tsx "WIRING RECIPE"): the
  // bar's toggles and HomePanels' render set share this one array. Re-derived
  // when `roleKey` changes via React's adjust-state-during-render pattern so
  // each role's own stored HOME_ORDER layout is honored on persona switch
  // (the mismatched render's output is discarded by React before commit).
  const [panelState, setPanelState] = useState<{ roleKey: string; visibleKeys: readonly HomePanelKey[] }>(() => ({
    roleKey,
    visibleKeys: resolveVisibleKeys(roleKey),
  }));
  if (panelState.roleKey !== roleKey) {
    setPanelState({ roleKey, visibleKeys: resolveVisibleKeys(roleKey) });
  }
  // Built conditionally (rather than `versionLabel={sidebarVersionLabel}`
  // directly) because this project's `exactOptionalPropertyTypes` setting
  // treats Sidebar's optional `versionLabel` as exactly `string`, not
  // `string | undefined` — same pattern `StatCard.tsx`/`BoardDeck.tsx`
  // document for their own optional-prop forwarding.
  const sidebarProps: SidebarProps = {
    activeId: 'home',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="home" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="home-main" style={MAIN_STYLE} aria-labelledby="home-page-title">
          <h1 id="home-page-title" style={TITLE_STYLE}>
            Home
          </h1>
          <div style={STAT_ROW_STYLE}>
            {/* survey_map.md 4197–4296: "$540,000/yr freed". G11: label carries
                the exact "cost capacity already freed" measure distinction. */}
            <StatCard label="Cost capacity already freed" value="$540,000" unit="/yr" />
            {/* survey_map.md 4197–4296: "3.5 FTE". */}
            <StatCard label="Capacity freed" value="3.5" unit="FTE" />
          </div>
          <div style={CTA_ROW_STYLE}>
            {/* D18 (presenter_entry_redesign.md §1): product-native primary
                CTA — same Button primitive, same slot, same weight; the
                destination is script step 2's own `do` action. */}
            <Button variant="primary" label="Open today's regulatory feed" onPress={() => onNavigate('onside.feed')} />
          </div>
          {/* W2 (addendum §1.7 / Batch 7): customization surfaces, strictly
              below the unchanged StatCard row + primary CTA — see file
              header "HOME CUSTOMIZATION." */}
          <HomeCustomizeBar
            roleKey={roleKey}
            roleFirstName={roleFirstName}
            visibleKeys={panelState.visibleKeys}
            onChange={(nextVisibleKeys) => setPanelState({ roleKey, visibleKeys: nextVisibleKeys })}
          />
          <HomePanels
            visibleKeys={panelState.visibleKeys}
            currentRoleKey={roleKey}
            onNavigate={onNavigate}
            {...(onDeepLink !== undefined ? { onDeepLink } : {})}
          />
        </main>
      </div>
    </div>
  );
}
