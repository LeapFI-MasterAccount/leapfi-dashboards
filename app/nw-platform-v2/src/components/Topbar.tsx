/**
 * Topbar — Composite C4 (design_system_spec.md §2.2, §3.2)
 *
 * "BackChip (Button/ghost), Breadcrumb (Label), LivePill (Tag),
 * NotificationBell (Icon+Tag), ProfileMenu (Avatar+dropdown of Buttons),
 * DateDisplay (Label), BoardDeckButton (Button/ghost)."
 *
 * STALE AS OF D20 (decisions.md; task B1): the §2.2/§3.2 "Built from" list
 * and region map quoted above are the spec's original wording and are left
 * verbatim for citation purposes, but BackChip no longer exists in this
 * component — struck and replaced by a LeapFI-logo Home nav control. See
 * the "D20 — BACKCHIP STRUCK, LOGO-AS-HOME-NAV ADDED" section further down
 * this header for the current, correct leading-region behavior; treat
 * every "BackChip" mention above and in the two AMBIGUITY-RESOLVED notes
 * immediately below as historical record of a now-superseded decision, not
 * current behavior.
 *
 * STALE AS OF D21 (decisions.md): within the "D20 — BACKCHIP STRUCK,
 * LOGO-AS-HOME-NAV ADDED" section below, the "ASSETS" bullet's two-master
 * import list and the entire "THEME SWAP WITHOUT OWNING THEME STATE"
 * bullet describe a CSS-driven swap between `-Black` and `-Transparent`
 * logo images that no longer exists in this file — both bullets are left
 * in place, marked superseded inline, as the historical record of the
 * D20-era approach. See the "D21 — DARK CHROME BAND, SINGLE-MASTER LOGO"
 * section (after the D20 section) for the current, correct logo and
 * chrome behavior.
 *
 * Region map, left -> right (§3.2, followed literally over the
 * alphabetical "Built from" list order above, since §3.2 explicitly
 * labels itself the region map): BackChip -> Breadcrumb -> [flex space]
 * -> LivePill -> BoardDeckButton -> NotificationBell -> DateDisplay ->
 * ProfileMenu.
 *
 * `banner` landmark; ProfileMenu is a proper disclosure per the C4 a11y
 * baseline: the Avatar trigger carries `aria-haspopup="menu"` and live
 * `aria-expanded` (via Avatar's disclosure-passthrough props); opening
 * moves focus to the first `role="menuitem"`; ArrowDown/ArrowUp move
 * through the items with wrap (Home/End jump to first/last); Esc closes
 * and restores focus to the trigger; Tab closes the menu and returns
 * focus to the trigger so the browser's default Tab continues past it
 * (WAI-ARIA menu pattern — a menu is dismissed on Tab-out, never
 * focus-trapped like a dialog).
 *
 * AMBIGUITY RESOLVED — BackChip at-root rendering (§3.2 BackChip state
 * machine: "at-root (no back target, chip hidden/disabled)"): the spec
 * offers both "hidden" and "disabled" as satisfying that state without
 * picking one. I chose hidden (not rendered) rather than rendered-
 * disabled: a permanently-disabled control with no future path is exactly
 * the pattern Button's own a11y baseline warns against ("disabled buttons
 * are never the sole path to a required action") — there is no action
 * here at all when at-root, so parking an inert control in the layout
 * adds a confusing stop with nothing behind it. Hidden avoids that
 * without losing anything: `at-root` has no affordance to communicate.
 *
 * AMBIGUITY RESOLVED — Breadcrumb/DateDisplay Label variant: §2.1 P3
 * lists `body-secondary`/`eyebrow` but §3.2 does not say which variant
 * either region uses. Both are used here, matching their role as
 * secondary chrome text rather than the page's primary heading content.
 *
 * DISPATCH-LEVEL ADDITION — theme toggle slot: design_system_spec.md
 * §3.2's region map does not mention a theme toggle at all (Topbar's
 * spec surface is silent on it — no composite in §2.2 names one either).
 * The comp-shell dispatch brief explicitly requires a "theme toggle
 * slot," so `themeToggleSlot` is added as an optional `ReactNode` slot —
 * this component never owns theme state or renders a default toggle
 * itself (theme state lives in `App.tsx`, outside this dispatch's
 * allowlist); it only reserves a place to render whatever control the
 * integrating screen supplies. Placed last before ProfileMenu so it never
 * displaces any of the seven elements §3.2 does explicitly order.
 *
 * DISPATCH-LEVEL ADDITION — profile/user-switcher hooks: ProfileMenu's
 * "dropdown of Buttons" (§2.2 C4) is exposed as a plain `profileMenuItems`
 * array of {id, label, onPress} — this file does not hardcode persona
 * data or switching logic (that belongs to whichever data/App file owns
 * the persona list), it only provides the disclosure chrome and the hook
 * surface the brief asks for.
 *
 * BREADCRUMB TRUNCATION (fix A-overlap-05; base anchor
 * leapfi-platform.html:66 `.crumb{...white-space:nowrap;overflow:hidden;
 * text-overflow:ellipsis}`): the base explicitly ellipsized the crumb so
 * the bar's right-hand cluster stayed on-screen at any width. The twin's
 * nowrap breadcrumb had no shrink path, so a narrow window pushed the
 * theme toggle and ProfileMenu past the viewport edge behind a document
 * scrollbar. The breadcrumb span now carries `minWidth:0` + ellipsis
 * overflow (and the bar itself `minWidth:0`), restoring the base's
 * bounded-bar behavior. The bar deliberately does NOT get
 * `overflow:hidden` — the ProfileMenu dropdown is an absolutely
 * positioned descendant and must not be clipped.
 *
 * RESET DEMO ROW (fix B-dead-interactions-12; base anchor
 * leapfi-platform.html:852 `<div class="pm-reset"
 * onclick="resetDemo()">…Reset demo…`): the base's avatar menu carried a
 * product-surface "Reset demo" row; the twin's only reset lived behind
 * the hidden PresenterRail. ProfileMenu now always appends a "Reset
 * demo" menuitem (after the caller-supplied items, below a separator)
 * that calls the store's `resetDemo()` (state/demoStore.ts) directly —
 * per the fix dispatch's contract. Scope notes, documented rather than
 * silently exceeded: (1) the base's resetDemo also reset the persona and
 * navigated Home (source 3957–3958) — those halves are App-owned state
 * (App.handleRestart) outside this component's reach and this dispatch's
 * allowlist; (2) the base's Shift+Alt+R chord (same row's copy) remains
 * unported on the product surface (PresenterRail.tsx's header documents
 * that), so the row's label here is "Reset demo" without the shortcut
 * copy — advertising a dead chord would be its own defect.
 *
 * PARITY-ASSEMBLY ADDITION — `notificationSlot` (parity_ia_addendum.md
 * §1.5 "Shell-level: Notification Bell" / §6 Batch 7): `NotificationBell`
 * (this file, internal/unexported) is a plain count-badge with a single
 * `onPress` — it has no popover of its own, and the addendum's real bell
 * surface is `views/NotificationBellPanel.tsx`, a self-contained composite
 * (its own file header explains why: it cannot be built by extending this
 * file's internal, unexported `NotificationBell`, since that function
 * cannot be imported from outside this file). Rather than duplicate that
 * panel's trigger chrome a second time inside this file, `notificationSlot`
 * follows the exact `themeToggleSlot` precedent immediately above: an
 * optional `ReactNode` extension point the integrating shell can fill with
 * a real composite. When supplied, it renders in the bell's own §3.2
 * region position, in place of (not alongside) the internal count-badge
 * button — a screen with a real notification feed should show one bell,
 * not two. `notificationCount`/`onOpenNotifications` are left fully
 * backward-compatible: omitting `notificationSlot` reproduces this file's
 * exact pre-existing behavior.
 *
 * D20 — BACKCHIP STRUCK, LOGO-AS-HOME-NAV ADDED (decisions.md D20; task
 * B1): the top-left "Back to <screen>" BackChip (this file's earlier
 * AMBIGUITY-RESOLVED section above, now historical — it documents a
 * rendering choice for a control this revision removes outright, kept only
 * so the reasoning trail isn't silently deleted) is gone. In its place, the
 * region's leading slot renders the LeapFI wordmark as a Home navigation
 * control:
 *
 *   - ASSETS [SUPERSEDED BY D21 — see the D21 section below; this
 *     component imports ONLY `-Transparent.png` now, `-Black.png` is not
 *     imported at all]: the two committed brandkit master PNGs (fd038b6,
 *     ASSET-1/D10 — binding masters, place-as-is, never redrawn/recolored/
 *     reconstructed in CSS) — `LeapFI-Logo-WithoutTagline-Black.png` and
 *     `-Transparent.png` — imported as Vite asset URLs (inlined to
 *     data-URIs by `vite-plugin-singlefile` at build time; confirmed via
 *     the gate, not re-verified per-dispatch here). LOGO-3: Without-Tagline
 *     is correct for this "interior/compact/repeated" chrome placement.
 *     LOGO-6: no recolor/stretch/skew — both `<img>`s render at a fixed
 *     `height` with `width: auto`, preserving the asset's native aspect
 *     ratio (LOGO-1's stated 4.770:1) exactly. LOGO-6's no-recolor/
 *     stretch/skew rule and LOGO-3's Without-Tagline choice both still
 *     apply unchanged under D21 — only the two-master/theme-swap half of
 *     this bullet is superseded.
 *
 *   - THEME SWAP WITHOUT OWNING THEME STATE [SUPERSEDED BY D21 — this
 *     entire bullet describes a two-image CSS swap this file no longer
 *     implements; kept verbatim as the historical record of the D20-era
 *     approach, per the "STALE AS OF D21" note at the top of this header.
 *     See the D21 section below for current behavior]: this component has
 *     never held theme state (the `themeToggleSlot` note above is explicit
 *     that theme lives in `App.tsx`, outside this file's allowlist) and
 *     still doesn't — `App.tsx` stamps `data-theme` on
 *     `document.documentElement` (verbatim D13 mechanism), so the swap was
 *     done in pure CSS against that ancestor attribute rather than by
 *     threading a new theme prop through every screen's `TopbarProps` call
 *     site. Both `<img>`s were always mounted; a scoped `<style>` (rendered
 *     once, module-level constant `LOGO_SWAP_CSS`) hid whichever variant
 *     didn't match `[data-theme]`, defaulting to the dark/Black variant
 *     when the attribute was absent yet (`:root:not([data-theme='light'])`
 *     — same default tokens.css itself uses for its own `:root,
 *     [data-theme='dark']` shared block). Verified empirically against
 *     jsdom's actual `getComputedStyle` cascade (attribute-selector
 *     `display` rules from an injected `<style>` DO apply in this test
 *     environment — not assumed); D21's own CSS mechanism (custom-property
 *     scoping rather than `display` toggling) needed a fresh empirical
 *     check of a different jsdom limitation — see the D21 section's
 *     "TESTED VIA CSSOM" bullet.
 *
 *   - LOGO-4/LOGO-5 TENSION, ACKNOWLEDGED: LOGO-5's stated digital minimum
 *     for the Without-Tagline lockup is 80px tall; a 56px-tall topbar
 *     cannot host an 80px logo without either growing the whole bar (out
 *     of this dispatch's scope — Topbar's `BAR_STYLE.minHeight` predates
 *     this change and no other region demands more room) or shrinking the
 *     mark. `LOGO_HEIGHT` below is 28px — a legible compact-chrome
 *     precedent (roughly double `NotificationBell`'s 24px icon), scaled
 *     proportionally per LOGO-6, not a redraw. This is a knowing deviation
 *     from LOGO-5's stated minimum for this one compact placement, not a
 *     doctrine change; flagged in the dispatch return rather than silently
 *     shipped. Clear space (LOGO-4, "≥ height of the L") is approximated
 *     via the button's own padding — the source PNG is a flattened raster
 *     with no accessible glyph metrics to measure the cap-height of the
 *     "L" from at build time, so exact clear space isn't mechanically
 *     verifiable here; the padding chosen is generously larger than the
 *     glyph-in-lockup would need at this scale.
 *
 *   - ACCESSIBLE NAME / KEYBOARD: a native `<button>` (not a styled `<a>`
 *     or div) carries `aria-label="LeapFI — Home"` (the button's only
 *     content is two `alt=""` decorative images, so the label is the sole
 *     accessible name source) and is keyboard-focusable and operable by
 *     default — no custom key handling needed, unlike ProfileMenu's
 *     disclosure. Hover/focus treatment mirrors `NotificationBell`'s own
 *     pattern immediately below (panel-tint hover, `--focus-ring` glow) for
 *     one consistent chrome-control visual language.
 *
 *   - `onNavigateHome` (new, optional `TopbarProps` member) fires on press.
 *     STOP-ITEM / KNOWN GAP (reported, not silently improvised): `App.tsx`
 *     is outside this dispatch's allowlist and does not pass
 *     `onNavigateHome` in its `topbarProps` object today, so in the
 *     currently-running app the Home logo control renders correctly
 *     (visible, focusable, correct accessible name — D21: there is now
 *     only one logo variant, so "correct theme variant" no longer applies)
 *     but is not yet WIRED to actually navigate — pressing it is a no-op
 *     until a follow-on dispatch adds `onNavigateHome: () =>
 *     navigateToScreen('home')` to `App.tsx`'s `topbarProps` (App.tsx isn't
 *     touched here for the same reason `backTarget`'s deprecation below
 *     doesn't touch it either). This mirrors the existing
 *     `themeToggleSlot`/`notificationSlot` precedent of this component
 *     exposing an extension point a separate integrating dispatch fills.
 *
 *   - `backTarget`/`TopbarBackTarget` DEPRECATED, NOT REMOVED: the prop and
 *     exported type stay in `TopbarProps` — accepted, silently ignored,
 *     never rendered — purely so `App.tsx` (which still builds and passes
 *     a `backTarget` value derived from `previousScreenId`) keeps
 *     type-checking without this dispatch touching it. That
 *     `previousScreenId`/`backTarget`-construction plumbing in `App.tsx` is
 *     now dead weight with no consumer; its removal is census-gap cleanup
 *     for whichever dispatch next has `App.tsx` in its allowlist, per the
 *     TASK line's own framing — not done here.
 *
 * D21 — DARK CHROME BAND, SINGLE-MASTER LOGO (decisions.md D21; supersedes
 * the D20 "ASSETS" two-master list and "THEME SWAP WITHOUT OWNING THEME
 * STATE" bullets above — see the "STALE AS OF D21" note at the top of this
 * header):
 *
 *   - WHY: D20 assumed the brandkit held one dark-glyph master per theme
 *     (`-Black` for dark backgrounds, `-Transparent` for light). It does
 *     not: both masters carry the SAME white-LEAP/cyan-FI glyph art — the
 *     only difference is that `-Black` bakes a solid black rectangle in
 *     behind the glyphs, while `-Transparent` has no background fill at
 *     all. On a true black page background the baked slab is invisible
 *     (it blends with the page); on the topbar's actual chrome colors
 *     (`--panel` #0D1525 / `--bg2` #0D0D0D, both navy-tinted, neither
 *     literal #000000) the `-Black` master's slab would show up as a
 *     visible mismatched rectangle behind the glyphs. D21 (user-ratified
 *     via AskUserQuestion, orchestrator-surfaced during D20 implementation)
 *     resolves this by dropping `-Black` entirely and keeping the topbar's
 *     chrome band a CONSTANT DARK SURFACE in both themes — consistent with
 *     the sidebar's dark chrome and the TalonFI dark-chrome inspiration
 *     (talonfi_layout_reference.md) — so `-Transparent` (background-
 *     agnostic by construction) is the only master this component ever
 *     needs.
 *
 *     STOP-ITEM / DISCREPANCY, reported not silently accepted: D21's own
 *     decision text describes the sidebar as "already dark" in both
 *     themes. `Sidebar.tsx` (outside this dispatch's allowlist) renders
 *     its nav column with `background: var(--bg2)` — a GLOBAL token that
 *     flips to Frost White (`#F7FAFC`) in `[data-theme='light']` per
 *     tokens.css, with no scoped override anywhere in that component or
 *     its CSS. As shipped today the sidebar does not appear to be
 *     dark-locked in light mode; D21's "already-dark" premise looks
 *     inaccurate against the current code. This dispatch's ALLOWLIST is
 *     Topbar.tsx / tokens.css / shell tests only, so `Sidebar.tsx` is not
 *     touched or fixed here — flagging for the dispatcher rather than
 *     guessing whether the sidebar also needs a scoped dark-lock in a
 *     follow-on dispatch.
 *
 *   - SINGLE MASTER, NO SWAP: `HomeLogoButton` now imports and renders only
 *     `logoTransparent`, unconditionally, as a single `<img>` — no
 *     `logoBlack` import, no `LOGO_SWAP_CSS`, no `data-lf-logo-variant`
 *     attribute, no theme-conditional `display` toggling. Artifact impact:
 *     the ~187KB `-Black` master (`src/assets/LeapFI-Logo-WithoutTagline-
 *     Black.png`) no longer gets base64-inlined into the single-file build
 *     by `vite-plugin-singlefile` — see this dispatch's evidence return for
 *     the measured before/after artifact byte delta. The asset file itself
 *     is untouched on disk; D21/ASSET-1 concern only this component's
 *     *usage* of it, not the brandkit inventory.
 *
 *   - CONSTANT DARK CHROME MECHANISM: `TOPBAR_DARK_CHROME_CSS` (module-
 *     level constant, rendered once via the same "sibling `<style>`, not
 *     nested inside interactive markup" technique `LOGO_SWAP_CSS` used)
 *     redeclares the CSS custom properties this component's own styles and
 *     its child primitives (Button/Tag/Avatar/Icon/Switch — all outside
 *     this dispatch's allowlist) already consume via `var(--x)`: `--bg`,
 *     `--bg2`, `--panel`, `--border`, `--ink`, `--ink2`, `--ink3`,
 *     `--accent`, `--accent2`, `--focus-ring`, `--focus-ring-outline` —
 *     scoped to `[data-lf-composite='topbar']` (this component's own root
 *     `<header>`, no new attribute needed), UNCONDITIONALLY — no
 *     `[data-theme=...]` gate on that rule. Every value is copied VERBATIM
 *     from tokens.css's own `:root, [data-theme='dark']` core-palette block
 *     (see that file's SOURCES comment) — not invented, not a new pairing.
 *     Because CSS custom properties resolve per element (a descendant's
 *     own declared value always wins over an inherited one), this single
 *     scoped block forces every color a Topbar-owned style or a
 *     Topbar-descendant primitive resolves via `var()` to its dark-theme
 *     value, in both themes, WITHOUT touching tokens.css's global `:root`/
 *     `[data-theme]` blocks (every other screen keeps reading those
 *     normally) and without branching this component's own render logic
 *     per theme. This is the "scoped token block" option the dispatch
 *     brief offered, chosen over hardcoding literal hex into every
 *     individual style object in this file, because most of the affected
 *     color values live inside primitive components (Avatar/Button/Tag/
 *     Icon/Switch) this dispatch cannot edit — a scoped custom-property
 *     override is the only mechanism available that reaches them without
 *     touching their files. `BAR_STYLE`/`LABEL_STYLE`/`HomeLogoButton`/
 *     `NotificationBell` below are UNCHANGED by this — they already read
 *     `var(--bg2)`/`var(--ink)`/`var(--ink2)`/`var(--panel)`/
 *     `var(--focus-ring)` and simply inherit the forced values now.
 *
 *   - CONTRAST DISPOSITION (brief task 3 — cite existing dark-palette
 *     pairs, invent none): every color pair this mechanism puts on the
 *     dark band is one brand_doctrine.md and tokens.css already ratify for
 *     dark theme; this dispatch makes them apply CONSTANTLY instead of
 *     only when `data-theme='dark'` — it does not create new pairs.
 *     brand_doctrine.md's Accessibility section (line 71): "WCAG 2.1 AA
 *     minimum (AAA preferred). Approved: Cyan/Black ≈12.6:1; White/Black
 *     21:1; Cool Grey/Black ≈4.8:1." Concretely on this band: Breadcrumb
 *     (`--ink` #FFFFFF) and DateDisplay (`--ink2` #9BA0A6) against the band
 *     background (`--bg2` #0D0D0D) are the White/Black-family and
 *     Cool-Grey/Black-family pairs that line approves; the Live Tag
 *     (`status-positive`) keeps its fill `--sem-positive` (theme-invariant,
 *     unaffected by this scoping) with text `var(--bg)` forced to
 *     `#000000` — the SAME black-on-green pairing already shipped in dark
 *     theme today, now constant; "Open board deck" (ghost Button),
 *     NotificationBell, the theme Switch, and the ProfileMenu Avatar
 *     trigger all resolve to their existing dark-theme `--ink`/`--panel`/
 *     `--border` colors — no new color, no new pairing, on any of them.
 *     Focus treatment on every focusable control in the band is
 *     tokens.css's dark `--focus-ring` (cyan glow, brand_doctrine.md
 *     Accessibility: "Focus states visible, cyan glow preferred"), in both
 *     themes.
 *
 *   - PROFILEMENU DROPDOWN — LEFT ON PAGE THEME (brief task 3, "your call,
 *     document it"): the popover itself (`[data-lf-composite=
 *     'profile-menu-list']`, the `role="menu"` panel — NOT the Avatar
 *     trigger) is deliberately NOT forced dark. A second, narrower rule —
 *     `[data-theme='light'] [data-lf-composite='topbar']
 *     [data-lf-composite='profile-menu-list']` — restores tokens.css's
 *     `[data-theme='light']` core-palette values (again copied verbatim,
 *     same property list) for just that popover subtree when the page
 *     theme is light. Rationale: a menu popover reads as a page-surface
 *     overlay in most UI languages — it appears above page content on
 *     open, not as part of the fixed chrome band it's anchored to — and
 *     matching the page theme avoids a dark rectangle appearing over an
 *     otherwise light page every time a light-mode user opens it. In dark
 *     theme this second rule never matches (`[data-theme='light']` is
 *     absent from the root), so the popover simply keeps the forced-dark
 *     values already in scope from the outer block — identical to dark
 *     theme's existing rendering, no discontinuity between themes for that
 *     case. The Avatar trigger stays inside the always-dark scope (it sits
 *     outside `profile-menu-list`), so it stays legible against the dark
 *     band while closed, in both themes; only the opened popover's own
 *     surface follows page theme.
 *
 *   - TESTED VIA CSSOM, NOT COMPUTED STYLE: jsdom (this project's test
 *     environment) does not perform CSS custom-property (`var()`)
 *     substitution when computing `getComputedStyle()` — verified
 *     empirically before relying on it (`getComputedStyle(el).background`
 *     / `.getPropertyValue('background-color')` both come back as the
 *     unset default for a `var()`-based inline style, regardless of what
 *     the referenced custom property resolves to), the same discipline the
 *     D20 author applied to jsdom's `display` cascade support above — not
 *     assumed. `topbar.test.tsx`'s D21 coverage therefore asserts against
 *     the parsed `CSSStyleRule` objects on the injected `<style>` sheet
 *     (`styleEl.sheet!.cssRules`, which jsdom DOES parse accurately —
 *     `selectorText` and `style.getPropertyValue('--x')` on each rule) —
 *     rather than resolved computed colors, which jsdom cannot produce for
 *     `var()`-based styles regardless of whether the implementation is
 *     correct.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { Avatar } from './primitives/Avatar';
import { Button } from './primitives/Button';
import { Icon } from './primitives/Icon';
import { Tag } from './primitives/Tag';
import { resetDemo } from '../state/demoStore';
// D21 (decisions.md; file header "D21 — DARK CHROME BAND, SINGLE-MASTER
// LOGO"): `-Black` is NOT imported. The topbar's chrome band is now a
// constant dark surface in both themes, and `-Transparent` (background-
// agnostic art with no baked-in fill) is the only master that works on it
// — see the D21 file-header section for why `-Black`'s baked black slab
// doesn't. Dropping this import stops `vite-plugin-singlefile` from
// base64-inlining the ~187KB PNG into the built artifact.
import logoTransparent from '../assets/LeapFI-Logo-WithoutTagline-Transparent.png';

/** @deprecated D20: the BackChip this described is struck (removed
 * outright). The type stays exported, and `TopbarProps.backTarget` stays
 * accepted-but-ignored, only so `App.tsx` — which still constructs a value
 * of this shape from `previousScreenId` — keeps type-checking without this
 * dispatch touching that file. See the file header "D20 — BACKCHIP STRUCK"
 * section for the full scope note. */
export interface TopbarBackTarget {
  label: string;
  onPress: () => void;
}

export interface TopbarProfile {
  name: string;
  initials?: string;
  image?: string;
}

export interface TopbarProfileMenuItem {
  id: string;
  label: string;
  onPress: () => void;
}

export interface TopbarProps {
  /** Breadcrumb text (Label, body-secondary). */
  breadcrumb: string;
  /** @deprecated D20: the BackChip is struck. Accepted for `App.tsx`
   * compile compatibility only — never read, never rendered. See
   * `TopbarBackTarget`'s own `@deprecated` note. */
  backTarget?: TopbarBackTarget | null;
  /** D20: fires when the LeapFI logo (rendered as the Home nav control) is
   * pressed. Optional — see file header "D20" STOP-ITEM note: `App.tsx`
   * does not yet pass this, so the control is currently unwired in the
   * running app pending a follow-on dispatch. */
  onNavigateHome?: () => void;
  /** LivePill (Tag, status-positive). Defaults to shown; pass `live={false}` to omit it entirely rather than rendering a contradictory "not live" pill. */
  live?: boolean;
  liveLabel?: string;
  /** BoardDeckButton (§3.2 G10) — ghost weight, deliberately not primary (see spec rationale). */
  onOpenBoardDeck: () => void;
  boardDeckLabel?: string;
  /** NotificationBell (Icon `bell` + count Tag). Omit `onOpenNotifications` if there is nowhere to route the click yet. Ignored when `notificationSlot` is supplied. */
  notificationCount?: number;
  onOpenNotifications?: () => void;
  /** See file header "PARITY-ASSEMBLY ADDITION — notificationSlot." Renders in place of the internal count-badge NotificationBell when supplied. */
  notificationSlot?: ReactNode;
  /** DateDisplay (Label, body-secondary) — pre-formatted text; this component does no date formatting. */
  date: string;
  profile: TopbarProfile;
  profileMenuItems: TopbarProfileMenuItem[];
  /** See file header "DISPATCH-LEVEL ADDITION — theme toggle slot." */
  themeToggleSlot?: ReactNode;
}

// D21 (file header "D21 — DARK CHROME BAND, SINGLE-MASTER LOGO" — full
// rationale, sourcing, and contrast disposition there): forces every
// `var(--x)` color role this component and its child primitives
// (Button/Tag/Avatar/Icon/Switch) consume to its DARK value,
// unconditionally, scoped to this component's own `[data-lf-composite=
// 'topbar']` root — values copied verbatim from tokens.css's `:root,
// [data-theme='dark']` core-palette block, no invented colors. The second
// rule narrowly restores tokens.css's `[data-theme='light']` values (also
// copied verbatim) for just the ProfileMenu popover subtree when the page
// theme is light — see file header "PROFILEMENU DROPDOWN" bullet for why
// that one surface is deliberately left on page theme. Rendered once, as a
// sibling `<style>` ahead of `<header>` in `Topbar`'s own return below.
const TOPBAR_DARK_CHROME_CSS = `
  [data-lf-composite='topbar'] {
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
  [data-theme='light'] [data-lf-composite='topbar'] [data-lf-composite='profile-menu-list'] {
    --bg: #ffffff;
    --bg2: #f7fafc;
    --panel: #f1f5f9;
    --border: #d7dee7;
    --ink: #0a2342;
    --ink2: #64748b;
    --ink3: #4a5568;
    --accent: #006d75;
    --accent2: #2d5bff;
    --focus-ring: 0 0 0 2px #ffffff, 0 0 0 4px #006d75;
    --focus-ring-outline: 2px solid #006d75;
  }
`;

// D21: background/border below resolve through the scoped override above —
// still written as `var(--bg2)`/`var(--border)` (unchanged from pre-D21),
// not literal hex, so this stays a single source of truth with tokens.css
// rather than a second hardcoded copy of the same values.
const BAR_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 1rem',
  background: 'var(--bg2)',
  borderBottom: '1px solid var(--border)',
  boxSizing: 'border-box',
  minHeight: 56,
  // A-overlap-05: let the bar shrink inside ancestor flex tracks instead of
  // flooring the page at its nowrap min-content width (base bounded bar, .crumb
  // source 66). No `overflow:hidden` here — the ProfileMenu dropdown must not clip.
  minWidth: 0,
};

const LABEL_STYLE: CSSProperties = {
  font: 'inherit',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--ink2)',
  whiteSpace: 'nowrap',
};

// D20: LOGO-6-safe fixed height, width left `auto` so the asset's native
// 4.770:1 (LOGO-1) aspect ratio is never stretched/skewed. See file header
// "D20" for the LOGO-5 80px-minimum tension this compact value knowingly
// trades off.
const LOGO_HEIGHT = 28;

// D21 (file header "D21 — DARK CHROME BAND, SINGLE-MASTER LOGO"): no swap —
// exactly one master (`-Transparent`) is imported and rendered,
// unconditionally, regardless of `data-theme`. Replaces the D20-era
// `LOGO_SWAP_CSS`/two-`<img>` mechanism (superseded, no longer present).
function HomeLogoButton({ onPress }: { onPress?: (() => void) | undefined }) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <button
      type="button"
      aria-label="LeapFI — Home"
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      data-lf-composite="topbar-home-logo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        // LOGO-4 clear space, approximated — see file header "D20" note
        // on why exact glyph cap-height isn't mechanically measurable
        // from a flattened master PNG.
        padding: '0.375rem 0.5rem',
        minHeight: 44,
        border: 'none',
        borderRadius: 'var(--radius-sm, 6px)',
        background: hover ? 'var(--panel)' : 'transparent',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
        cursor: 'pointer',
        outline: 'none',
        flex: '0 0 auto',
      }}
    >
      <img src={logoTransparent} alt="" style={{ height: LOGO_HEIGHT, width: 'auto' }} />
    </button>
  );
}

function ProfileMenu({ profile, items }: { profile: TopbarProfile; items: TopbarProfileMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // The trigger ref points at the wrapping span; the focusable element is
  // Avatar's internal <button>. Focusing the span itself is a no-op (it
  // has no tabindex), so every focus-restore path resolves the button.
  const focusTrigger = () => {
    triggerRef.current?.querySelector<HTMLElement>('button')?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.querySelector<HTMLElement>('button')?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    }
  }, [open]);

  // WAI-ARIA menu keyboard model (see file header): arrows move focus
  // with wrap, Home/End jump, Tab dismisses. Esc is handled by the
  // document-level listener above (it must also fire when focus has
  // strayed outside the menu, e.g. right after opening via pointer).
  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      // Close and hand focus back to the trigger WITHOUT preventDefault:
      // the browser's default Tab then advances from the trigger, so
      // Tab lands after it and Shift+Tab lands before it.
      setOpen(false);
      focusTrigger();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    event.preventDefault();
    const menuItems = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (menuItems.length === 0) return;
    const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number;
    if (event.key === 'ArrowDown') {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % menuItems.length;
    } else if (event.key === 'ArrowUp') {
      nextIndex = currentIndex < 0 ? menuItems.length - 1 : (currentIndex - 1 + menuItems.length) % menuItems.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else {
      nextIndex = menuItems.length - 1;
    }
    menuItems[nextIndex]?.focus();
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }} data-lf-composite="profile-menu">
      <span ref={triggerRef} style={{ display: 'inline-flex' }}>
        <Avatar
          interactive
          size="small"
          initials={profile.initials}
          image={profile.image}
          name={profile.name}
          ariaHaspopup="menu"
          ariaExpanded={open}
          onPress={() => setOpen((current) => !current)}
        />
      </span>
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`${profile.name} account menu`}
          data-lf-composite="profile-menu-list"
          onKeyDown={handleMenuKeyDown}
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.375rem)',
            right: 0,
            minWidth: 200,
            background: 'var(--panel)',
            // Elevation is carried by the border + panel/bg contrast only —
            // tokens.css defines no elevation/shadow role (§1.1's named-role
            // table has no shadow entry), and no sibling primitive in this
            // codebase uses a raw-color drop shadow (Button/Chip/Input/
            // Switch/Avatar/Slider all reserve box-shadow exclusively for
            // `--focus-ring`). Inventing an un-tokenized rgba shadow here
            // would repeat the raw-color mistake the styling hard rule
            // forbids, just spelled as rgba() instead of hex.
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm, 6px)',
            padding: '0.375rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem',
            zIndex: 50,
          }}
        >
          {items.length === 0 ? (
            <span style={{ ...LABEL_STYLE, padding: '0.5rem' }}>No account actions available</span>
          ) : (
            items.map((item) => (
              <div key={item.id} role="none">
                <MenuButtonItem
                  label={item.label}
                  onSelect={() => {
                    setOpen(false);
                    item.onPress();
                  }}
                />
              </div>
            ))
          )}
          {/* B-12: base pm-reset row (source 852) — always present, below a
              separator, calling the store's resetDemo(). See file header
              "RESET DEMO ROW" for the App-owned persona/nav scope note. */}
          <div role="none" aria-hidden="true" style={{ borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
          <div role="none">
            <MenuButtonItem
              label="Reset demo"
              onSelect={() => {
                setOpen(false);
                resetDemo();
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuButtonItem({ label, onSelect }: { label: string; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'flex',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: 44,
        alignItems: 'center',
        padding: '0.5rem 0.625rem',
        border: 'none',
        borderRadius: 'var(--radius-xs, 4px)',
        background: hover ? 'var(--bg2)' : 'transparent',
        color: 'var(--ink)',
        font: 'inherit',
        fontSize: '0.875rem',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
        outline: 'none',
      }}
    >
      {label}
    </button>
  );
}

function NotificationBell({
  count,
  onPress,
}: {
  count?: number | undefined;
  onPress?: (() => void) | undefined;
}) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const accessibleLabel =
    typeof count === 'number' && count > 0 ? `Notifications, ${count} unread` : 'Notifications';

  return (
    <button
      type="button"
      aria-label={accessibleLabel}
      disabled={!onPress}
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      data-lf-composite="notification-bell"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 44,
        minHeight: 44,
        border: 'none',
        borderRadius: 'var(--radius-sm, 6px)',
        background: hover && onPress ? 'var(--panel)' : 'transparent',
        boxShadow: focused ? 'var(--focus-ring)' : 'none',
        cursor: onPress ? 'pointer' : 'default',
        outline: 'none',
      }}
    >
      <Icon name="bell" size={24} tone={onPress ? 'default' : 'disabled'} />
      {typeof count === 'number' && count > 0 ? (
        <span style={{ position: 'absolute', top: 2, right: 2 }}>
          <Tag text={count > 99 ? '99+' : String(count)} variant="count" />
        </span>
      ) : null}
    </button>
  );
}

export function Topbar({
  breadcrumb,
  onNavigateHome,
  live = true,
  liveLabel = 'Live',
  onOpenBoardDeck,
  boardDeckLabel = 'Open board deck',
  notificationCount,
  onOpenNotifications,
  notificationSlot,
  date,
  profile,
  profileMenuItems,
  themeToggleSlot,
}: TopbarProps) {
  return (
    // D21: <style> is metadata content, not valid inside <header>'s
    // phrasing-content model — sibling here, ahead of the header, not
    // nested inside it (same rule the removed D20 LOGO_SWAP_CSS followed).
    <>
      <style>{TOPBAR_DARK_CHROME_CSS}</style>
      <header role="banner" data-lf-composite="topbar" style={BAR_STYLE}>
        {/* D20: BackChip struck, replaced by the LeapFI logo as the Home nav
            control. See file header "D20" section. */}
        <HomeLogoButton onPress={onNavigateHome} />

        {/* A-overlap-05: base .crumb truncation (source 66) — nowrap + hidden
            overflow + ellipsis, with minWidth:0 so flex can actually shrink it. */}
        <span
          style={{
            ...LABEL_STYLE,
            fontWeight: 600,
            color: 'var(--ink)',
            flex: '0 1 auto',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {breadcrumb}
        </span>

        <span style={{ flex: '1 1 auto' }} aria-hidden="true" />

        {live ? <Tag text={liveLabel} variant="status-positive" /> : null}

        <Button label={boardDeckLabel} variant="ghost" onPress={onOpenBoardDeck} />

        {notificationSlot ?? <NotificationBell count={notificationCount} onPress={onOpenNotifications} />}

        <span style={LABEL_STYLE}>{date}</span>

        {themeToggleSlot ? <span data-lf-slot="theme-toggle">{themeToggleSlot}</span> : null}

        <ProfileMenu profile={profile} items={profileMenuItems} />
      </header>
    </>
  );
}
