/**
 * Sidebar — Composite C3 (design_system_spec.md §2.2, §3.1)
 *
 * "SidebarItem list (§3.1)." Nav-model classification: flat top-level
 * list, at most one nesting level (Talon system item 1, cited by §3.1).
 * `nav` landmark; minimum a11y bar per spec C3 is standard tab order
 * through visible items (roving arrow-key focus is explicitly optional,
 * not implemented here).
 *
 * HIDDEN COMPOSITE STATE (amendment A13, design_system_spec.md §3.0
 * addendum, §2.2 C3): a new `hidden` prop (default `false`) is this
 * component's own render-output switch for the Board Deck exemption
 * (§5.7, "not a Sidebar item"). Sprint 1 shipped that exemption as a real
 * unmount/remount in App.tsx (`showSidebar ? <Sidebar/> : null`), which
 * silently discarded this component's own `overrides` state (manual
 * collapse/expand memory) on every Board Deck round trip — reproduced,
 * ruled BEHAVIOUR-IS-WRONG, and closed by this amendment (§8 R-4(k)).
 * `hidden` is a state THIS instance renders through, not a condition on
 * whether the instance exists: App.tsx now mounts `<Sidebar>`
 * unconditionally and only toggles `hidden`, so the same fiber (and the
 * `overrides` state it owns) persists across a Board Deck visit. See the
 * `hidden` prop's own doc comment and the early return near the bottom of
 * this function for the mechanism, which matches C21 PresenterRail's own
 * `Hidden`-state baseline exactly (reused, not invented — Core Principle
 * 4): render nothing at all, so there are no stray tab stops and no
 * separate aria-hidden bookkeeping to maintain.
 *
 * Static nav structure — §3.1's restructure table, as amended by PI2-D39
 * (settled user decision, below): not invented:
 *
 *   1. Home                          (no children)
 *   2. OnSide    -> Overview, Regulatory feed, Documents, Ownership
 *                   (expanded by default, PI2-D33)
 *   3. Studio    -> Ask, Investment Design, Roadmap
 *   4. Connect                       (no children — disabled, PI2-D39)
 *   5. Vantage                       (no children — disabled, PI2-D39)
 *   6. Reporting                     (no children)
 *   7. Settings  -> Toggles, About
 *
 * 7 top-level items — at the ≤7 budget §3.1 states, not over it. See
 * "PI2-D39" section below for the Connect/Vantage restructure this count
 * reflects.
 *
 * PARITY-ASSEMBLY ADDITION — OnSide · Overview 4th nested child
 * (parity_ia_addendum.md §0, resolved conservatively there and ratified
 * here by the wiring dispatch that also gives it a `ScreenId` in
 * `App.tsx`): `overview` is added first in OnSide's `children` array,
 * matching the base engine's own `os-sub` ordering (survey_map.md
 * 762-821, `overview` first). This is a pure data addition to the
 * existing `NavChild` literal shape already used by every other nested
 * item here — no new nesting level, no change to `Sidebar`'s click
 * contract or to any of the 3 already-shipped OnSide children.
 *
 * AMBIGUITY RESOLVED — default expand state (§3.1): the spec is explicit
 * that Connect ships expanded by default ("not collapsed-by-default like
 * OnSide/Studio... so the Step-1 gesture still communicates the platform
 * is bigger than what gets demoed") and explicit that OnSide/Studio are
 * collapsed by default. Settings is not mentioned by that clause at all
 * ("existing shallow nesting kept" is the only note). I defaulted
 * Settings to collapsed, matching the OnSide/Studio baseline rather than
 * Connect's stated exception, since the spec only carves the exception
 * out for Connect and gives no basis to extend it to Settings.
 *
 * SUPERSEDED — PI2-D39 (settled user decision, not re-litigated here):
 * the "default expand state" note directly above, and the "C3 CONTRACT
 * CHANGE — navigable group header" section further down (B-dead-
 * interactions-11), both describe a Connect that no longer exists in the
 * NAV table below. Connect and Vantage are promoted to two flat, sibling,
 * top-level entries — Connect loses its `children`/`defaultExpanded`/
 * `navigable` entirely, and Vantage (formerly its sole nested child)
 * becomes its own top-level row beside it. Both ship `disabled: true`
 * (`SidebarItem`'s new `disabled` prop — see that file's header) and
 * render a "Coming Soon" `Tag` (P4, `locked` variant — the same
 * primitive/variant SetupCard/SoonSplash "Soon" cards already use, C15/
 * C16). Net top-level count: 7 (was 6) — see "Static nav structure"
 * above and §3.1's ≤7 budget, still honored, now at the limit rather
 * than with headroom.
 *
 * ROUTING left unchanged (implementer call, not a design decision — the
 * design decision was PI2-D39 itself): the routed ScreenIds `connect`
 * and `connect.vantage` (App.tsx `SCREEN_IDS`) are reused verbatim as
 * these two NAV entries' own `id`s, so App.tsx needs no edit. Both stay
 * fully routable exactly as before, via Roadmap's "What's next"
 * SetupCards (`Roadmap.tsx` `MODULE_ENTRIES`, `variant="interactive"`,
 * untouched by this dispatch) — "leave routable," never a broken
 * reference. Only the *sidebar* entries stop being clickable, matching
 * the `disabled` contract they now carry; every other path to these two
 * screens is unaffected.
 *
 * B-11's split-control mechanism itself (SidebarItem.tsx's
 * `onChevronPress` prop / `splitMode` render branch) is NOT removed by
 * this change — it stays implemented, reusable the moment a future group
 * header needs "navigate AND expand" again. It simply has no live NAV
 * caller today, since Connect was its only one; the "C3 CONTRACT CHANGE"
 * section below is left as the historical record of why it was built,
 * with its one now-inaccurate claim ("today only `connect`") corrected
 * in place rather than deleted.
 *
 * SUPERSEDED IN PART — PI2-D33 (r07 OQ-5): the §3.1 "OnSide collapsed by
 * default" premise this note relied on is overruled for OnSide only.
 * OnSide's group header stays, its children stay nested (no top-level
 * promotion — see NAV below), and it now ships `defaultExpanded: true`,
 * the same `NavTopItem.defaultExpanded` mechanism below (originally
 * proven by Connect, before PI2-D39 removed Connect's own use of it —
 * see "SUPERSEDED — PI2-D39" above; the mechanism itself is unchanged).
 * Studio keeps the original collapsed-by-default reading (PI2-D33 Q2 =
 * NO); Settings keeps this note's own collapsed default, unchanged.
 *
 * DESIGN NOTE — group toggle while a child is active (base-faithful per
 * leapfi-platform.html @1c230fe): the base's group toggles collapse an
 * open group even while it owns the active screen — toggleOnsideNav
 * (source 3834) and toggleStudioNav (source 1778) both run
 * `g.classList.toggle('open')` with no active-row guard — and the base's
 * `go()` (source 3801, force-open at 3813–3816) re-opens the destination
 * module's group on every navigation into it. This file ports both
 * halves: (1) a manual override always wins over child-active
 * auto-expand, so the header click visibly collapses/expands and
 * `aria-expanded` always changes — never an inert-yet-enabled toggle;
 * (2) navigating into a group clears any stale collapse override, so
 * the `aria-current="page"` row is always revealed on arrival. An
 * earlier revision instead forced expansion while childActive, which
 * silently swallowed the click into a deferred override that collapsed
 * the group later, after navigating elsewhere (SH-11); this is the
 * base-faithful replacement. Absent any override or child activity, a
 * group falls back to `defaultExpanded`.
 *
 * NAV SCROLL CONTAINMENT (fix A-overlap-03 / C-unbounded-growth-03; base
 * anchor leapfi-platform.html:35 `.nav{flex:1;...;overflow-y:auto}`): the
 * base's nav column was its own bounded scroll surface, so a fully
 * expanded tree never grew the page or slid under fixed chrome (the
 * PresenterRail's height inset makes this the demo path). The twin had
 * dropped that overflow entirely — the item list here now carries
 * `flex:1 1 auto; minHeight:0; overflowY:auto`, restoring the base's
 * internal scroll chain: expanded groups scroll inside the sidebar and
 * the version footer stays pinned below the list, exactly the base's
 * `.nav` + footer split.
 *
 * C3 CONTRACT CHANGE — navigable group header (fix B-dead-interactions-11;
 * base anchor leapfi-platform.html:803 `<span class="os-sub os-modlink"
 * onclick="go('connect')">Connect`): the base's Connect group label was a
 * real navigation to the Connect module splash, and demo_script_draft.md
 * Step 6 literally directs "click Connect in the sidebar." C3's original
 * contract here ("top-level items with children never call onNavigate")
 * made that directed click a toggle-only dead end. NEW CONTRACT, flagged
 * for design_system reconciliation: a group header whose id is itself a
 * routed ScreenId (`navigable: true` in the NAV table below) NAVIGATES
 * AND EXPANDS on label press, while a separate chevron control toggles
 * expansion only (SidebarItem's split-control mode). Non-navigable group
 * headers (OnSide/Studio/Settings — no routed screen of their own) keep
 * the original toggle-on-press contract unchanged. CORRECTED (PI2-D39,
 * see that section above): Connect was this mechanism's only caller and
 * no longer uses it (Connect has no `children` at all now) — no NAV
 * entry sets `navigable: true` today. The mechanism itself is unchanged
 * and stays available for a future group header that needs it.
 *
 * DESIGN NOTE — footer version string (§3.1 "Footer: version string
 * only"): rendered as a plain token-styled span, not through the `Label`
 * primitive. `--ink3` is named in the token table (§1.1) specifically for
 * "Tertiary text (footer/copyright)," but the `Label` primitive only
 * exposes that color via its `disabled` flag (a semantically unrelated
 * state — this text is not a disabled control). Reusing `disabled` to
 * fish out a color would misrepresent the row's semantics for a cosmetic
 * shortcut, so this file references `var(--ink3)` directly instead —
 * still token-only, no raw hex, per the styling hard rule.
 *
 * SIDEBAR DARK-LOCK (decisions.md D21; dispatch closing Topbar.tsx's own
 * D21 STOP-ITEM): D21 ratified the topbar's constant-dark-chrome band
 * "consistent with the already-dark sidebar and the TalonFI dark-chrome
 * inspiration" (decisions.md D21 row). Topbar.tsx's D21 file-header
 * section flagged that premise as inaccurate against the code as shipped:
 * this file rendered `NAV_STYLE.background` via the GLOBAL `--bg2` token,
 * which tokens.css flips to Frost White (`#F7FAFC`) under
 * `[data-theme='light']` — so the nav column was not actually dark-locked,
 * it just happened to read as dark under the app's dark default. This
 * section closes that gap using the exact mechanism Topbar.tsx's
 * `TOPBAR_DARK_CHROME_CSS` established (design_system_spec.md's
 * Talon-style dark sidebar; talonfi_layout_reference.md's dark-chrome
 * inspiration), not a new one:
 *
 *   - MECHANISM: `SIDEBAR_DARK_CHROME_CSS` (module-level constant,
 *     rendered once as a sibling `<style>` ahead of `<nav>` — `<style>` is
 *     metadata content, invalid inside `<nav>`'s phrasing-content model,
 *     same placement rule `TOPBAR_DARK_CHROME_CSS` follows relative to
 *     `<header>`) redeclares the SAME 11 custom properties Topbar's block
 *     does — `--bg`, `--bg2`, `--panel`, `--border`, `--ink`, `--ink2`,
 *     `--ink3`, `--accent`, `--accent2`, `--focus-ring`,
 *     `--focus-ring-outline` — scoped to `[data-lf-composite='sidebar']`
 *     (this component's own root `<nav>`, no new attribute needed),
 *     UNCONDITIONALLY, no `[data-theme=...]` gate. Every value is copied
 *     VERBATIM from tokens.css's own `:root, [data-theme='dark']`
 *     core-palette block — identical to `TOPBAR_DARK_CHROME_CSS`'s source,
 *     not re-derived. Because CSS custom properties resolve per element
 *     and a descendant's own inherited value always comes from its
 *     nearest ancestor declaration, this single scoped block forces every
 *     `var()` color this file (`NAV_STYLE`/`FOOTER_STYLE`/the version
 *     span) and every descendant primitive `SidebarItem` composes
 *     (`Icon`'s `--ink`/`--accent`/`--ink3` tone map, `Tag`'s `count`
 *     variant `--panel`/`--ink`/`--border`) resolves to its dark value, in
 *     both themes — without touching tokens.css's global blocks (every
 *     other screen keeps reading those normally) and without editing
 *     `SidebarItem.tsx` at all: `SidebarItem` already reads every color
 *     exclusively via `var(--x)` (see that file's `ROW_BASE_STYLE`/
 *     `rowStyle`/chevron-button styles), so it inherits the forced values
 *     the same way Topbar's Button/Tag/Avatar/Icon primitives do — no
 *     scoping needed in that file, confirmed by inspection, not assumed.
 *
 *   - NO POPOVER CARVE-OUT: Topbar.tsx's parallel mechanism narrows a
 *     second rule back to page-theme values for the ProfileMenu popover
 *     subtree, because that popover reads as a page-surface overlay
 *     positioned above page content on open. Sidebar has no equivalent —
 *     every row, including an expanded group's nested `<ul>`, renders
 *     inline within the same fixed nav column, never as a floating
 *     overlay — so there is no comparable surface to exempt; the nav
 *     column is dark-locked in full, no exceptions.
 *
 *   - CONTRAST DISPOSITION (brief task — cite existing dark-palette pairs,
 *     invent none): brand_doctrine.md's Accessibility section: "WCAG 2.1
 *     AA minimum (AAA preferred). Approved: Cyan/Black ≈12.6:1; White/
 *     Black 21:1; Cool Grey/Black ≈4.8:1." Concretely on this column:
 *     default-state rows (`--ink` #FFFFFF text on the `--bg2` #0D0D0D
 *     column background) are the White/Black-family pair that line
 *     approves; the footer version string (`--ink3` #7B8794, tokens.css's
 *     amendment-corrected dark-mode tertiary value, S4.1) reads at
 *     5.31–5.74:1 on that same background per tokens.css's own comment.
 *     Hover/active rows swap to `--panel` (#0D1525 Card Blue) underneath
 *     the same `--ink` white — materially darker than the approved-pair
 *     Black baseline, so contrast only improves. The current-item state
 *     (`SidebarItem.tsx` `color: current ? 'var(--accent)' : 'var(--ink)'`
 *     plus the `3px solid var(--accent)` left border) is Brand Cyan
 *     (`--accent` #00F2FF) on that same dark surface — brand_doctrine.md's
 *     own core-palette table is explicit this pairing is NOT
 *     interchangeable with the light-theme swap: "Primary accent |
 *     #00F2FF (Brand Cyan) | ... NEVER on white/light backgrounds (1.3:1 —
 *     fails WCAG)" — exactly why `lightmode_amendment_proposal.md`
 *     replaces `--accent` with Deep Teal `#006D75` for light-theme PAGE
 *     content (LM-PAL-6). Dark-locking the column is what keeps Cyan
 *     legal here: without this fix, a light-theme render would compute
 *     `--accent` as the light-mode Deep Teal token while the column's
 *     `background` (unscoped `--bg2`) also flipped light — a page-content
 *     pairing, not a dark-chrome one, and never the failing raw
 *     Cyan-on-white case either way; this mechanism keeps both the
 *     surface AND the accent pinned to the dark-mode pair the doctrine
 *     approves, constantly. Focus treatment on every focusable row is
 *     tokens.css's dark `--focus-ring` (cyan glow, brand_doctrine.md
 *     Accessibility: "Focus states visible, cyan glow preferred"), in
 *     both themes — same token Topbar's band forces, same citation.
 *
 *   - TESTED VIA CSSOM: `sidebar.test.tsx`'s dark-lock coverage asserts
 *     against the parsed `CSSStyleRule` objects on the injected `<style>`
 *     sheet, not resolved computed colors — jsdom does not perform
 *     `var()` substitution in `getComputedStyle()` (verified empirically
 *     by the Topbar.tsx D21 author already; not re-verified per-dispatch
 *     here, same limitation, same workaround).
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { SidebarItem, sidebarNestedListId } from './SidebarItem';
import type { IconName } from './primitives/Icon';

interface NavChild {
  id: string;
  label: string;
}

interface NavTopItem {
  id: string;
  label: string;
  icon?: IconName;
  children?: NavChild[];
  defaultExpanded?: boolean;
  /** Group header whose id is ITSELF a routed ScreenId (App.tsx SCREEN_IDS):
   * label press navigates AND expands; a split chevron control toggles only.
   * See file header "C3 CONTRACT CHANGE" (B-11; base source 803). */
  navigable?: boolean;
  /** PI2-D39: renders this top-level row disabled (native `disabled`,
   * "Coming Soon" Tag) — see file header "SUPERSEDED — PI2-D39" and
   * SidebarItem.tsx's own "DISABLED ROW + COMING SOON MARKER". */
  disabled?: boolean;
}

// See file header: icons intentionally omitted (STOP-item — closed
// IconName vocabulary has no matching nav glyphs for these seven items).
const NAV: NavTopItem[] = [
  { id: 'home', label: 'Home' },
  {
    id: 'onside',
    label: 'OnSide',
    defaultExpanded: true,
    // PI2-D33: OnSide's group header stays, its children stay nested (not
    // promoted to top level), and the group ships default-expanded, via
    // the `defaultExpanded` mechanism below. Studio and Settings stay
    // collapsed by default (PI2-D33 Q2 = NO).
    children: [
      { id: 'onside.overview', label: 'Overview' },
      { id: 'onside.feed', label: 'Regulatory feed' },
      { id: 'onside.documents', label: 'Documents' },
      { id: 'onside.ownership', label: 'Ownership' },
      // USER RULING PI2-D43 (q11-01 CLOSED, YES; sprint-1.1 S1.1-04): a 5th
      // OnSide nested child, after Ownership, carrying a persistent
      // undecided-case count badge fed by `casesUndecidedCount` below. `id`
      // is reused verbatim from the already-routed `ScreenId` `'cases'`
      // (App.tsx `SCREEN_IDS`) — same reuse-not-rename precedent PI2-D39 set
      // for Connect/Vantage — so App.tsx's routing needs no edit. This is a
      // NESTED child (depth 1, matching OnSide's other four), not a new
      // top-level row, so it does not touch the ≤7 top-level budget (§3.1)
      // or the `sidebar.test.tsx` seven-top-level-items tripwire.
      { id: 'cases', label: 'Cases' },
    ],
  },
  {
    id: 'studio',
    label: 'Studio',
    children: [
      { id: 'studio.ask', label: 'Ask' },
      { id: 'studio.investment-design', label: 'Investment Design' },
      { id: 'studio.roadmap', label: 'Roadmap' },
    ],
  },
  // PI2-D39 (settled user decision — see file header "SUPERSEDED —
  // PI2-D39"): Connect and Vantage are two flat, sibling, top-level,
  // disabled entries — no group, no children, no `navigable`/
  // `defaultExpanded`. `id`s are unchanged from the routed ScreenIds
  // App.tsx already declares (`connect`, `connect.vantage`) — reused
  // verbatim, not renamed, so both stay routable via Roadmap's "What's
  // next" SetupCards without any App.tsx edit.
  { id: 'connect', label: 'Connect', disabled: true },
  { id: 'connect.vantage', label: 'Vantage', disabled: true },
  { id: 'reporting', label: 'Reporting' },
  {
    id: 'settings',
    label: 'Settings',
    children: [
      { id: 'settings.toggles', label: 'Toggles' },
      { id: 'settings.about', label: 'About' },
    ],
  },
];

// SIDEBAR DARK-LOCK (file header "SIDEBAR DARK-LOCK" — full rationale,
// sourcing, and contrast disposition there): forces every `var(--x)` color
// role this component and its `SidebarItem`-composed descendants (Icon/Tag)
// consume to its DARK value, unconditionally, scoped to this component's own
// `[data-lf-composite='sidebar']` root — values copied verbatim from
// tokens.css's `:root, [data-theme='dark']` core-palette block, identical
// source to Topbar.tsx's `TOPBAR_DARK_CHROME_CSS`, no invented colors. No
// second popover-restore rule (see file header "NO POPOVER CARVE-OUT" — the
// sidebar has no overlay surface analogous to Topbar's ProfileMenu). Rendered
// once, as a sibling `<style>` ahead of `<nav>` in `Sidebar`'s own return
// below.
const SIDEBAR_DARK_CHROME_CSS = `
  [data-lf-composite='sidebar'] {
    --bg: #000000;
    --bg2: #0d0d0d;
    --panel: #0d1525;
    --border: #1e2d3d;
    --ink: #ffffff;
    --ink2: #9ba0a6;
    --ink3: #7b8794;
    --accent: #00f2ff;
    --accent2: #2d5bff;
    --focus-ring: 0 0 0 2px #000000, 0 0 0 4px #00f2ff, 0 0 12px 2px rgba(0, 242, 255, 0.65);
    --focus-ring-outline: 2px solid #00f2ff;
  }
`;

export interface SidebarProps {
  /** Id of the current top-level item (leaf, e.g. 'home') or nested item (e.g. 'onside.feed'). */
  activeId: string;
  /** Fires with a leaf item's id — or with a `navigable` group header's own id
   * (B-11: base os-modlink `go('connect')`, source 803; see file header "C3
   * CONTRACT CHANGE"). Non-navigable group headers still only toggle expand. */
  onNavigate: (id: string) => void;
  /** Footer version string (§3.1 "Footer: version string only"). Defaults to the existing engine's value (survey_map.md 762–821). */
  versionLabel?: string;
  /**
   * A13 (design_system_spec.md §3.0 addendum, §2.2 C3 `hidden` composite
   * state): the Board Deck exemption's ONLY render path. Default `false`
   * (unchanged, visible behavior). When `true`, this same component
   * instance renders nothing — matching C21 PresenterRail's own `Hidden`
   * baseline exactly ("aria-hidden and removed from tab order... not
   * merely visually hidden," implemented there by returning `null` for the
   * hidden-state render, reused here rather than inventing a second
   * mechanism). The caller (App.tsx) must keep mounting `<Sidebar>`
   * unconditionally and toggle only this prop — conditionally omitting the
   * `<Sidebar>` element itself is a real unmount and defeats the point:
   * this component's own `overrides` state (manual collapse/expand memory,
   * `useState` below) lives in the same fiber and is untouched by entering
   * or leaving `hidden`, but only if the instance is never destroyed.
   */
  hidden?: boolean;
  /**
   * USER RULING PI2-D43 (S1.1-04): the current undecided-case count, sourced
   * by the caller (App.tsx) from the SAME exported predicate
   * (`data/cases.ts` `isUntouched`) `screens/Cases.tsx`'s own "N of M have
   * been decided yet" header already computes
   * (`CASES.filter(isUntouched).length`) — never a second, independently
   * derived count. Attached ONLY to the `cases` nested child's `count` Tag
   * (`SidebarItem`'s existing `count?: number` prop/render branch,
   * `SidebarItem.tsx:118-119,182,252` — unmodified, no new component); every
   * other row passes no `count`. AC-S1.1-04-2: a zero-badge is not a call to
   * action, so when the source count is `0` this component passes
   * `undefined` to `SidebarItem`, not `0` — `undefined` is the default.
   */
  casesUndecidedCount?: number;
}

const NAV_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  boxSizing: 'border-box',
  background: 'var(--bg2)',
  borderRight: '1px solid var(--border)',
};

const LIST_STYLE: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: '0.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
  // A-overlap-03 / C-unbounded-growth-03: the base nav scrolled internally
  // (`.nav{flex:1;...;overflow-y:auto}`, source 35) — an expanded tree must
  // never grow the page or slide under the fixed PresenterRail.
  flex: '1 1 auto',
  minHeight: 0,
  overflowY: 'auto',
};

const NESTED_LIST_STYLE: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
};

const FOOTER_STYLE: CSSProperties = {
  padding: '0.75rem',
  borderTop: '1px solid var(--border)',
};

export function Sidebar({
  activeId,
  onNavigate,
  versionLabel = 'v 1.071',
  hidden = false,
  casesUndecidedCount,
}: SidebarProps) {
  // Manual collapse/expand overrides, keyed by top-level item id. Absent
  // entries fall back to child-active auto-expand, then `defaultExpanded`.
  // See file header DESIGN NOTE: an override always wins — the base's
  // toggles collapse a group even while it owns the active screen.
  //
  // A13: this state is declared before any conditional return (the `hidden`
  // early-return below) so it survives entering/leaving `hidden` exactly
  // the same way it survives any other re-render — React preserves a
  // function component's hook state across renders regardless of what that
  // render returns, as long as the calling element (`<Sidebar>` in App.tsx)
  // stays mounted at the same position in the tree.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  // Base `go()` (source 3813–3816) force-opens the destination's group on
  // every navigation into it. Port: when `activeId` moves into a group
  // that carries a collapse override, clear it so the arrival is visible.
  // (Render-phase derived-state adjustment, not an effect, so the cleared
  // override is applied in the same commit as the navigation itself.)
  const [lastActiveId, setLastActiveId] = useState(activeId);
  if (lastActiveId !== activeId) {
    setLastActiveId(activeId);
    // B-11: a navigable group header's own screen (e.g. 'connect') also
    // force-opens its group on arrival, same as a child destination.
    const owningGroup = NAV.find(
      (item) => item.children !== undefined && (item.id === activeId || item.children.some((child) => child.id === activeId)),
    );
    if (owningGroup && overrides[owningGroup.id] === false) {
      setOverrides((prev) => ({ ...prev, [owningGroup.id]: true }));
    }
  }

  const handleToggle = (itemId: string, currentlyExpanded: boolean) => {
    setOverrides((prev) => ({ ...prev, [itemId]: !currentlyExpanded }));
  };

  // A13 (§3.0 addendum, §2.2 C3 `hidden`): the Board Deck exemption's ONLY
  // render path. This is a render-output decision only, made after every
  // hook above has already run — the component instance itself, and the
  // `overrides` state it closes over, are untouched. Matches C21
  // PresenterRail's own `Hidden`-state baseline exactly (that file's own
  // header: "nothing in the DOM means no tab stops and no aria-hidden
  // bookkeeping needed"), reused rather than invented (Core Principle 4).
  if (hidden) {
    return null;
  }

  return (
    // SIDEBAR DARK-LOCK: <style> is metadata content, not valid inside
    // <nav>'s phrasing-content model — sibling here, ahead of the nav, not
    // nested inside it (same placement rule TOPBAR_DARK_CHROME_CSS follows
    // relative to <header>).
    <>
      <style>{SIDEBAR_DARK_CHROME_CSS}</style>
      <nav aria-label="Primary" data-lf-composite="sidebar" style={NAV_STYLE}>
        <ul style={LIST_STYLE}>
          {NAV.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const childActive = hasChildren && item.children!.some((child) => child.id === activeId);
            // A navigable group header (B-11) is itself a routed screen, so it
            // can be the current item; plain group headers never match activeId.
            const isCurrentTop = item.id === activeId;
            const isNavigableGroup = hasChildren && item.navigable === true;
            const expanded = hasChildren
              ? (overrides[item.id] ?? (childActive || item.defaultExpanded || false))
              : false;

            return (
              <li key={item.id}>
                <SidebarItem
                  id={item.id}
                  label={item.label}
                  icon={item.icon}
                  level="top"
                  current={isCurrentTop}
                  expandable={hasChildren}
                  expanded={expanded}
                  disabled={item.disabled ?? false}
                  onPress={() => {
                    if (!hasChildren) {
                      onNavigate(item.id);
                      return;
                    }
                    if (isNavigableGroup) {
                      // B-11 contract: label press navigates AND expands (base
                      // go('connect') navigation + force-open, source 803 /
                      // 3813–3816). The chevron below is the toggle-only path.
                      if (!expanded) handleToggle(item.id, false);
                      onNavigate(item.id);
                      return;
                    }
                    handleToggle(item.id, expanded);
                  }}
                  {...(isNavigableGroup ? { onChevronPress: () => handleToggle(item.id, expanded) } : {})}
                />
                {hasChildren && expanded ? (
                  <ul id={sidebarNestedListId(item.id)} aria-label={`${item.label} sections`} style={NESTED_LIST_STYLE}>
                    {item.children!.map((child) => (
                      <li key={child.id}>
                        <SidebarItem
                          id={child.id}
                          label={child.label}
                          level="nested"
                          current={child.id === activeId}
                          onPress={() => onNavigate(child.id)}
                          // PI2-D43 (S1.1-04): only the `cases` child ever
                          // carries a count badge; every other nested row
                          // passes no `count` (undefined), same as before.
                          {...(child.id === 'cases' && typeof casesUndecidedCount === 'number' && casesUndecidedCount > 0
                            ? { count: casesUndecidedCount }
                            : {})}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div style={FOOTER_STYLE}>
          <span style={{ color: 'var(--ink3)', fontSize: '0.75rem', fontWeight: 500 }}>{versionLabel}</span>
        </div>
      </nav>
    </>
  );
}
