/**
 * Home — Screen anatomy §5.1 "Home — Step 1 'Day one'" (design_system_spec.md),
 * fed by demo_script_draft.md Step 1 ("Day one") and its G1/G11 gap-register
 * entries.
 *
 * PI2-D40 (user directive 2026-08-20 — supersedes this header's prior
 * region map and the W2/addendum placement note below): (1) the static
 * "Home" h1 is now a randomized greeting, picked within a viewer-local-
 * clock-correct time-of-day bucket (see `resolveHomeGreetings` and the
 * "Viewer-local-clock fix" comment above `HOME_GREETINGS_MORNING`) + the
 * active persona's first name; (2) the two base-anchored KPI StatCards
 * ("Cost capacity already freed" $540,000/yr, "Capacity freed" 3.5 FTE —
 * survey_map.md 4197–4296, G11's label requirement) are REMOVED entirely —
 * the page's purpose is the user configuring the KPIs/flash updates they
 * want to see, not two fixed figures; (3) `HomeCustomizeBar` moves into the
 * top-right utility corner (§5.1's originally-named placement), sharing a
 * header row with the page title, compact — no longer the block stacked
 * below the CTA row that the W2/addendum note below describes. The D22
 * customization contract (lifted `panelState`, per-role show/hide +
 * reorder over `HOME_ORDER`'s visible sequence) is UNCHANGED; only
 * presentation/placement moved.
 *
 * Region map (§5.1, pre-D40, retained for CTA/component sourcing):
 * Topbar (shell) → page title → utility corner (Customize, now always
 * present here per D40) → primary CTA. Components used per spec: Topbar
 * (C4), Sidebar (C3), Button (P2).
 *
 * SUPERSEDED — Topbar/Sidebar data ownership (amendment A11,
 * design_system_spec.md §3.0): both composites now mount exactly once, in
 * App.tsx's persistent Shell, wrapping every routed screen's content
 * region — no screen module (this one included) owns, imports, or renders
 * its own copy of either. This screen no longer accepts a `topbar` prop or
 * builds a local `SidebarProps` object; it keeps only `onNavigate`, which
 * its own content (the primary CTA, HomePanels' go-links) still needs for
 * in-screen navigation, unrelated to rendering Sidebar itself.
 *
 * HOME CUSTOMIZATION (W2, parity_ia_addendum.md §1.7 + Batch 7 line 403 —
 * resolves this header's original "STOP-item if a future dispatch surfaces
 * real customization data"): `HomeCustomizeBar` + `HomePanels` (both
 * already landed) are composed following `HomeCustomizeBar.tsx`'s own
 * documented WIRING RECIPE verbatim: `visibleKeys` is lifted here (one
 * piece of state, two consumers — bar toggles and panel render set can
 * never drift). Placement (PI2-D40, superseding the addendum §1.7 "below
 * the StatCard row + CTA" instruction quoted in this header's prior
 * revision): the bar now sits in §5.1's own originally-named "utility
 * corner", sharing a header row with the page title, compact — a SETTING,
 * not a peer of the primary CTA. `HomePanels` (the secondary
 * DataTable/StatCard/SetupCard surfaces) still renders below the CTA row,
 * so the primary CTA — "Open today's regulatory feed" (D18, see below) —
 * remains the single obvious primary action (R3).
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
 * G11 label requirement (§5.1, cross-referenced from §5.7) SUPERSEDED by
 * PI2-D40: it required an explicit measure label on the Home StatCard
 * ("cost capacity already freed") so it could never be misread against the
 * deck's differently-measured $4.5M/yr figure. PI2-D40 removes that
 * StatCard from Home entirely, so the label-collision it guarded against
 * no longer has a Home-side render to occur on; the deck's own DeckSlide
 * label is unaffected (out of this screen).
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
 * call-04 — NORTHWINDS LOGO + MOCK CONTACT INFO (planning/call-04-homepage-
 * customization.md; meeting_notes_2026-08-20.md:63/86): an additive
 * content block, `NorthwindsBrandStrip`, rendered directly below the
 * greeting `<h1>` — greeting-adjacent, per the source note's own framing
 * ("the greeting" is where the logo request is anchored), and NOT inside
 * `Topbar.tsx`'s wordmark slot, which is a DIFFERENT LeapFI mark serving a
 * different purpose (D9/01-architecture.md row 4: "this is a DIFFERENT
 * logo... in a different slot... an additive image+copy block on
 * Home.tsx, not a Topbar change"). Placement (below the `<h1>`, before the
 * CTA row) is this dispatch's own implementer judgment call — call-04's
 * own open question ("where should the logo be positioned") is unresolved
 * in the brief and no doctrine source pins a px/layout answer, the same
 * category as this file's other documented "Layout constants" judgment
 * calls above.
 *
 * MARK SOURCING — D9 COMPLIANCE (DECISIONS.md D9, ruled by Camille
 * Aubert): "the fictional 'Northwinds' demo-org mark... may be any
 * shape/color appropriate to the fictional client [but] no implementer
 * may derive, recolor, crop, or approximate the Northwinds mark FROM any
 * LeapFI master PNG or the chevron gradient (CHV-1)." `NorthwindsMark`
 * below is wholly original inline SVG vector art authored for this
 * dispatch (a simple four-point compass/wind-rose glyph, evoking
 * "Northwinds" without referencing any LeapFI asset) — it imports no PNG,
 * copies no path data from `Icon.tsx`'s glyph set, and uses a fixed
 * slate/navy palette distinct from CHV-1's cyan-to-cobalt chevron
 * gradient (`--accent`/`--accent2`) specifically so it can never read as
 * a recolor of the LeapFI mark. It is theme-invariant (fixed literal
 * colors, not `var(--accent)`) for the same reason a real client's static
 * brand mark would not repaint itself to match ANOTHER company's theme
 * toggle.
 *
 * "Northwinds" itself (org name, mock address, mock phone) is demo copy
 * for a fictional client — matches this codebase's existing "mock"
 * register (e.g. `data/studio.ts`'s fictional personas, `DOCLIB`'s
 * fictional regulatory citations), never a claim about a real
 * organization.
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
import type { SidebarProps } from '../components/Sidebar';
import { Button } from '../components/primitives/Button';
import { Label } from '../components/primitives/Label';
import { HomeCustomizeBar, resolveVisibleKeys } from '../views/HomeCustomizeBar';
import type { HomePanelKey } from '../views/HomeCustomizeBar';
import { HomePanels } from '../views/HomePanels';
import { CURRENT } from '../data/studio';

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

// PI2-D40: header row seats the page title and the (now top-right,
// compact) HomeCustomizeBar side by side — the "utility corner" §5.1
// originally named. `alignItems: 'flex-start'` keeps the trigger pinned to
// the title's top line rather than centering against the disclosure panel
// height once open.
const HEADER_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
};

const CTA_ROW_STYLE: CSSProperties = {
  display: 'flex',
};

// call-04 — see file header "NORTHWINDS LOGO + MOCK CONTACT INFO."
const BRAND_STRIP_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const BRAND_STRIP_TEXT_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
};

const BRAND_STRIP_ORG_NAME_STYLE: CSSProperties = {
  margin: 0,
  font: 'inherit',
  fontSize: '0.9375rem',
  fontWeight: 700,
  color: 'var(--ink)',
};

/**
 * NorthwindsMark — wholly original inline SVG vector art (D9 compliance —
 * see file header "MARK SOURCING"). A simple four-point compass/wind-rose
 * glyph: two crossed diamonds of differing length forming an eight-ray
 * star, evoking "Northwinds" without copying any LeapFI asset's shape or
 * palette. Fixed literal colors (never `var(--accent)`/`var(--accent2)`),
 * deliberately distinct from CHV-1's cyan-to-cobalt chevron gradient.
 */
function NorthwindsMark() {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      aria-hidden="true"
      data-lf-mark="northwinds"
      style={{ flex: '0 0 auto' }}
    >
      <circle cx="16" cy="16" r="15" fill="none" stroke="#3B4A5A" strokeWidth="1.5" />
      {/* Long north-south / east-west points. */}
      <path d="M16 3 L19 16 L16 29 L13 16 Z" fill="#3B4A5A" />
      {/* Short diagonal points, rotated 45deg from the long pair. */}
      <path d="M5 5 L16 14 L27 5 L18 16 L27 27 L16 18 L5 27 L14 16 Z" fill="#5B7A99" />
      <circle cx="16" cy="16" r="2.25" fill="#F4A93C" />
    </svg>
  );
}

/** call-04 — see file header "NORTHWINDS LOGO + MOCK CONTACT INFO." Mock
 * address/phone (demo copy for a fictional client, per this codebase's
 * existing "mock" register — see file header). */
function NorthwindsBrandStrip() {
  return (
    <div style={BRAND_STRIP_STYLE} data-lf-view="northwinds-brand-strip">
      <NorthwindsMark />
      <div style={BRAND_STRIP_TEXT_STYLE}>
        <p style={BRAND_STRIP_ORG_NAME_STYLE}>Northwinds Federal Credit Union</p>
        <Label text="1200 Meridian Way, Suite 400, Minneapolis, MN 55401 · (612) 555-0148" variant="body-secondary" />
      </div>
    </div>
  );
}

// Viewer-local-clock fix (user-reported defect on rev-76, PI2-D40
// follow-up): PI2-D40's original single flat `HOME_GREETINGS` array picked
// a phrase uniformly at random regardless of the viewer's clock, so a
// viewer in their local afternoon could see "Good morning" — a copy claim
// that contradicts the viewer's own clock (this program's "no lying
// controls" class, PI2-D24, applied to copy). The greeting is now chosen
// at random WITHIN a time-of-day bucket derived from the viewer's LOCAL
// clock (`Date#getHours()`) at mount, keeping PI2-D40's randomized-variety
// intent inside a bucket that can never contradict the clock. "Welcome
// back" is time-neutral (true at any hour) and is included in every
// bucket so the persona-name pairing still has more than one option
// outside the "Good <time>" phrases.
//
// Bucket boundaries (implementer judgment call — no doctrine source
// specifies clock cutoffs; same category as this file's other px/timing
// constants, see file header "Layout constants"):
//   morning:   05:00–11:59 local
//   afternoon: 12:00–16:59 local
//   evening:   17:00–04:59 local (covers evening through late night —
//              no separate "night" phrase exists in this set, and
//              "Good evening" reads correctly through the night hours
//              a demo is unlikely to run in; not a copy decision this
//              implementer is authorized to expand).
// Tests (`home-greeting-clock.test.tsx`) pin every boundary edge above.
export const HOME_GREETINGS_MORNING = ['Good morning', 'Welcome back'] as const;
export const HOME_GREETINGS_AFTERNOON = ['Good afternoon', 'Welcome back'] as const;
export const HOME_GREETINGS_EVENING = ['Good evening', 'Welcome back'] as const;

/**
 * Resolves the time-of-day-correct greeting set for `date` (defaults to
 * "now"), using the viewer's LOCAL clock via `Date#getHours()`. Exported
 * so tests assert bucket membership and boundary edges against this same
 * source of truth rather than hardcoding phrases a second time.
 */
export function resolveHomeGreetings(date: Date = new Date()): readonly string[] {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return HOME_GREETINGS_MORNING;
  if (hour >= 12 && hour < 17) return HOME_GREETINGS_AFTERNOON;
  return HOME_GREETINGS_EVENING;
}

export interface HomeProps extends DeepLinkScreenProps {
  /** Navigation hook for this screen's own in-content links (the primary CTA, HomePanels' go-links) — unrelated to Sidebar, which this screen no longer renders (App.tsx's Shell owns it; see file header). */
  onNavigate: SidebarProps['onNavigate'];
  /**
   * Active persona's role key / first name for the customization surfaces
   * (§1.7). Optional with `CURRENT` defaults — see file header "AMBIGUITY
   * RESOLVED / STOP-item — persona props" for why these are not required
   * and what the follow-up `App.tsx` dispatch should pass.
   */
  roleKey?: string;
  roleFirstName?: string;
}

export function Home({ onNavigate, roleKey = CURRENT.roleKey, roleFirstName = CURRENT.first, onDeepLink }: HomeProps) {
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
  // PI2-D40 + viewer-local-clock fix: one greeting picked per mount from
  // the viewer-local-clock-correct bucket (see `resolveHomeGreetings`) —
  // a fresh mount (initial boot, persona switch remount, or nav away/back)
  // can land on a different greeting within that bucket; never a single
  // fixed literal, and never a bucket that contradicts the viewer's clock.
  const [greeting] = useState(() => {
    const bucket = resolveHomeGreetings();
    return bucket[Math.floor(Math.random() * bucket.length)];
  });
  return (
    <main id="home-main" style={MAIN_STYLE} aria-labelledby="home-page-title">
      {/* PI2-D40: header row — page title + HomeCustomizeBar seated in the
          top-right utility corner, compact (§5.1's originally-named
          placement; see file header "HOME CUSTOMIZATION"). */}
      <div style={HEADER_ROW_STYLE}>
        <h1 id="home-page-title" style={TITLE_STYLE}>
          {greeting}, {roleFirstName}
        </h1>
        <HomeCustomizeBar
          roleKey={roleKey}
          roleFirstName={roleFirstName}
          visibleKeys={panelState.visibleKeys}
          onChange={(nextVisibleKeys) => setPanelState({ roleKey, visibleKeys: nextVisibleKeys })}
        />
      </div>
      {/* call-04 — see file header "NORTHWINDS LOGO + MOCK CONTACT INFO." */}
      <NorthwindsBrandStrip />
      <div style={CTA_ROW_STYLE}>
        {/* D18 (presenter_entry_redesign.md §1): product-native primary
            CTA — same Button primitive, same slot, same weight; the
            destination is script step 2's own `do` action. */}
        <Button variant="primary" label="Open today's regulatory feed" onPress={() => onNavigate('onside.feed')} />
      </div>
      <HomePanels
        visibleKeys={panelState.visibleKeys}
        currentRoleKey={roleKey}
        onNavigate={onNavigate}
        {...(onDeepLink !== undefined ? { onDeepLink } : {})}
      />
    </main>
  );
}
