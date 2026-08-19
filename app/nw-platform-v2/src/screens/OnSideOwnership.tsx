/**
 * OnSideOwnership — new screen under the already-reserved `onside.ownership`
 * Sidebar leaf (`Sidebar.tsx` `NAV`, unmodified here; `App.tsx` `SCREEN_IDS`/
 * `SCREEN_LABEL`, unmodified here — see STOP-item below on the routing
 * case). Batch 3 of parity_ia_addendum.md §6 ("OnSide · Ownership (RACI +
 * Onboarding)"), base anchors osRaci (leapfi-platform.html 3498–3573) and
 * osOnboarding (3648–3663).
 *
 * Region map (per dispatch TASK line): Topbar → page title → RACI matrix
 * (DataTable C6, grouped by domain per `M`, rows = governance documents,
 * columns = the 8 named roles from `ROLES`, cells state
 * Responsible/Accountable/Consulted/Informed as plain text) → role legend →
 * each document row opens the app's existing shared Drawer (C7) +
 * DrawerContent (C8) for its own doc detail → below that, an in-page "How
 * onboarding works" section: 5 numbered SetupCard (C15, `locked` variant —
 * informational, non-interactive) steps, 3 StatCard (C1) checkmarks (Hours
 * back / Exam-ready / One answer), and a closing "Two engines, one
 * platform" Label (P3) block. Satisfies design_system_spec.md §3.1's
 * disposition that Onboarding is "not a separate nested sidebar entry —
 * reachable via in-screen links only" (no 5th OnSide child added; this
 * screen already exists at the reserved `onside.ownership` leaf).
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
 * AMBIGUITY RESOLVED — RACI table shape vs. DataTable's flat row model: the
 * base engine's `osRaci()` renders ONE table with `<tr class="dgroup">`
 * domain-divider rows spanning all columns (source 3552, 3562). This
 * worktree's `DataTable` (C6) has no spanning group-row primitive — it is
 * deliberately generic/column-driven (see its own file header). Grouping
 * "by domain per M" is built the same way `OnSideDocuments.tsx`'s own
 * "Domain impact" section already groups `OBL` by domain: one `<h3>` +
 * one `DataTable` per `M` entry, not one giant table with synthetic group
 * rows. Same precedent, same composite, no new component.
 *
 * RACI cells as plain text (dispatch TASK line, explicit): rendered as the
 * full word ("Responsible"/"Accountable"/"Consulted"/"Informed"), not the
 * base engine's single-letter color-coded badge (`raci-badge raci-R` etc.,
 * source 3558) and not wrapped in `Tag` — `Tag`'s own a11y baseline ("never
 * the sole carrier of meaning") is the reasoning the brief cites for this,
 * and plain text alone already carries the full meaning with nothing added
 * that would need a color-only fallback. Empty cells render a muted "—",
 * matching the muted "no value" convention `OnSideDocuments.tsx` already
 * uses for its own "no redline" cells.
 *
 * "Domain owners" sub-table intentionally omitted: the base engine's
 * `osRaci()` also renders a second "Domain owners" table from a local,
 * unnamed `domOwners` literal (source 3565–3566) — outside the ROLES/3499–
 * 3549 range `data/onside.ts`'s own header says was actually ported, and
 * not named in parity_ia_addendum.md §6 Batch 3's "Data modules" line
 * (`ROLES, M` only) or its own region-map prose. Left out rather than
 * silently re-deriving a second, unported literal table.
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
 * No Drawer footer / no Adopt-Reject actions on this screen: per
 * parity_ia_addendum.md §4's action-hierarchy audit, "OnSide → Ownership:
 * no screen-level primary CTA (reference content)". This screen's Drawer
 * is read-only detail — `Drawer.tsx`'s own `footer` prop doc says to
 * "Omit for drawers with no footer actions (e.g. read-only detail views)",
 * which is exactly this case. A document's pending redline (if any) is
 * still shown via `RedlineDiffView` for informational completeness (the
 * base engine's `docLink` click opens the identical doc detail from this
 * view as from Documents), just with no `adoptSlot`/`rejectSlot` wired —
 * this screen owns no adoption state. FIX WAVE: adoption truth now lives
 * in the shared data layer (`OnSideDocuments.tsx` mutates the `DOCLIB`
 * doc's status/version/rlState on adopt and routes the cascade through
 * `state/demoStore.ts`'s `applyGapClosure`), so this screen simply reads
 * the live `DOCLIB` singleton per render and subscribes via
 * `useDemoStore()` — the earlier cross-screen-state STOP-item recorded
 * here is resolved by that store, not by duplicating state locally.
 *
 * HTML entity/inline-tag decoding: `decodeText` below is a straight,
 * intentional duplicate of `OnSideDocuments.tsx`'s own `decodeDocText` —
 * both `doclib.ts` doc text and the osOnboarding copy ported into this file
 * use the same small ported-HTML vocabulary (`&amp;`, `&rsquo;`, `<b>`,
 * etc.), and this dispatch's allowlist has no shared-utils file to host one
 * copy in (same reasoning `RedlineDiffView.tsx`'s own header already gives
 * for its local word-diff implementation).
 *
 * Accessibility gate (persona directive 7): RACI and onboarding sections
 * are real `<table>`/`<h2>`/`<h3>`/`<ol>` semantics (`DataTable` C6's own
 * `<table>`/`<caption>`/`scope="col"` baseline, an `<ol>` for the 5
 * *numbered* steps per the TASK line, native list semantics conveying
 * order to assistive tech without relying on the visible "01" text alone).
 * `Drawer` (C7, unmodified) supplies focus trap/initial-focus/restore-on-
 * close; `RedlineDiffView` (C9, unmodified) keeps its own non-color-only
 * insert/delete markers. No live-region is added on this screen: nothing
 * here mutates row-by-row status the way `OnSideDocuments.tsx`'s cascade
 * does (this screen writes no state that changes RACI/document data), so
 * there is no async status change to announce.
 *
 * Tests: this worktree now carries Vitest + Testing Library — this
 * screen's regression suite lives in `src/__tests__/onside/` (the earlier
 * "no test runner installed" STOP-item recorded here is resolved and
 * removed).
 *
 * FIX WAVE (ONSIDE-10) — RACI tables render in the base's AUTHORED `M`
 * order (policy first, evidence, drafts last — base osRaci 3552-3562
 * renders `g[2]` with no sorting), not alphabetically: the previous
 * `defaultSortColumnId="doc"` re-ordered every domain group by title on
 * mount, drifting from the base's deliberate ordering. The document
 * column stays user-sortable; only the default is the authored order.
 *
 * Layout constants (240px sidebar column, 2rem content padding): copied
 * verbatim from `Home.tsx`/`OnSideDocuments.tsx`'s own documented
 * implementer judgment call for visual consistency across screens, not
 * re-derived independently.
 */
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { RedlineDiffView } from '../components/RedlineDiffView';
import { SetupCard } from '../components/SetupCard';
import { StatCard } from '../components/StatCard';
import { Label } from '../components/primitives/Label';
import type { TagVariant } from '../components/primitives/Tag';
import { ROLES, M } from '../data/onside';
import type { DocRaci } from '../data/onside';
import { DOCLIB } from '../data/doclib';
import type { DocEntry, DocStatus } from '../data/doclib';
import { useDemoStore } from '../state/demoStore';

type DisplayDoc = DocEntry & { id: string };

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

/* ============ RACI derived lookups ============ */

const DOMAIN_LABEL_BY_KEY: Record<string, string> = Object.fromEntries(M.map(([key, label]) => [key, label]));

const ROLE_DESCRIPTOR: Record<string, string> = Object.fromEntries(ROLES.map(([code, title, name]) => [code, `${title} (${name})`]));

const RACI_BY_DOC_ID: Record<string, DocRaci> = Object.fromEntries(M.flatMap(([, , docs]) => docs.map((doc) => [doc[0], doc] as const)));

type RaciMark = 'A' | 'R' | 'C' | 'I';

const RACI_WORD: Record<RaciMark, string> = {
  A: 'Accountable',
  R: 'Responsible',
  C: 'Consulted',
  I: 'Informed',
};

function raciMarkFor(doc: DocRaci, roleCode: string): RaciMark | null {
  const [, accountable, responsible, consulted, informed] = doc;
  if (accountable === roleCode) return 'A';
  if (responsible === roleCode) return 'R';
  if (consulted.includes(roleCode)) return 'C';
  if (informed.includes(roleCode)) return 'I';
  return null;
}

const RACI_COLUMNS: DataTableColumn<DocRaci>[] = [
  {
    id: 'doc',
    header: 'Governance document',
    sortable: true,
    sortValue: (row) => decodeText(DOCLIB[row[0]]?.t ?? row[0]),
    render: (row) => <span>{decodeText(DOCLIB[row[0]]?.t ?? row[0])}</span>,
  },
  ...ROLES.map(
    ([code]): DataTableColumn<DocRaci> => ({
      id: code,
      header: code,
      render: (row) => {
        const mark = raciMarkFor(row, code);
        return mark ? <span>{RACI_WORD[mark]}</span> : <span style={{ color: 'var(--ink3)' }}>—</span>;
      },
    }),
  ),
];

const STATUS_LABEL: Record<DocStatus, string> = {
  good: 'Current',
  warn: 'Needs attention',
  crit: 'Critical',
};

const STATUS_TAG_VARIANT: Record<DocStatus, TagVariant> = {
  good: 'status-positive',
  warn: 'status-caution',
  crit: 'status-alert',
};

/* ============ layout constants — see file header ============ */

const SCREEN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  background: 'var(--bg)',
  boxSizing: 'border-box',
};

const BODY_ROW_STYLE: CSSProperties = { display: 'flex', flex: '1 1 auto', minHeight: 0 };
const SIDEBAR_REGION_STYLE: CSSProperties = { flex: '0 0 240px' };
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
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)' };
const DOMAIN_HEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto' };
const ROLE_LEGEND_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '0.5rem',
  padding: '0.875rem 1rem',
  borderRadius: 'var(--radius-md, 10px)',
  border: '1px solid var(--border)',
  background: 'var(--panel)',
};
const STEP_LIST_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: 0, padding: 0, listStyle: 'none' };
const STEP_ITEM_STYLE: CSSProperties = { flex: '1 1 220px', minWidth: 220 };
const STAT_ROW_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1rem' };
const STAT_ITEM_STYLE: CSSProperties = { flex: '1 1 220px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const TWO_ENGINES_CARD_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '1.1rem 1.25rem',
  borderRadius: 'var(--radius-md, 10px)',
  border: '1px solid var(--border)',
  background: 'var(--panel)',
};

export interface OnSideOwnershipProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as every sibling screen). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('onside.ownership') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
}

export function OnSideOwnership({ topbar, onNavigate, sidebarVersionLabel }: OnSideOwnershipProps) {
  // Re-renders on demo-store writes so live DOCLIB reads (doc status /
  // version after an adopt on OnSideDocuments) stay current — see the
  // file-header adoption-state note.
  useDemoStore();
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const lastOpenDocRef = useRef<DisplayDoc | null>(null);

  const openDoc: DisplayDoc | null = openDocId && DOCLIB[openDocId] ? { id: openDocId, ...DOCLIB[openDocId] } : null;
  if (openDoc) lastOpenDocRef.current = openDoc;
  // Keeps Drawer's title/body populated with the last real doc through its
  // ~200ms closing animation instead of blanking the instant openDocId is
  // cleared — same technique OnSideDocuments.tsx uses, see its own header.
  const displayDoc = openDoc ?? lastOpenDocRef.current;

  const raciRowAction: DataTableRowAction<DocRaci> = {
    label: () => 'Open',
    onPress: (row) => setOpenDocId(row[0]),
  };

  const raciRow = displayDoc ? RACI_BY_DOC_ID[displayDoc.id] : undefined;

  const drawerFields: DrawerContentField[] = displayDoc
    ? [
        { label: 'Domain', value: DOMAIN_LABEL_BY_KEY[displayDoc.dom] ?? displayDoc.dom },
        { label: 'Version', value: displayDoc.v },
        { label: 'Type', value: displayDoc.type },
        { label: 'Owner', value: decodeText(displayDoc.owner) },
        { label: 'Summary', value: decodeText(displayDoc.line) },
        ...(raciRow ? [{ label: 'Accountable', value: ROLE_DESCRIPTOR[raciRow[1]] ?? raciRow[1] }] : []),
        ...(raciRow ? [{ label: 'Responsible', value: ROLE_DESCRIPTOR[raciRow[2]] ?? raciRow[2] }] : []),
        ...(raciRow && raciRow[3].length > 0
          ? [{ label: 'Consulted', value: raciRow[3].map((code) => ROLE_DESCRIPTOR[code] ?? code).join('; ') }]
          : []),
        ...(raciRow && raciRow[4].length > 0
          ? [{ label: 'Informed', value: raciRow[4].map((code) => ROLE_DESCRIPTOR[code] ?? code).join('; ') }]
          : []),
        ...(displayDoc.obl.length > 0 ? [{ label: 'Obligations evidenced', value: displayDoc.obl.join(', ') }] : []),
        ...displayDoc.secs.map(([heading, body]) => ({ label: heading, value: decodeText(body) })),
      ]
    : [];

  const drawerTags: DrawerContentTag[] = displayDoc ? [{ text: STATUS_LABEL[displayDoc.status], variant: STATUS_TAG_VARIANT[displayDoc.status] }] : [];

  const sidebarProps: SidebarProps = {
    activeId: 'onside.ownership',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="onside-ownership" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="onside-ownership-main" style={MAIN_STYLE} aria-labelledby="onside-ownership-title">
          <h1 id="onside-ownership-title" style={TITLE_STYLE}>
            OnSide · Ownership
          </h1>

          <section aria-labelledby="onside-raci-heading" style={SECTION_STYLE}>
            <h2 id="onside-raci-heading" style={SUBHEADING_STYLE}>
              RACI · policy ownership matrix
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {M.map(([domainKey, domainLabel, docs]) => (
                <div key={domainKey}>
                  <h3 style={{ ...DOMAIN_HEADING_STYLE, marginBottom: '0.625rem' }}>{domainLabel}</h3>
                  <div style={SCROLL_WRAP_STYLE}>
                    <DataTable
                      caption={`${domainLabel} RACI matrix`}
                      columns={RACI_COLUMNS}
                      rows={docs}
                      getRowId={(row) => row[0]}
                      rowAction={raciRowAction}
                      emptyMessage="No governance documents mapped for this domain."
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={ROLE_LEGEND_STYLE}>
              {ROLES.map(([code, title, name]) => (
                <Label key={code} text={`${code} · ${title} (${name})`} variant="body-secondary" />
              ))}
            </div>
          </section>

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
      </div>

      <Drawer open={openDocId !== null} title={displayDoc ? decodeText(displayDoc.t) : ''} onClose={() => setOpenDocId(null)}>
        {displayDoc ? (
          <>
            <DrawerContent kind="doc" fields={drawerFields} tags={drawerTags} />
            {displayDoc.redline ? (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <RedlineDiffView before={decodeText(displayDoc.redline.old)} after={decodeText(displayDoc.redline.nw)} hitl hitlText="HITL review" />
                <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--ink2)' }}>{decodeText(displayDoc.redline.note)}</p>
              </div>
            ) : null}
          </>
        ) : null}
      </Drawer>
    </div>
  );
}
