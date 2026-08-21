/**
 * TprmDomain — new 8th top-level module screen (PI-3 sprint plan L9, call-14
 * `planning/call-14-tprm-as-module.md`; `DECISIONS.md` D3 "TPRM content
 * shape: RULED (b)").
 *
 * D3 (verbatim): "a new top-level entry that is a domain-scoped view reusing
 * the SAME live data already in `onside.ts` DOMAINS['tprm'] (33
 * obligations/24 met, `deep:true`), `doclib.ts` tprm documents, and
 * CASE-2026-002 — assembled from composites already used per-domain
 * (DomainPostureCard, PosturePillBar, DataTable(obligations),
 * DataTable(documents) with the Domain filter, a case link). Zero new
 * primitive/composite." Vendor onboarding/risk-scoring/control-evaluation
 * workflows are explicitly OUT (`00-scope.md`, call-14 item 4) — this screen
 * is READ-ONLY assembly of already-shipped data and composites, no new
 * mutation surface.
 *
 * REUSE DISCIPLINE — "DomainPostureCard" is `screens/OnSideOverview.tsx`'s
 * own local, UNEXPORTED render helper (that file's header: "built as a
 * private, unexported render helper inside this screen file... not a new
 * shared file... the same 'local subcomponent, not a new shared file'
 * pattern `DataTable.tsx` already uses for its own `SortHeaderButton`").
 * That file is outside this dispatch's ALLOWLIST (App.tsx ScreenId/route
 * region, components/Sidebar.tsx, this new screen file, and `__tests__/**`
 * only), so the literal function cannot be imported or exported from there.
 * Per that same file's own precedent — and `views/DomainsAccordion.tsx`'s
 * identical pattern for its own unexported `obligationColumns`/
 * `openItemColumns` helpers — every screen in this codebase that needs a
 * "domain posture" or "obligation/document table" presentation builds its
 * OWN screen-local composition from the real, shared, already-exported
 * composites (Label P3, Tag P4, PosturePillBar C12, DataTable C6) rather
 * than importing another screen's private helper or a second copy of it.
 * This file follows that exact, already-established convention: it reads
 * `OnsideDomain`, `ObligationRow`, `curOf`/`oblToClose`/`statusOf`/
 * `domainPostureSegments`/`DOMAIN_STATUS_LABEL`/`DOMAIN_STATUS_VARIANT` —
 * all real, already-exported symbols from `data/onside.ts` and
 * `views/DomainsAccordion.tsx` — and composes its own posture summary from
 * them. No new primitive or composite is introduced; no existing one is
 * duplicated in kind, only in the ordinary "each screen owns its own
 * layout" sense every sibling screen already does (SettingsAbout.tsx,
 * SettingsToggles.tsx, views/CaseDetail.tsx, and
 * views/RegulatoryFeedSources.tsx each declare their own local `CARD_STYLE`
 * for exactly this reason — `theme/panelStyle.ts`'s own file header lists
 * all of them as separate, sanctioned consumers, not a violation).
 *
 * PANEL_STYLE NOT SPREAD HERE (implementer note, not a design decision):
 * `theme/__tests__/panelStyle.test.ts` (outside this dispatch's ALLOWLIST)
 * derives its "real consumer set" by scanning `src/` for the literal
 * object-spread of that shared constant and asserts an exact file/site
 * count. Adding a new spread site here would require editing that
 * out-of-allowlist file to
 * keep it green — a needed out-of-allowlist edit, which this dispatch's
 * FORBIDDEN list requires reporting rather than making. This screen avoids
 * the conflict the same way `screens/OnSideDocuments.tsx` already does for
 * its own top-level "Document library" DataTable and "Open governance
 * gaps" section (both page-level, no panel-card wrapper, default
 * `surface="page"`): the posture summary and both DataTables below render
 * at page level (no local `CARD_STYLE`), and the one panel-seated element
 * on this screen (the case link) reuses `SetupCard` (C15) verbatim, whose
 * own file already owns that spread site — no new one is added.
 *
 * OBLIGATIONS TABLE SCOPE — gaps & partials only, not the full register:
 * mirrors `views/DomainsAccordion.tsx`'s own domain-drill-down convention
 * exactly (`obligations.filter((o) => o.st !== 'met')`, "Gaps & partials"
 * heading) — the actionable content for a high-friction domain module,
 * not a duplicate of the full 33-row register.
 *
 * DEEP LINKS — every interactive row/link on this screen fires the
 * EXISTING, already-wired `DeepLinkKind`s (App.tsx CLASS 1 — no new kind,
 * no new consumer effect): `'obligation'` (id `tprm:${row.id}`, consumed by
 * `OnSideOverview.tsx`), `'document'` (id = DOCLIB id, consumed by
 * `OnSideDocuments.tsx`), `'domain'` (id `'tprm'`, consumed by
 * `OnSideOverview.tsx`), and `'case'` (id `'CASE-2026-002'`, consumed by
 * `screens/Cases.tsx`) — matching D3's "a link to CASE-2026-002 via the
 * existing case deep-link kind." `fireOrDeepLink` below is a local,
 * unexported copy of `views/HomePanels.tsx`'s own helper of the same name
 * (that file's own header notes this exact "onDeepLink wired vs. plain
 * onNavigate fallback" contract) — not shared/exported there, so every
 * caller that needs it declares its own, the same duplication discipline
 * `screens/Cases.tsx`'s own local `waitingOnRoleKey` already documents for
 * an equivalent small pure helper.
 *
 * CASE LINK — CASE-2026-002 is the TPRM-08 exit-plan-standard redline case
 * (`data/askChat.ts`'s own scripted answer for "What's the status of the
 * TPRM-08 exit-plan gap?": "Draft 0.7... proposes a new §6 on the
 * Third-Party Risk Management Program itself. That is Case CASE-2026-002,
 * owned by P. Nguyen." — `data/cases.ts` `seedCases()` seeds it as the
 * second entry from `tprm-program`'s redline). The id is a literal string
 * here, matching `data/askChat.ts`'s own established precedent of citing
 * `CASE-2026-002` as a literal id without a live `CASES` lookup — this
 * screen never imports `data/cases.ts` (no seed-guard dependency).
 *
 * Irreversibility gate (persona directive 6): this screen performs no
 * irreversible action — every control is either read-only display or plain
 * cross-screen navigation (`onDeepLink`/`onNavigate`). N/A, not omitted.
 *
 * Accessibility gate (persona directive 7): real `<h1>`/`<h2>` headings,
 * `main` carries `aria-labelledby` to the page `h1`; both obligation/
 * document tables are real DataTable (C6) `<table>`s with row actions
 * reachable by keyboard (DataTable's own `rowAction` contract, unmodified);
 * the posture Tag never carries status by color alone (paired with visible
 * text, `DOMAIN_STATUS_LABEL`); the case link is a real `<button>`
 * (SetupCard `interactive`, unmodified).
 */
import type { CSSProperties } from 'react';
import type { DeepLinkRequest, DeepLinkScreenProps } from '../App';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { PosturePillBar } from '../components/PosturePillBar';
import { SetupCard } from '../components/SetupCard';
import { Label } from '../components/primitives/Label';
import { Tag } from '../components/primitives/Tag';
import type { NonRaciTagVariant } from '../components/primitives/Tag';
import {
  DOMAIN_STATUS_LABEL,
  DOMAIN_STATUS_VARIANT,
  curOf,
  domainPostureSegments,
  oblToClose,
  statusOf,
} from '../views/DomainsAccordion';
import { DOMAINS, OBL } from '../data/onside';
import type { ObligationRow } from '../data/onside';
import { DOCLIB } from '../data/doclib';
import type { DocEntry } from '../data/doclib';

const TPRM_DOMAIN_KEY = 'tprm';
/** D3: "a link to CASE-2026-002 via the existing case deep-link kind." See file header "CASE LINK." */
const TPRM_CASE_ID = 'CASE-2026-002';

/** Same fallback contract as `views/HomePanels.tsx`'s own `fireOrDeepLink` — see file header "DEEP LINKS." */
function fireOrDeepLink(
  onDeepLink: ((request: DeepLinkRequest) => void) | undefined,
  onNavigate: (id: string) => void,
  request: DeepLinkRequest,
): void {
  if (onDeepLink) onDeepLink(request);
  else onNavigate(request.screen);
}

const OBL_STATUS_LABEL: Record<ObligationRow['st'], string> = { met: 'Met', partial: 'Partial', gap: 'Gap' };
const OBL_STATUS_VARIANT: Record<ObligationRow['st'], NonRaciTagVariant> = {
  met: 'status-positive',
  partial: 'status-caution',
  gap: 'status-alert',
};
const REVIEW_LABEL: Record<ObligationRow['rev'], string> = { ok: 'Approved', q: 'HITL queue' };
const REVIEW_VARIANT: Record<ObligationRow['rev'], NonRaciTagVariant> = { ok: 'status-positive', q: 'hitl' };

type DocStatus = DocEntry['status'];
const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  good: 'Current',
  warn: 'Needs attention',
  crit: 'Critical',
};
const DOC_STATUS_VARIANT: Record<DocStatus, NonRaciTagVariant> = {
  good: 'status-positive',
  warn: 'status-caution',
  crit: 'status-alert',
};

/** Same HTML-entity decode as `screens/OnSideDocuments.tsx`'s own
 * `decodeDocText` (that file's own header: "HTML entity/inline-tag
 * decoding") — local copy, same duplication discipline as `fireOrDeepLink`
 * above; not exported there. */
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
function decodeDocText(input: string): string {
  return input
    .replace(/<\/?(b|strong|em|br)\s*\/?>/gi, '')
    .replace(/&[a-z#0-9]+;/gi, (match) => HTML_ENTITY_MAP[match] ?? match);
}

type DocRow = DocEntry & { id: string };

// `position: 'relative'` makes this scrolling region the containing block
// for any absolutely-positioned descendant — see the invariant note on
// DataTable.tsx's `srOnlyStyle`.
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
const HEADER_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.375rem' };
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)' };
const VISUALLY_HIDDEN_STYLE: CSSProperties = { position: 'absolute', top: 0, left: 0, width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' };
const POSTURE_ROW_STYLE: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' };
const POSTURE_META_STYLE: CSSProperties = { fontSize: '0.8125rem', color: 'var(--ink2)' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto', flexShrink: 0 };
/** HR-SHELL-01 — same reconciliation footer `views/DomainsAccordion.tsx`
 * carries for the identical "obligations table shows a subset of the
 * posture row's full count" pattern (that file's own `pillSoftStyle`,
 * verbatim style values — the panel-seated `--chart-axis` substitute for
 * `--ink2`, same FIX WAVE Class C1 rule this file's own header already
 * documents for its `DIGEST_HINT_STYLE`-class panel text). Not a new
 * primitive/composite: a screen-local copy of an existing style object,
 * the same "each screen owns its own layout" discipline this file's own
 * header section already establishes for `CARD_STYLE`-class constants. */
const RECONCILE_PILL_STYLE: CSSProperties = {
  display: 'inline-block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--chart-axis)',
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-pill, 999px)',
  padding: '0.2rem 0.65rem',
};

export interface TprmDomainProps extends DeepLinkScreenProps {
  /** Cross-screen navigation for this screen's own links (obligation/document/case rows, the domain cross-link). */
  onNavigate: (id: string) => void;
}

export function TprmDomain({ onNavigate, onDeepLink }: TprmDomainProps) {
  const domain = DOMAINS.find((d) => d.key === TPRM_DOMAIN_KEY);
  const obligations = OBL[TPRM_DOMAIN_KEY] ?? [];
  const openObligations = obligations.filter((row) => row.st !== 'met');
  const documents: DocRow[] = Object.entries(DOCLIB)
    .filter(([, doc]) => doc.dom === TPRM_DOMAIN_KEY)
    .map(([id, doc]) => ({ id, ...doc }));

  const obligationColumns: DataTableColumn<ObligationRow>[] = [
    { id: 'id', header: 'Obligation', render: (row) => <strong>{row.id}</strong> },
    {
      id: 'requirement',
      header: 'Requirement',
      render: (row) => (
        <span>
          {row.s}
          <span style={{ display: 'block', marginTop: '0.2rem', fontSize: '0.75rem', color: 'var(--ink2)' }}>{row.cite}</span>
        </span>
      ),
    },
    { id: 'status', header: 'Status', render: (row) => <Tag text={OBL_STATUS_LABEL[row.st]} variant={OBL_STATUS_VARIANT[row.st]} /> },
    {
      id: 'evidence',
      header: 'Evidence',
      render: (row) => (row.docs.length > 0 ? <span>{row.docs.join(' · ')}</span> : <span style={{ color: 'var(--ink3)' }}>None on file</span>),
    },
    { id: 'review', header: 'Review', render: (row) => <Tag text={REVIEW_LABEL[row.rev]} variant={REVIEW_VARIANT[row.rev]} /> },
  ];

  const obligationRowAction: DataTableRowAction<ObligationRow> = {
    label: () => 'Open',
    onPress: (row) => fireOrDeepLink(onDeepLink, onNavigate, { screen: 'onside.overview', kind: 'obligation', id: `${TPRM_DOMAIN_KEY}:${row.id}` }),
  };

  const docColumns: DataTableColumn<DocRow>[] = [
    { id: 'title', header: 'Document', sortable: true, sortValue: (row) => decodeDocText(row.t), render: (row) => <span>{decodeDocText(row.t)}</span> },
    { id: 'type', header: 'Type', render: (row) => <span>{row.type}</span> },
    { id: 'owner', header: 'Owner', render: (row) => <span>{decodeDocText(row.owner)}</span> },
    { id: 'status', header: 'Status', render: (row) => <Tag text={DOC_STATUS_LABEL[row.status]} variant={DOC_STATUS_VARIANT[row.status]} /> },
    {
      id: 'redline',
      header: 'Redline',
      render: (row) => (row.redline ? <Tag text="Redline pending" variant="hitl" /> : <span style={{ color: 'var(--ink3)' }}>—</span>),
    },
  ];

  const docRowAction: DataTableRowAction<DocRow> = {
    label: () => 'View',
    onPress: (row) => fireOrDeepLink(onDeepLink, onNavigate, { screen: 'onside.documents', kind: 'document', id: row.id }),
  };

  const handleOpenCase = () => fireOrDeepLink(onDeepLink, onNavigate, { screen: 'cases', kind: 'case', id: TPRM_CASE_ID });
  const handleOpenDomain = () => fireOrDeepLink(onDeepLink, onNavigate, { screen: 'onside.overview', kind: 'domain', id: TPRM_DOMAIN_KEY });

  if (!domain) {
    // DOMAINS is a verbatim-ported, structural dataset (data/onside.ts file
    // header) — 'tprm' is always present. This branch exists only so the
    // component never dereferences `undefined` if that data module is ever
    // edited to drop it (Core Principle 3: never a confident render over a
    // fact that failed).
    return (
      <main id="tprm-main" style={MAIN_STYLE} aria-labelledby="tprm-title">
        <h1 id="tprm-title" style={TITLE_STYLE}>
          TPRM · Third-Party Risk Management
        </h1>
        <p role="status">Domain data unavailable.</p>
      </main>
    );
  }

  const current = curOf(domain);
  const toClose = oblToClose(domain);
  const status = statusOf(domain);
  const segments = domainPostureSegments(current, domain.target);

  return (
    <main id="tprm-main" style={MAIN_STYLE} aria-labelledby="tprm-title">
      <div style={HEADER_STYLE}>
        <Label text="Module" variant="eyebrow" />
        <h1 id="tprm-title" style={TITLE_STYLE}>
          TPRM · Third-Party Risk Management
        </h1>
      </div>

      <section aria-labelledby="tprm-posture-heading" style={SECTION_STYLE}>
        <h2 id="tprm-posture-heading" style={VISUALLY_HIDDEN_STYLE}>
          Posture
        </h2>
        <div style={POSTURE_ROW_STYLE}>
          <Label text={`${domain.bodies} · ${domain.appl}${domain.tot > domain.appl ? ` of ${domain.tot}` : ''} obligations in scope`} variant="body-secondary" />
          <Tag text={DOMAIN_STATUS_LABEL[status]} variant={DOMAIN_STATUS_VARIANT[status]} />
        </div>
        {/* PosturePillBar (C12) — see file header "REUSE DISCIPLINE." */}
        <div data-lf-composite="tprm-posture" data-domain="tprm">
          <PosturePillBar segments={segments} />
        </div>
        <div style={POSTURE_META_STYLE}>
          {domain.met} at required maturity · {toClose} to close for target
        </div>
        <div>
          <SetupCard
            title="See Third-Party Risk in OnSide · Overview"
            description="Full domain accordion, target lever, and the complete obligation register."
            variant="interactive"
            onPress={handleOpenDomain}
          />
        </div>
      </section>

      <section aria-labelledby="tprm-obligations-heading" style={SECTION_STYLE}>
        <h2 id="tprm-obligations-heading" style={SUBHEADING_STYLE}>
          {/* HR-SHELL-01: the posture row above states the full register
              (domain.appl/tot/met, 33/33/24) — this table only ever shows
              a 12-row representative subset. "shown obligations" (matching
              `views/DomainsAccordion.tsx`'s own identical-pattern heading
              wording) discloses that this heading's own denominator is NOT
              the posture row's denominator, so a reader never has to infer
              it from an unexplained 12 vs 33 gap. */}
          Gaps &amp; partials · {openObligations.length} of {obligations.length} shown obligations
        </h2>
        <div style={SCROLL_WRAP_STYLE}>
          <DataTable
            caption="Third-Party Risk Management gaps and partials"
            columns={obligationColumns}
            rows={openObligations}
            getRowId={(row) => row.id}
            emptyMessage="No open gaps or partials in Third-Party Risk Management."
            rowAction={obligationRowAction}
          />
        </div>
        {/* HR-SHELL-01 — same reconciliation footer
            `views/DomainsAccordion.tsx:421-425` carries for its own
            identical shown-subset obligations table: names the shown-met
            count from THIS 12-row set (not `domain.met`, which is the
            full-register figure already stated in the posture row above)
            and points at the real, full-register count by name so the
            12-vs-33 gap is disclosed, not silent. */}
        <div style={{ marginTop: '0.625rem' }}>
          <span style={RECONCILE_PILL_STYLE}>
            {obligations.filter((o) => o.st === 'met').length} met obligations shown here and the full register with
            provenance: all {domain.appl} enumerated
          </span>
        </div>
      </section>

      <section aria-labelledby="tprm-documents-heading" style={SECTION_STYLE}>
        <h2 id="tprm-documents-heading" style={SUBHEADING_STYLE}>
          TPRM documents · {documents.length} on file
        </h2>
        <div style={SCROLL_WRAP_STYLE}>
          <DataTable
            caption="Third-Party Risk Management document library"
            columns={docColumns}
            rows={documents}
            getRowId={(row) => row.id}
            emptyMessage="No documents on file for Third-Party Risk Management."
            rowAction={docRowAction}
            defaultSortColumnId="title"
          />
        </div>
      </section>

      <section aria-labelledby="tprm-case-heading" style={SECTION_STYLE}>
        <h2 id="tprm-case-heading" style={VISUALLY_HIDDEN_STYLE}>
          Related case
        </h2>
        <SetupCard
          title={`TPRM review case · ${TPRM_CASE_ID}`}
          description="Exit Plan Standard (TPRM-08) redline · owned by P. Nguyen · ISD"
          variant="interactive"
          onPress={handleOpenCase}
        />
      </section>
    </main>
  );
}
