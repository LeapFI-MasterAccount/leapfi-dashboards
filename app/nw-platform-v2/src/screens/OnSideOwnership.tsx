/**
 * OnSideOwnership — new screen under the already-reserved `onside.ownership`
 * Sidebar leaf (`Sidebar.tsx` `NAV`, unmodified here; `App.tsx` `SCREEN_IDS`/
 * `SCREEN_LABEL`, unmodified here — see STOP-item below on the routing
 * case). Batch 3 of parity_ia_addendum.md §6 ("OnSide · Ownership (RACI +
 * Onboarding)"), base anchors osRaci (leapfi-platform.html 3498–3573) and
 * osOnboarding (3648–3663).
 *
 * Region map (per dispatch TASK line): Topbar → page title → below that, an
 * in-page "How onboarding works" section: 5 numbered SetupCard (C15,
 * `locked` variant — informational, non-interactive) steps, 3 StatCard (C1)
 * checkmarks (Hours back / Exam-ready / One answer), and a closing "Two
 * engines, one platform" Label (P3) block. Satisfies design_system_spec.md
 * §3.1's disposition that Onboarding is "not a separate nested sidebar
 * entry — reachable via in-screen links only" (no 5th OnSide child added;
 * this screen already exists at the reserved `onside.ownership` leaf).
 *
 * L3 UPDATE (PI-3, D6/call-08, sprint-plan.md Sprint 2 L3) — RACI MATRIX
 * RELOCATED TO SETTINGS: the RACI matrix section (DataTable C6, grouped by
 * domain per `M`, columns = the 8 `ROLES`, R/A/C/I mark badges, both
 * legends, and the whole-row-click document-detail Drawer it opened) no
 * longer renders on this screen — call-08's requirement ("relegated to the
 * settings section... a reference tool rather than a daily-use feature")
 * is met by mounting it as an additional stacked card section on
 * `SettingsToggles.tsx` instead (D6: one flat settings screen, no new
 * nested Sidebar children). All of that section's markup/data-derivation
 * logic now lives there. This screen keeps only the onboarding content
 * below and its own "Ask OnSide" entry point — neither depends on RACI.
 * `TWO_ENGINES_CARD_STYLE`/`ROLE_LEGEND_STYLE`/`RACI_MARK_LEGEND_STYLE`
 * stay declared and exported from THIS file (below): the first is still
 * rendered here (the onboarding "Two engines, one platform" card); the
 * latter two are no longer rendered here but are now imported and reused
 * by `SettingsToggles.tsx`'s relocated RACI section (reuse, not a second,
 * parallel style declaration) and are also asserted directly against this
 * file by `theme/__tests__/panelStyle.test.ts` (out of this lane's
 * ALLOWLIST) — removing the exports would break that cross-file contract,
 * so they are kept here even though this file's own JSX no longer renders
 * them.
 *
 * SUPERSEDED — Topbar/Sidebar data ownership (amendment A11,
 * design_system_spec.md §3.0): both composites now mount exactly once, in
 * App.tsx's persistent Shell — this screen no longer accepts a `topbar`
 * prop or builds a local `SidebarProps`. It also no longer accepts
 * `onNavigate`: this screen never called it directly (every internal
 * action here is a Drawer open/close), so that plumbing was dead the
 * moment its only consumer (the local `sidebarProps` construction) was
 * removed.
 *
 * STOP-ITEM RESOLVED — App.tsx routing (stale claim corrected by the
 * fix-wave gate dispatch, RPT-10 class; an earlier revision of this
 * header still reported the case as "not wired" pending an App-owning
 * follow-up): `App.tsx` routes `case 'onside.ownership'` to this screen
 * (parity-assembly wave), exactly per the two-line recipe this header
 * originally specified. The `OutOfScopeScreen` fallback this paragraph
 * once referenced no longer exists at all — every ScreenId now routes to
 * a real screen (see App.tsx's "EVERY SIDEBAR DESTINATION ROUTES TO A
 * REAL SCREEN" header section, SH-4/RAIL-06).
 *
 * STOP-ITEM / DEVIATION — onboarding data ported locally, not into a shared
 * data module: parity_ia_addendum.md §2 item 1 recommends porting the
 * 5-step array + two paragraphs of osOnboarding copy into `data/onside.ts`
 * or a new `data/onboarding.ts`. Both are outside this dispatch's ALLOWLIST
 * (single file, this screen only), and neither existed yet in this
 * worktree at dispatch time (`data/onside.ts` ports only ROLES/M from the
 * osRaci range, per that file's own header — the osOnboarding range was not
 * ported by any prior dispatch). Rather than leave the "How onboarding
 * works" section unbuilt over a data-file-location technicality, the exact
 * same trivial literal values (verbatim from source 3649–3663, no business
 * logic, same as every other ported dataset in this codebase) are declared
 * as module-scope constants below (`ONBOARDING_STEPS`, `ONBOARDING_STATS`,
 * etc.). If a shared `data/onboarding.ts` is later created, these constants
 * are a direct cut/paste move with no shape changes needed.
 *
 * AMBIGUITY RESOLVED — Drawer single-instance scoping: same reasoning
 * `OnSideDocuments.tsx` already documents and App.tsx's own header now
 * confirms is satisfied ("routed one-at-a-time... none of the 7 screens has
 * cross-screen drawer content that would justify lifting ownership up to
 * [App.tsx]"). This screen mounts its own local `<Drawer>` — the existing
 * shared Drawer/DrawerContent *components*, not a new composite — which is
 * the established, already-approved pattern for exactly this single-
 * screen-mounted-at-a-time SPA shape. Reading the brief's "reuse the
 * already-built Drawer/DrawerContent, never a new instance" as "never a
 * second *simultaneously open* Drawer instance" (the C7 a11y baseline's
 * actual constraint), not as "never mount a `<Drawer>` element in this
 * file" — the latter reading would make the requirement impossible to
 * satisfy from a single-screen-file allowlist at all, since some component
 * in this file has to render the Drawer JSX for the row-open interaction
 * to exist.
 *
 * RACI-specific implementation notes that used to live here (FIX WAVE
 * "RACI DENSITY REGRESSION", the group-row/badge/theme-safe-color notes,
 * the "Domain owners" sub-table omission note) moved with the section —
 * see `SettingsToggles.tsx`'s own header for the current, accurate
 * version of all of them (L3 UPDATE note above).
 *
 * This screen still declares `DeepLinkScreenProps`/reads `onDeepLink`: the
 * "Ask OnSide" chat panel forwards it as `onDeepLinkPress` for any
 * deep-linked chat suggestion (§2.9), independent of the relocated RACI
 * section's own (separate) `onDeepLink` use in its new home.
 *
 * SetupCard `locked` variant for onboarding steps (dispatch TASK line:
 * "informational/non-interactive use"): `SetupCard.tsx`'s only non-
 * interactive variant is `locked`, which renders a trailing `lock` glyph
 * (a status marker per that component's own header, substituted for the
 * `interactive` variant's chevron specifically so a non-clickable card
 * never implies a hidden action). There is no third "plain informational,
 * no icon" SetupCard variant in this component today. Using `locked` here
 * is the only way to satisfy "non-interactive" with this composite as
 * built, but it does mean each onboarding step visually carries a lock
 * glyph that has nothing to do with access being restricted — flagging for
 * design-authority review rather than inventing a new SetupCard variant
 * outside this dispatch's allowlist.
 *
 * No Drawer footer on this screen: per parity_ia_addendum.md §4's
 * action-hierarchy audit, "OnSide → Ownership: no screen-level primary CTA
 * (reference content)". The RACI section's own read-only document-detail
 * Drawer (and its `useDemoStore()`/live-`DOCLIB` adoption-reactivity note)
 * moved to `SettingsToggles.tsx` along with the section (L3 UPDATE above);
 * this screen's own Drawer is chat-only now (see below).
 *
 * HTML entity/inline-tag decoding: `decodeText` below is a straight,
 * intentional duplicate of `OnSideDocuments.tsx`'s own `decodeDocText` —
 * the osOnboarding copy ported into this file uses the same small
 * ported-HTML vocabulary (`&amp;`, `&rsquo;`, `<b>`, etc.), and this
 * dispatch's allowlist has no shared-utils file to host one copy in (same
 * reasoning `RedlineDiffView.tsx`'s own header already gives for its local
 * word-diff implementation).
 *
 * Accessibility gate (persona directive 7): the onboarding section is real
 * `<h2>`/`<h3>`/`<ol>` semantics — an `<ol>` for the 5 *numbered* steps per
 * the TASK line, native list semantics conveying order to assistive tech
 * without relying on the visible "01" text alone. `Drawer` (C7, unmodified)
 * supplies focus trap/initial-focus/restore-on-close for the chat entry
 * point. No live-region is added on this screen: nothing here mutates
 * row-by-row status.
 *
 * Tests: this worktree now carries Vitest + Testing Library — this
 * screen's regression suite lives in `src/__tests__/onside/` (the earlier
 * "no test runner installed" STOP-item recorded here is resolved and
 * removed).
 *
 * Layout constants (240px sidebar column, 2rem content padding): copied
 * verbatim from `Home.tsx`/`OnSideDocuments.tsx`'s own documented
 * implementer judgment call for visual consistency across screens, not
 * re-derived independently.
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Drawer } from '../components/Drawer';
import { SetupCard } from '../components/SetupCard';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/primitives/Button';
import { AskChatPanel } from '../components/AskChatPanel';
import type { DeepLinkScreenProps } from '../App';
import { PANEL_STYLE } from '../theme/panelStyle';
import { ONSIDE_CHAT_MODULE_CONFIG } from '../data/askChatModuleConfig';

/* ============ HTML entity/inline-tag decoding — see file header ============ */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
  '&ndash;': '–',
  '&mdash;': '—',
  '&quot;': '"',
  '&#39;': '’',
  '&nbsp;': ' ',
};

function decodeText(input: string): string {
  return input
    .replace(/<\/?(b|strong|em|br)\s*\/?>/gi, '')
    .replace(/&[a-z#0-9]+;/gi, (match) => HTML_ENTITY_MAP[match] ?? match);
}

/* ============ onboarding data — verbatim literal port, osOnboarding, ============ */
/* ============ leapfi-platform.html 3648-3663 — see file header STOP-item ============ */

const ONBOARDING_HEADING = 'How onboarding works · five steps to automated monitoring';

type OnboardingStep = readonly [num: string, title: string, description: string];

const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  [
    '01',
    'Share your current state',
    'Policies, procedures, and supporting evidence in whatever shape they are already in: Word files, PDFs, scans, spreadsheets, board minutes. We connect to your repository (SharePoint, GRC) or store a copy securely.',
  ],
  [
    '02',
    'Build a baseline',
    'One clear picture of governance readiness, measured against financial-services risk standards, and the targets you set for each domain.',
  ],
  [
    '03',
    'We monitor regulators',
    'Federal guidance, state law, local ordinances, the applicable risk frameworks, and your own documents. Monitored separately, because obligations stack.',
  ],
  [
    '04',
    'Early alerts &amp; suggestions',
    'The moment a change is sensed on any layer, the entire document set is checked. You see what moved, which layer it came from, and what requires updating.',
  ],
  [
    '05',
    'We propose, you approve',
    'Every gap arrives with proposed language to close it. The LeapFI risk team reviews first, suggestions are pushed electronically, and nothing changes until you approve.',
  ],
] as const;

interface OnboardingStat {
  label: string;
  sub: string;
}

const ONBOARDING_STATS: readonly OnboardingStat[] = [
  {
    label: 'Hours back',
    sub: 'the reading, cross-referencing, and hunting stops being a job a person performs; what remains is judgement',
  },
  {
    label: 'Exam-ready',
    sub: 'documentation current in near real time. Nobody assembles history from email threads before an exam',
  },
  {
    label: 'One answer',
    sub: 'a single current view of where the institution stands, in language a board can act on',
  },
] as const;

const TWO_ENGINES_HEADING = 'Two engines, one platform';

/* ============ layout constants — see file header ============ */

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
  gap: '2rem',
};
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
/** §5.8 region map addition (amendment A16, PI2-D42) — utility corner
 * (§5.1's originally-named placement), seated beside the page title. */
const HEADER_ROW_STYLE: CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' };
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)' };
const DOMAIN_HEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' };
/** Kept exported (unused in this file's own JSX since the L3 relocation,
 * file header note above) — the R/A/C/I mark legend and 8-role legend
 * "panel" boxes these described are now rendered by `SettingsToggles.tsx`'s
 * relocated RACI section, which imports and reuses both consts directly
 * (reuse, not a second declaration) — see this file's header for why the
 * exports themselves stay here (cross-file `theme/__tests__/panelStyle.test.ts`
 * contract, out of this lane's ALLOWLIST). Label text in both used
 * `--chart-axis`, not `--ink2` — see the historical "Adjacent fix" note,
 * moved to `SettingsToggles.tsx`'s header. */
export const ROLE_LEGEND_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '0.5rem',
  padding: '0.875rem 1rem',
  ...PANEL_STYLE,
};
export const RACI_MARK_LEGEND_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  padding: '0.875rem 1rem',
  ...PANEL_STYLE,
};
const STEP_LIST_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: 0, padding: 0, listStyle: 'none' };
const STEP_ITEM_STYLE: CSSProperties = { flex: '1 1 220px', minWidth: 220 };
const STAT_ROW_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1rem' };
const STAT_ITEM_STYLE: CSSProperties = { flex: '1 1 220px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: '0.5rem' };
export const TWO_ENGINES_CARD_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '1.1rem 1.25rem',
  ...PANEL_STYLE,
};

/** No screen-specific members beyond deep-link — `topbar`/`onNavigate` were removed as dead once Sidebar/Topbar mount moved to App.tsx's Shell (see file header); this screen never called `onNavigate` directly, only fed it to the Sidebar it no longer renders. */
export type OnSideOwnershipProps = DeepLinkScreenProps;

export function OnSideOwnership({ onDeepLink }: OnSideOwnershipProps) {
  // Re-renders on demo-store writes so live DOCLIB reads (doc status /
  // §2.9 — the "Ask OnSide" chat as this screen's only remaining Drawer
  // content target since the RACI doc-detail branch relocated with the
  // RACI section (L3 UPDATE, file header). Bumping `chatOpenNonce` forces
  // AskChatPanel to remount fresh on every open (§2.9.5 fresh-open reseed,
  // AC-A16-8).
  const [chatOpen, setChatOpen] = useState(false);
  const [chatOpenNonce, setChatOpenNonce] = useState(0);

  /** §2.9.5 entry affordance — "Ask OnSide" utility-corner trigger. */
  const handleOpenChat = () => {
    setChatOpenNonce((n) => n + 1);
    setChatOpen(true);
  };

  return (
    <>
      <main id="onside-ownership-main" style={MAIN_STYLE} aria-labelledby="onside-ownership-title">
          <div style={HEADER_ROW_STYLE}>
            <h1 id="onside-ownership-title" style={TITLE_STYLE}>
              OnSide · Ownership
            </h1>
            {/* §5.8 entry affordance (amendment A16, PI2-D42) — uniform
                across all four onside.* screens. */}
            <Button variant="secondary" label={ONSIDE_CHAT_MODULE_CONFIG.entryLabel} onPress={handleOpenChat} />
          </div>

          <section aria-labelledby="onside-onboarding-heading" style={SECTION_STYLE}>
            <h2 id="onside-onboarding-heading" style={SUBHEADING_STYLE}>
              {ONBOARDING_HEADING}
            </h2>

            <ol style={STEP_LIST_STYLE}>
              {ONBOARDING_STEPS.map(([num, title]) => (
                <li key={num} style={STEP_ITEM_STYLE}>
                  <SetupCard title={`${num} · ${decodeText(title)}`} variant="locked" />
                </li>
              ))}
            </ol>

            <div style={STAT_ROW_STYLE}>
              {ONBOARDING_STATS.map((stat) => (
                <div key={stat.label} style={STAT_ITEM_STYLE}>
                  <StatCard label={stat.label} value="✓" />
                </div>
              ))}
            </div>

            <div style={TWO_ENGINES_CARD_STYLE}>
              <h3 style={DOMAIN_HEADING_STYLE}>{TWO_ENGINES_HEADING}</h3>
            </div>
          </section>
      </main>

      <Drawer
        open={chatOpen}
        title={chatOpen ? ONSIDE_CHAT_MODULE_CONFIG.drawerTitle : ''}
        onClose={() => setChatOpen(false)}
      >
        {chatOpen ? (
          <AskChatPanel key={chatOpenNonce} config={ONSIDE_CHAT_MODULE_CONFIG} {...(onDeepLink ? { onDeepLinkPress: onDeepLink } : {})} />
        ) : null}
      </Drawer>
    </>
  );
}
