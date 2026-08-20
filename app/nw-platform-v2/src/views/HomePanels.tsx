/**
 * HomePanels — view (parity_ia_addendum.md §1.7 "Home customization",
 * Batch 7): the 5 gated panels — Risk posture, Strategic signal,
 * Investment and return, Your queue, Quick actions — composed below
 * `Home.tsx`'s StatCard row (wired: `Home.tsx` renders this component per
 * `HomeCustomizeBar.tsx`'s "WIRING RECIPE").
 *
 * Ports the non-`kpis` sections of `renderHome()` (leapfi-platform.html
 * 4197-4285) as five independently-gated `<section>`s, rendered in
 * `visibleKeys`' own order (never a fixed order) — matching
 * `applyHomePanels()`'s own DOM-reordering behavior (source 4172-4188:
 * "put the DOM in the picked sequence").
 *
 * AMBIGUITY RESOLVED — "reuses the domain summary card built in batch-1"
 * (dispatch brief): `screens/OnSideOverview.tsx`'s own per-domain card
 * (`DomainPostureCard`) is a **local, unexported** render helper (that
 * file's own header: "built as a private, unexported render helper inside
 * this screen file... the same 'local subcomponent, not a new shared file'
 * pattern DataTable.tsx already uses") — there is no importable "domain
 * summary card" component to reuse literally. What Batch 1 actually made
 * reusable is `views/DomainsAccordion.tsx`'s exported pure derivations
 * (`curOf`, `statusOf`, `oblToClose`, `domainPostureSegments`,
 * `DOMAIN_STATUS_LABEL`, `DOMAIN_STATUS_VARIANT`) plus the shared
 * `PosturePillBar` (C12) composite both files already build on — this
 * panel reuses exactly those (imported below, not reimplemented), which is
 * the substantive reuse the brief is pointing at. The posture band itself
 * is built as a `DataTable` (C6) — one of the two shapes
 * parity_ia_addendum.md §1.7 names for this exact row ("PosturePillBar ×8
 * or DataTable rows with an inline Tag") — rather than a second card grid
 * duplicating `OnSideOverview.tsx`'s own visual, per that same row's
 * "reuses, does not duplicate" instruction.
 *
 * STRATEGIC SIGNAL DRAWER SCOPE: `sigImpact()` (source 4059-4088) computes
 * a *live* cross-check against `OBL`/gap state ("N in force would need
 * updating") — that impact calculation stays unported here, matching
 * `OnSideFeed.tsx`'s own signal Drawer (field rows, no live cross-domain
 * computation). The "Would touch" field resolves DISPLAY NAMES exactly as
 * base `sigTouch()` (source 4047-4058) does — obl tuples render the
 * obligation id (the base chip's visible text), doc tuples resolve
 * `DOCLIB[id].t`, dom tuples resolve `DOM_SHORT[key] || domain.name` + "
 * register" (fix-wave SH-5: an earlier revision printed raw internal slugs
 * like "capital-narr, gov-charter" here; the base never shows a slug).
 *
 * CLICKABLE TOUCH CHIPS + LIFECYCLE LINK RESTORED (B-07 fix batch —
 * supersedes this note's earlier claim that "the base's clickable
 * per-touch navigation is trimmed to plain text"): base `openSignal`
 * rendered each 'Would touch' tuple as its own clickable chip (`tch` →
 * `openObl`/`openDocView`/`goOnside`, source 4049-4056) plus an "Open the
 * full lifecycle" button (source 4111). `DrawerContent`'s field-row value
 * is a plain string (`DrawerContentField.value: string`, out of this
 * dispatch's allowlist to widen), so the field stays the joined text
 * summary, but the composite's `actions` slot (real `Button`s, its own
 * documented vocabulary) now carries one action per touch, PLUS "Open the
 * full lifecycle →".
 *
 * SEAM 1 RESOLVED (B3 dispatch, closing this note's own earlier STOP-item):
 * `Home.tsx` now threads App.tsx's NAVIGATION-WITH-PAYLOAD contract's FIRE
 * half down to this file as an optional `onDeepLink` prop
 * (`HomePanelsProps`, below) — see `Home.tsx`'s own header for why only
 * `onDeepLink`, not the full `DeepLinkScreenProps` triple, is threaded
 * (this component is never itself a deep-link target). Every action below
 * that has a real per-item id now fires `onDeepLink` via the local
 * `fireOrDeepLink` helper when a caller has wired it, falling back to the
 * identical plain `onNavigate(screen)` this file always used when it has
 * not — so every pre-existing base-anchor test in `home-panels.test.tsx`
 * (none of which pass `onDeepLink`) keeps its exact previous assertions,
 * never a regression:
 *   - PostureBand's row "Open →" — `kind: 'domain'`, id = the row's own
 *     domain key (base `onsideShow('dom-'+d.key)`, source 4217) — now
 *     targets the EXACT domain, not just the Overview screen; delivers
 *     end to end (`OnSideOverview.tsx`'s own B3 migration onto the same
 *     contract, its header "DEEP-LINK CONTRACT MIGRATION").
 *   - Strategic signal's per-touch actions — `obl`/`dom`/`doc` tuples map
 *     onto the exact `'obligation'`/`'domain'`/`'doc-redline'` kinds
 *     App.tsx's KIND VOCABULARY defines (id encodings verbatim from that
 *     header) via `touchToDeepLinkRequest` below, plus "Open the full
 *     lifecycle →" now firing `kind: 'section', id: 'lifecycle'` (base
 *     openSignal's own button, source 4111, goes to `goOnside('feed-
 *     lifecycle')`). Delivers to the right SCREEN today; item-level
 *     opening on the receiving end depends on that screen's own
 *     consumption (`onside.overview` consumes `'domain'` today via the
 *     migration above; `'obligation'`/`'doc-redline'` and `onside.feed`'s
 *     `'section'` kind have no consumer yet anywhere in this worktree —
 *     honest partial fidelity, not a regression from this file's prior
 *     plain-nav behavior, which delivered no more than screen-level nav
 *     either).
 *   - The Investment panel's `TopPlaysList` "Open →" per play — `kind:
 *     'play'`, id = the play's own name (base `openPlay(o.n)`, source
 *     4249-region) — DELIVERS END TO END: `InvestmentDesign.tsx` already
 *     consumes this exact kind (its own "PLAY DEEP-LINK CONSUMPTION"
 *     note), so this is a genuine functional fix, not just contract
 *     symmetry — previously every play's "Open →" landed on Investment
 *     Design's list view regardless of which of the four rows was
 *     pressed; now each opens that exact play's own drawer.
 *   - The "Platform ROI →" panel-header link — `kind: 'report', id:
 *     'roi'` (base `openReport('roi')`, source 872, the literal example
 *     App.tsx's own header cites for this exact link) — also DELIVERS END
 *     TO END: `Reporting.tsx` already consumes `'report'`-kind deep links.
 *   - The "Full lifecycle →" (legis) panel-header link now also fires
 *     `kind: 'section', id: 'lifecycle'` (base `goOnside('feed-
 *     lifecycle')`, source 869 — the same line App.tsx's own header cites
 *     alongside `'roi'` in "THE CONTRACT the screen batches wire their
 *     consumers against"). `onside.feed` does not yet consume `'section'`
 *     (STOP-item — see `OnSideFeed.tsx`'s own header "ALSO STILL OPEN," a
 *     gap this same B3 dispatch discovered but left for a follow-up scoped
 *     to that file), so this link still lands on the plain screen today;
 *     using `onDeepLink` here regardless matches the documented contract
 *     and needs no further change here once that screen adds the consumer.
 *   - "Gaps & levers →" (posture header, base `goOnside('domains')`) and
 *     "Work the levers →" (invest header, base `goStudio('design')`) carry
 *     no per-item id in App.tsx's KIND VOCABULARY at all — these stay
 *     plain `onNavigate`, unchanged; not every base cross-screen click is
 *     a payload-carrying one.
 *   - "All open items →" (queue header, base `goOnside('gaps')`) is
 *     DELIBERATELY NOT converted (STOP-item, not an oversight): App.tsx's
 *     KIND VOCABULARY text and `InvestmentDesign.tsx`'s own 'section'/
 *     'gaps' deep link both name `onside.feed` as this id's target screen,
 *     but every other "gaps" row in THIS file (`buildQueueBucket`'s
 *     `q-gaps`/`q-below` rows) — and this exact link, pre-existing —
 *     targets `onside.documents` instead, matching
 *     `home-panels.test.tsx`'s own pinned assertion. Picking either target
 *     silently would contradict one of the two; see the code comment at
 *     this link's own `case 'queue'` for the full note.
 *
 * DRAWER OWNERSHIP: this view mounts its own local `<Drawer>` instance for
 * the Strategic signal panel — matching `OnSideFeed.tsx`'s own documented
 * "single local `<Drawer>` instance, not hoisted" reasoning verbatim: in
 * this worktree's single-active-screen-at-a-time model, `HomePanels` is
 * only ever rendered as part of the one currently-mounted screen (`Home`),
 * so this can never coexist with a second simultaneously-open Drawer.
 * `HomeCustomizeBar.tsx` and `NotificationBellPanel.tsx` (this dispatch's
 * other two files) own no Drawer of their own, so no conflict exists
 * within this dispatch either.
 *
 * "YOUR QUEUE" DATA SCOPE: role-bucket content (source 4243-4270) branches
 * on `CURRENT.roleKey` across analyst/cro/ceo/ai/default. Subtitles are
 * derived only from data in scope (`DOMAINS` + `DomainsAccordion.tsx`'s
 * exported `oblToClose`/`statusOf`; the live lever/plan view; `data/
 * cases.ts` `CASES`; `data/misc.ts` `SIGNAL`) — never `GAPS`/`gapState`,
 * `DIGEST`/`digestCount()`, or `hitlCount()` (source's own data for the
 * "Open gaps," "Regulatory digest," and "Incident Response Plan" rows),
 * which live outside this batch. Rows that would have needed one of those
 * carry honest, qualitative copy instead of an invented count. The CRO
 * "Rulemaking to watch · RFI 2026-04 comments due Sep 30" row (source
 * 4257) is ported verbatim — its literals need nothing outside SIGNAL
 * (fix-wave SH-9: an earlier revision replaced it with a generic
 * "N instruments tracked this cycle" line the base never shows).
 *
 * LIVE LEVERS (fix-wave SH-6, consumer side): the Investment-and-return
 * panel and the queue's gated-play count recompute from the SHARED live
 * lever state (`state/demoStore.ts` `getDemoSliders()`; this component
 * subscribes via `useDemoStore()`), matching base `renderHome()`'s
 * `computePlan()` over the live lever DOM values (source 4197+). An
 * earlier revision froze these panels at a local DEFAULT_SLIDERS copy, so
 * Home contradicted Step 5's just-demoed lever changes. The `sliders`/
 * `opportunities` props remain as test/override hooks only.
 *
 * CASES SEEDING: identical guarded self-seed to `screens/Cases.tsx`'s own
 * (`if (CASES.length === 0) seedCases(DOCLIB)`) — `App.tsx` still owns no
 * boot-time seed call, so every consumer that needs `CASES` populated
 * guards its own idempotent seed. Recommending (per `Cases.tsx`'s own
 * note) this be relocated to a real boot sequence once one exists;
 * `state/demoStore.ts`'s `resetDemo()` re-runs `seedCases` on Restart.
 *
 * NAVIGATION TARGETS (previously a STOP-item, now resolved): every
 * `onNavigate` id used below — `'cases'`, `'onside.overview'`,
 * `'reporting'`, `'onside.feed'`, `'onside.documents'`, `'studio.ask'`,
 * `'studio.investment-design'`, `'studio.roadmap'` — is a real, wired
 * member of `App.tsx`'s `SCREEN_IDS` union (App.tsx:212-230), so all row
 * and card actions work end to end.
 *
 * PANEL-HEADER GO-LINKS + TOP-PLAY LIST RESTORED (B-08 fix batch): every
 * base `renderHome()` panel head (`.panel-h`, source 868/869/872/878) paired
 * its `<h2>` with a `.go2` "N →" link to the same destination — dropped
 * entirely here pre-fix. `PANEL_HEADER_LINKS` below restores the visible
 * link per panel ('Gaps & levers →', 'Full lifecycle →', 'Work the levers
 * →' + 'Platform ROI →', 'All open items →'); the base's redundant
 * `onclick` on the `<h2>` itself is deliberately NOT ported (a clickable,
 * non-semantic heading is a real a11y regression the base's own markup
 * happened to carry — persona directive 4 — and the adjacent link already
 * reaches the identical destination, so nothing is lost). The Investment
 * panel additionally regains its "four largest, by annual value" `lrow`
 * list (source 4249-region) with an `Open →` action per play. B3 dispatch
 * (see "SEAM 1 RESOLVED" above): 'Platform ROI →' and each play's
 * `Open →` now fire real deep links that deliver to the exact report/play;
 * the other three panel-header links stay plain `onNavigate` (either no
 * matching KIND VOCABULARY id, or a matching id with no consumer yet).
 *
 * Accessibility gate (persona directive 7): every panel is a labelled
 * `<section>`; posture/signal/queue panels are real `DataTable` (C6)
 * instances (semantic tables, sortable headers where meaningful, a single
 * row-action `Button`); Quick actions is 3 real `SetupCard`
 * (`interactive`) buttons — same pattern `Roadmap.tsx`'s own "What's next"
 * row already uses, reused verbatim per the dispatch brief; the signal
 * Drawer inherits `Drawer.tsx`'s own full focus-trap/Esc/restore-focus
 * baseline unmodified.
 *
 * Irreversibility gate (persona directive 6): N/A — every control in this
 * file is read-only navigation or a Drawer open/close; no irreversible
 * operation is triggered from here.
 *
 * TESTS: covered by `src/__tests__/shell/home.test.tsx` (customization /
 * visibleKeys flow) and `src/__tests__/shell/home-panels.test.tsx`
 * (SH-5 name resolution, SH-9 CRO row, SH-6 live-lever recompute, B3
 * SEAM 1 `onDeepLink` firing + plain-`onNavigate` fallback), run under
 * Vitest; plus `npx tsc --noEmit` (strict, `exactOptionalPropertyTypes`,
 * `noUncheckedIndexedAccess`).
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { SetupCard } from '../components/SetupCard';
import { PosturePillBar } from '../components/PosturePillBar';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentField } from '../components/DrawerContent';
import { Tag } from '../components/primitives/Tag';
import { Label } from '../components/primitives/Label';
import { curOf, statusOf, oblToClose, domainPostureSegments, DOMAIN_STATUS_LABEL, DOMAIN_STATUS_VARIANT } from './DomainsAccordion';
import type { HomePanelKey } from './HomeCustomizeBar';
import { HOME_PANEL_DEFS } from './HomeCustomizeBar';
import { DOMAINS } from '../data/onside';
import type { OnsideDomain } from '../data/onside';
import { SIGNAL } from '../data/misc';
import type { SignalEntry, SignalTouch } from '../data/misc';
import { CASES, seedCases } from '../data/cases';
import { DOCLIB } from '../data/doclib';
import { OPPS } from '../data/studio';
import { deriveRecomputeView, fmt } from '../engine/plan';
import type { SliderState, PlanOpportunity } from '../engine/plan';
import { getDemoSliders, useDemoStore } from '../state/demoStore';
import type { DeepLinkRequest } from '../App';

// See file header "CASES SEEDING."
if (CASES.length === 0) {
  seedCases(DOCLIB);
}

/** Base `DOM_SHORT` (leapfi-platform.html 3011) — short display names for
 * domain keys, used by `sigTouch()` (source 4056) among others. Ported
 * verbatim for the "Would touch" resolution below (SH-5). */
const DOM_SHORT: Record<string, string> = {
  bsa: 'BSA / AML',
  mrm: 'Model Risk',
  tprm: 'Third-Party',
  consumer: 'Consumer',
  fairlend: 'Fair Lending',
  infosec: 'InfoSec',
  aigov: 'AI Governance',
  capital: 'Capital',
};

/** Base `sigTouch()`'s display-name resolution (leapfi-platform.html
 * 4047-4058), as plain text — see file header "STRATEGIC SIGNAL DRAWER
 * SCOPE" (SH-5): obl -> the obligation id (the base chip's visible text),
 * doc -> `(d&&d.t)||t[1]`, dom -> `(DOM_SHORT[t[1]]||dm.name)||t[1]` +
 * " register". Never a raw internal slug for doc/dom tuples. */
function touchLabel(t: SignalTouch): string {
  if (t[0] === 'obl') return t[2] ?? t[1];
  if (t[0] === 'doc') return DOCLIB[t[1]]?.t ?? t[1];
  const dm = DOMAINS.find((d) => d.key === t[1]);
  return `${dm ? (DOM_SHORT[t[1]] ?? dm.name) : t[1]} register`;
}

/** B3 — App.tsx's KIND VOCABULARY id encodings (that file's header,
 * "NAVIGATION-WITH-PAYLOAD / DEEP LINKS") applied to a `SignalTouch`
 * tuple: `obl` -> `'obligation'`, id `${domKey}:${oblId}` (only when the
 * tuple actually carries an obligation id — every `SIGNAL` `obl` entry in
 * `data/misc.ts` does, but the type itself makes the third element
 * optional, so this stays a real, checked guard rather than a `!`
 * assertion); `doc` -> `'doc-redline'`, id = the doc id; `dom` ->
 * `'domain'`, id = the domain key. Returns `null` for a shape the
 * vocabulary has no kind for (never observed today, but not a case to
 * silently mis-target). */
function touchToDeepLinkRequest(t: SignalTouch): DeepLinkRequest | null {
  if (t[0] === 'doc') return { screen: 'onside.documents', kind: 'doc-redline', id: t[1] };
  if (t[0] === 'dom') return { screen: 'onside.overview', kind: 'domain', id: t[1] };
  if (t[0] === 'obl' && t[2]) return { screen: 'onside.overview', kind: 'obligation', id: `${t[1]}:${t[2]}` };
  return null;
}

/** B3 — fires the richer deep link when a caller has wired `onDeepLink`
 * (SEAM 1, see file header); otherwise falls back to the identical plain
 * `onNavigate(screen)` this file always used, so a caller that has not
 * wired `onDeepLink` (every pre-existing base-anchor test in
 * `home-panels.test.tsx`) keeps its exact previous behavior — never a
 * regression, never a dead click. */
function fireOrDeepLink(
  onDeepLink: ((request: DeepLinkRequest) => void) | undefined,
  onNavigate: (id: string) => void,
  request: DeepLinkRequest,
): void {
  if (onDeepLink) onDeepLink(request);
  else onNavigate(request.screen);
}

/** Ported verbatim, `caseWaitingOn` (leapfi-platform.html 2617-2622) — same
 * small pure derivation `screens/Cases.tsx`'s own local `waitingOnRoleKey`
 * already ports independently (that function is not exported). */
function waitingOnRoleKey(stage: string): string | null {
  if (stage === 'analyst') return 'analyst';
  if (stage === 'cro' || stage === 'final' || stage === 'committee') return 'cro';
  if (stage === 'legal') return 'legal';
  return null;
}

interface QueueRow {
  id: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  onOpen: () => void;
}

interface QueueBucket {
  title: string;
  sub: string;
  rows: QueueRow[];
}

/** Ports `renderHome()`'s 5-way role branch (source 4243-4270) — see file
 * header "'YOUR QUEUE' DATA SCOPE" for exactly which source subtitles were
 * trimmed to honest, non-fabricated copy and why. */
function buildQueueBucket(
  roleKey: string,
  gapsTotal: number,
  below: OnsideDomain[],
  gatedCount: number,
  gatedFirstName: string | null,
  onNavigate: (id: string) => void,
  onDeepLink?: (request: DeepLinkRequest) => void,
): QueueBucket {
  const myCases = CASES.filter((c) => waitingOnRoleKey(c.stage) === roleKey);
  // PI2-D5 (Sprint 1 DeepLinkKind union extension) — the q-cases row's own
  // subtitle already names a SPECIFIC case ("Oldest: {myCases[0].title}"),
  // but the pre-existing `onOpen` fired a plain `onNavigate('cases')`,
  // dropping that id (the exact "call site drops the id" shape). Fires the
  // 'case'-kind deep link carrying the oldest waiting case's id when a
  // caller has wired `onDeepLink`; falls back to the identical plain nav
  // otherwise (`fireOrDeepLink`'s own established contract, matching every
  // other row's dispatch pattern in this file). Never dispatches with no
  // case to open — an empty queue keeps the plain screen-level nav (there
  // is no id to carry).
  const openCases = () => {
    const oldest = myCases[0];
    if (oldest) fireOrDeepLink(onDeepLink, onNavigate, { screen: 'cases', kind: 'case', id: oldest.id });
    else onNavigate('cases');
  };

  if (roleKey === 'analyst') {
    return {
      title: 'Your queue · review',
      sub: 'Language drafted by OnSide, waiting on your read',
      rows: [
        {
          id: 'q-cases',
          title: `${myCases.length} case${myCases.length === 1 ? '' : 's'} waiting on you`,
          subtitle: myCases.length > 0 ? `Oldest: ${myCases[0]?.title ?? ''}` : 'Nothing in your queue',
          actionLabel: 'Open',
          onOpen: openCases,
        },
        {
          id: 'q-gaps',
          title: 'Open gaps',
          subtitle: `${gapsTotal} obligation${gapsTotal === 1 ? '' : 's'} to close, across all domains`,
          actionLabel: 'Gaps',
          onOpen: () => onNavigate('onside.documents'),
        },
        {
          id: 'q-feed',
          title: 'Regulatory feed',
          subtitle: "Today's signal and sourcing detail",
          actionLabel: 'Feed',
          onOpen: () => onNavigate('onside.feed'),
        },
      ],
    };
  }

  if (roleKey === 'cro') {
    const rows: QueueRow[] = [];
    if (myCases.length > 0) {
      rows.push({
        id: 'q-cases',
        title: `${myCases.length} case${myCases.length === 1 ? '' : 's'} awaiting your approval`,
        subtitle: myCases[0]?.title ?? '',
        actionLabel: 'Approve',
        onOpen: openCases,
      });
    }
    rows.push(
      {
        id: 'q-below',
        title: 'Below-target domains',
        subtitle: `${below.length} of ${DOMAINS.length} · worst gap: ${below[0]?.name ?? 'none'}`,
        actionLabel: 'Domains',
        onOpen: () => onNavigate('onside.overview'),
      },
      {
        // Base 4257, ported verbatim (SH-9) — the literals live in
        // SIGNAL[0] (data/misc.ts: instr 'RFI 2026-04', st '... position
        // due Sep 30'); base renderHome hardcodes this exact row copy.
        id: 'q-signal',
        title: 'Rulemaking to watch',
        subtitle: 'RFI 2026-04 comments due Sep 30',
        actionLabel: 'Track',
        onOpen: () => onNavigate('onside.feed'),
      },
    );
    return { title: 'Your queue · risk', sub: 'Routed to you with proposed language drafted', rows };
  }

  if (roleKey === 'ceo') {
    return {
      title: 'Your queue · strategy',
      sub: 'What to bring to the board',
      rows: [
        { id: 'q-board', title: 'Board pack', subtitle: 'Posture, portfolio, return, recommendation · one page', actionLabel: 'Generate', onOpen: () => onNavigate('reporting') },
        { id: 'q-roadmap', title: 'Roadmaps', subtitle: 'Year 1 by quarter, then years 2 and 3', actionLabel: 'Open', onOpen: () => onNavigate('studio.roadmap') },
        { id: 'q-ask', title: 'Ask the platform', subtitle: 'Price the next idea before the next meeting', actionLabel: 'Ask', onOpen: () => onNavigate('studio.ask') },
      ],
    };
  }

  if (roleKey === 'ai') {
    return {
      title: 'Your queue · build',
      sub: 'In flight and waiting on governance',
      rows: [
        { id: 'q-udf', title: 'Unified data foundation', subtitle: 'The dependency the strategic plays wait on', actionLabel: 'Open', onOpen: () => onNavigate('studio.investment-design') },
        {
          id: 'q-gated',
          title: `${gatedCount} play${gatedCount === 1 ? '' : 's'} sequence-gated`,
          subtitle: gatedFirstName ? `Highest value: ${gatedFirstName}` : 'None waiting',
          actionLabel: 'Design',
          onOpen: () => onNavigate('studio.investment-design'),
        },
        { id: 'q-mrm', title: 'Model Risk register', subtitle: 'The obligations your builds answer to', actionLabel: 'Open', onOpen: () => onNavigate('onside.overview') },
      ],
    };
  }

  return {
    title: 'Your queue · program',
    sub: 'This week',
    rows: [
      { id: 'q-ask', title: 'Ask the platform', subtitle: 'Scope the next idea before the next meeting', actionLabel: 'Register', onOpen: () => onNavigate('studio.ask') },
      {
        id: 'q-gaps',
        title: 'Open governance gaps',
        subtitle: `${gapsTotal} obligation${gapsTotal === 1 ? '' : 's'} to close, across all domains`,
        actionLabel: 'Gaps',
        onOpen: () => onNavigate('onside.documents'),
      },
      { id: 'q-board', title: 'Board pack prep', subtitle: 'Posture, portfolio, and return, ready to generate', actionLabel: 'Generate', onOpen: () => onNavigate('reporting') },
    ],
  };
}

export interface HomePanelsProps {
  /** Ordered, controlled — see `HomeCustomizeBar.tsx`'s "WIRING RECIPE." Only panels present here render, in this order. */
  visibleKeys: readonly HomePanelKey[];
  currentRoleKey: string;
  /** Generic screen navigation (`Sidebar.tsx`'s own `onNavigate` shape) — see file header "NAVIGATION TARGETS." */
  onNavigate: (id: string) => void;
  /** B3 — the FIRE half of App.tsx's NAVIGATION-WITH-PAYLOAD contract, threaded down from `Home.tsx` (see that file's header + this file's own "SEAM 1 RESOLVED"). Optional: every consumer below falls back to plain `onNavigate` when this is absent. */
  onDeepLink?: (request: DeepLinkRequest) => void;
  /** Unused by any row this dispatch's own scope reaches (see file header) — accepted for prop-shape symmetry with `NotificationBellPanel`'s identical dependency; present so this component's shape doesn't need to change once a queue row deep-links to a specific case. */
  onOpenCase?: (caseId: string) => void;
  /** Testing/override hook only. When absent (the app's real path), the LIVE shared lever state (`state/demoStore.ts` `getDemoSliders()`) is read on every render — see file header "LIVE LEVERS" (SH-6). */
  sliders?: SliderState;
  /** Testing/override hook only. Defaults to the LIVE `OPPS` pool (which grows when Discovery accepts a play). */
  opportunities?: PlanOpportunity[];
}

const sectionStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const sectionHeadingStyle: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)' };
// B-08: base `.panel-h` header row (h2 + `.go2` link(s), source 868/869/872/878).
const panelHeaderRowStyle: CSSProperties = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' };
const panelHeaderLinksStyle: CSSProperties = { display: 'flex', gap: '1rem', flexWrap: 'wrap' };
const panelHeaderLinkStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: 'var(--accent)',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
};
const sectionSubStyle: CSSProperties = { margin: 0, font: 'inherit', fontSize: '0.8125rem', color: 'var(--ink2)' };
const statRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1rem' };
const setupCardRowStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1rem' };
const scrollWrapStyle: CSSProperties = { overflowX: 'auto', flexShrink: 0 };
const scoreCellStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: '10rem' };
const itemCellStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.15rem', maxWidth: '28rem' };
const itemTitleStyle: CSSProperties = { color: 'var(--ink)', fontSize: '0.9375rem', fontWeight: 600 };
const itemSubStyle: CSSProperties = { color: 'var(--ink2)', fontSize: '0.8125rem' };

function PostureBand({
  onNavigate,
  onDeepLink,
}: {
  onNavigate: (id: string) => void;
  onDeepLink: ((request: DeepLinkRequest) => void) | undefined;
}) {
  const columns: DataTableColumn<OnsideDomain>[] = [
    { id: 'domain', header: 'Domain', sortable: true, sortValue: (d) => d.name, render: (d) => <span style={itemTitleStyle}>{d.name}</span> },
    {
      id: 'score',
      header: 'Score',
      render: (d) => (
        <span style={scoreCellStyle}>
          <span style={itemSubStyle}>
            {curOf(d).toFixed(1)} of target {d.target}
          </span>
          <PosturePillBar segments={domainPostureSegments(curOf(d), d.target)} />
        </span>
      ),
    },
    { id: 'status', header: 'Status', render: (d) => <Tag text={DOMAIN_STATUS_LABEL[statusOf(d)]} variant={DOMAIN_STATUS_VARIANT[statusOf(d)]} /> },
  ];
  // B3 (SEAM 1) — base `onsideShow('dom-'+d.key)` per row (source 4217):
  // now the row's own domain, not just the Overview screen (see file
  // header "SEAM 1 RESOLVED").
  const rowAction: DataTableRowAction<OnsideDomain> = {
    label: () => 'Open →',
    onPress: (d) => fireOrDeepLink(onDeepLink, onNavigate, { screen: 'onside.overview', kind: 'domain', id: d.key }),
  };
  return (
    <div style={scrollWrapStyle}>
      <DataTable caption="Risk posture by domain" columns={columns} rows={DOMAINS} getRowId={(d) => d.key} rowAction={rowAction} defaultSortColumnId="domain" />
    </div>
  );
}

interface SignalRow extends SignalEntry {
  rowId: string;
}

/** B-07: the plain-nav fallback screen for a 'Would touch' tuple — `obl`/
 * `dom` tuples live in the Domains accordion (`onside.overview`), `doc`
 * tuples in the document universe (`onside.documents`). Used only when a
 * caller has not wired `onDeepLink` (see `fireOrDeepLink`) or a tuple shape
 * `touchToDeepLinkRequest` returns `null` for. */
function touchScreenId(t: SignalTouch): string {
  return t[0] === 'doc' ? 'onside.documents' : 'onside.overview';
}

function StrategicSignalPanel({
  onNavigate,
  onDeepLink,
}: {
  onNavigate: (id: string) => void;
  onDeepLink: ((request: DeepLinkRequest) => void) | undefined;
}) {
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const rows: SignalRow[] = SIGNAL.map((s, index) => ({ ...s, rowId: `sig-${index}` }));
  const selected = rows.find((r) => r.rowId === openRowId) ?? null;

  const columns: DataTableColumn<SignalRow>[] = [
    { id: 'scope', header: 'Scope', render: (r) => <Tag text={r.sc} variant="count" /> },
    {
      id: 'instrument',
      header: 'Instrument',
      render: (r) => (
        <span style={itemCellStyle}>
          <span style={itemTitleStyle}>{r.t}</span>
          <span style={itemSubStyle}>{r.age}</span>
        </span>
      ),
    },
    { id: 'status', header: 'Status', render: (r) => <span style={itemSubStyle}>{r.stS || r.st}</span> },
  ];
  const rowAction: DataTableRowAction<SignalRow> = { label: () => 'Review', onPress: (r) => setOpenRowId(r.rowId) };

  const fields: DrawerContentField[] = selected
    ? [
        { label: 'Scope', value: selected.sc },
        { label: 'Instrument', value: selected.instr ?? selected.t },
        { label: 'Status', value: selected.st },
        { label: 'Proposed', value: selected.age },
        { label: 'What it would mean here', value: selected.read },
        { label: 'Would touch', value: selected.touch.map(touchLabel).join(', ') },
      ]
    : [];

  // B-07 / B3 (SEAM 1): one action per 'would touch' item (base per-chip
  // navigation, source 4049-4056) plus the base's "Open the full
  // lifecycle" button (source 4111, `goOnside('feed-lifecycle')`). Each
  // touch fires the exact deep-link kind `touchToDeepLinkRequest` resolves
  // when a caller has wired `onDeepLink`; falls back to the same plain
  // screen-level `onNavigate` this file always used otherwise (see file
  // header "SEAM 1 RESOLVED" for which of these deliver end to end today).
  const actions = selected
    ? [
        ...selected.touch.map((t) => {
          const request = touchToDeepLinkRequest(t);
          return {
            label: touchLabel(t),
            variant: 'ghost' as const,
            onPress: () => (request ? fireOrDeepLink(onDeepLink, onNavigate, request) : onNavigate(touchScreenId(t))),
          };
        }),
        {
          label: 'Open the full lifecycle →',
          variant: 'ghost' as const,
          onPress: () => fireOrDeepLink(onDeepLink, onNavigate, { screen: 'onside.feed', kind: 'section', id: 'lifecycle' }),
        },
      ]
    : [];

  return (
    <>
      <div style={scrollWrapStyle}>
        <DataTable caption="Strategic signal" columns={columns} rows={rows} getRowId={(r) => r.rowId} rowAction={rowAction} />
      </div>
      <Drawer open={selected !== null} title={selected ? `Strategic signal · ${selected.sc}` : 'Strategic signal'} onClose={() => setOpenRowId(null)}>
        <DrawerContent kind="signal" fields={fields} actions={actions} />
      </Drawer>
    </>
  );
}

/** Base `lrow` list row (source 4249-region) — a real `<button>`-backed
 * link/text/action row, same accessible-link pattern as `ReportView.tsx`'s
 * `DocLink`. */
const lrowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  padding: '0.625rem 0',
  borderTop: '1px solid var(--border)',
  background: 'transparent',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  font: 'inherit',
  color: 'inherit',
};

function TopPlaysList({ plays, onOpenPlay }: { plays: PlanOpportunity[]; onOpenPlay: (playName: string) => void }) {
  return (
    <div>
      <Label text="The four largest, by annual value" variant="eyebrow" />
      {plays.map((o) => (
        <button key={o.n} type="button" style={{ ...lrowStyle, borderTop: '1px solid var(--border)' }} onClick={() => onOpenPlay(o.n)}>
          <span style={itemCellStyle}>
            <span style={itemTitleStyle}>{o.n}</span>
            <span style={itemSubStyle}>{`${fmt(o.val)} a year · ${o.c}`}</span>
          </span>
          <span style={{ ...itemSubStyle, color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>Open →</span>
        </button>
      ))}
    </div>
  );
}

function InvestmentReturnPanel({
  sliders,
  opportunities,
  onNavigate,
  onDeepLink,
}: {
  sliders: SliderState;
  opportunities: PlanOpportunity[];
  onNavigate: (id: string) => void;
  onDeepLink: ((request: DeepLinkRequest) => void) | undefined;
}) {
  const view = deriveRecomputeView(sliders, opportunities);
  const topFunded = [...view.plan.funded].sort((a, b) => b.val - a.val).slice(0, 4);
  // B-08 / B3 (SEAM 1): base `top=P.funded...slice(0,4)` list (source
  // 4249-region), each row an `openPlay(n)` click-through — `kind: 'play'`,
  // id = the play's own name, DELIVERS END TO END (see file header "SEAM 1
  // RESOLVED": `InvestmentDesign.tsx` already consumes this exact kind).
  const openPlay = (playName: string) => fireOrDeepLink(onDeepLink, onNavigate, { screen: 'studio.investment-design', kind: 'play', id: playName });
  return (
    <>
      <div style={statRowStyle}>
        <StatCard label={`Return on investment · vs ${view.L.roiTgt.toFixed(1)}× hurdle`} value={view.plan.roi.toFixed(1)} unit="×" />
        <StatCard label="One-time build cost" value={view.economics.buildCostText} />
        <StatCard label="Recurring annual value" value={view.economics.annualValueText} />
        <StatCard label="Payback period" value={view.economics.paybackText} />
        <StatCard label="Compliance capacity freed" value={fmt(540000)} unit="/yr" />
      </div>
      {topFunded.length > 0 ? <TopPlaysList plays={topFunded} onOpenPlay={openPlay} /> : null}
    </>
  );
}

function YourQueuePanel({
  roleKey,
  onNavigate,
  onDeepLink,
  sliders,
  opportunities,
}: {
  roleKey: string;
  onNavigate: (id: string) => void;
  onDeepLink?: (request: DeepLinkRequest) => void;
  sliders: SliderState;
  opportunities: PlanOpportunity[];
}) {
  const gapsTotal = DOMAINS.reduce((sum, d) => sum + oblToClose(d), 0);
  const below = DOMAINS.filter((d) => statusOf(d) === 'below');
  const view = deriveRecomputeView(sliders, opportunities);
  const gatedFirst = view.plan.gated[0] ?? null;
  const bucket = buildQueueBucket(roleKey, gapsTotal, below, view.plan.gated.length, gatedFirst ? gatedFirst.n : null, onNavigate, onDeepLink);

  const columns: DataTableColumn<QueueRow>[] = [
    {
      id: 'item',
      header: 'Item',
      render: (row) => (
        <span style={itemCellStyle}>
          <span style={itemTitleStyle}>{row.title}</span>
          <span style={itemSubStyle}>{row.subtitle}</span>
        </span>
      ),
    },
  ];
  const rowAction: DataTableRowAction<QueueRow> = { label: (row) => row.actionLabel, onPress: (row) => row.onOpen() };

  return (
    <>
      <p style={sectionSubStyle}>{bucket.sub}</p>
      <div style={scrollWrapStyle}>
        <DataTable caption={bucket.title} columns={columns} rows={bucket.rows} getRowId={(row) => row.id} rowAction={rowAction} />
      </div>
    </>
  );
}

function QuickActionsPanel({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div style={setupCardRowStyle}>
      <SetupCard
        title="Ask the platform"
        variant="interactive"
        onPress={() => onNavigate('studio.ask')}
      />
      <SetupCard
        title="Domains · gaps & levers"
        variant="interactive"
        onPress={() => onNavigate('onside.overview')}
      />
      <SetupCard title="Reporting" variant="interactive" onPress={() => onNavigate('reporting')} />
    </div>
  );
}

export function HomePanels({ visibleKeys, currentRoleKey, onNavigate, onDeepLink, sliders, opportunities }: HomePanelsProps) {
  // Subscribe to every demo-store write (lever moves, accepted plays,
  // resetDemo) so these panels recompute live — base renderHome's
  // computePlan()-over-live-levers behavior (source 4197+); SH-6.
  useDemoStore();
  const liveSliders = sliders ?? getDemoSliders();
  const liveOpportunities = opportunities ?? OPPS;
  const labelByKey = new Map(HOME_PANEL_DEFS.map((p) => [p.key, p.label]));

  function renderPanel(key: HomePanelKey) {
    switch (key) {
      case 'posture':
        return <PostureBand onNavigate={onNavigate} onDeepLink={onDeepLink} />;
      case 'legis':
        return <StrategicSignalPanel onNavigate={onNavigate} onDeepLink={onDeepLink} />;
      case 'invest':
        return <InvestmentReturnPanel sliders={liveSliders} opportunities={liveOpportunities} onNavigate={onNavigate} onDeepLink={onDeepLink} />;
      case 'queue':
        return (
          <YourQueuePanel
            roleKey={currentRoleKey}
            onNavigate={onNavigate}
            sliders={liveSliders}
            opportunities={liveOpportunities}
            {...(onDeepLink !== undefined ? { onDeepLink } : {})}
          />
        );
      case 'qa':
        return <QuickActionsPanel onNavigate={onNavigate} />;
      default:
        return null;
    }
  }

  // B-08 / B3 (SEAM 1): base `.panel-h .go2` header links (source
  // 868/869/872/878) — see file header "PANEL-HEADER GO-LINKS" +
  // "SEAM 1 RESOLVED" for which of these now fire a real deep link (with
  // an id App.tsx's KIND VOCABULARY actually defines) versus which stay
  // plain `onNavigate` (no matching id in that vocabulary). `qa` (Quick
  // actions) carries none in the base either.
  function headerLinks(key: HomePanelKey): Array<{ label: string; onPress: () => void }> {
    switch (key) {
      case 'posture':
        // base `goOnside('domains')` — no per-item id, stays plain nav.
        return [{ label: 'Gaps & levers →', onPress: () => onNavigate('onside.overview') }];
      case 'legis':
        // base `goOnside('feed-lifecycle')` -> kind 'section', id 'lifecycle'.
        return [{ label: 'Full lifecycle →', onPress: () => fireOrDeepLink(onDeepLink, onNavigate, { screen: 'onside.feed', kind: 'section', id: 'lifecycle' }) }];
      case 'invest':
        return [
          // base `goStudio('design')` — no per-item id, stays plain nav.
          { label: 'Work the levers →', onPress: () => onNavigate('studio.investment-design') },
          // base `openReport('roi')` -> kind 'report', id 'roi' — DELIVERS
          // END TO END (Reporting.tsx already consumes 'report').
          { label: 'Platform ROI →', onPress: () => fireOrDeepLink(onDeepLink, onNavigate, { screen: 'reporting', kind: 'report', id: 'roi' }) },
        ];
      case 'queue':
        // base `goOnside('gaps')`. NOT converted to `onDeepLink` (STOP-item,
        // not an oversight): App.tsx's KIND VOCABULARY text and
        // `InvestmentDesign.tsx`'s own 'section'/'gaps' deep link both name
        // `onside.feed` as this id's target screen, but every other "gaps"
        // row in THIS file (`buildQueueBucket`'s `q-gaps`/`q-below` rows,
        // above) — and this exact link, pre-existing — targets
        // `onside.documents` instead, matching `home-panels.test.tsx`'s own
        // pinned assertion. Picking either target silently would either
        // contradict this file's own established convention or break a
        // passing base-anchor test; flagged for the record rather than
        // resolved by guessing which side is stale.
        return [{ label: 'All open items →', onPress: () => onNavigate('onside.documents') }];
      default:
        return [];
    }
  }

  return (
    <>
      {visibleKeys.map((key) => {
        const links = headerLinks(key);
        return (
          <section key={key} aria-labelledby={`home-panel-${key}-heading`} style={sectionStyle} data-lf-home-panel={key}>
            <div style={panelHeaderRowStyle}>
              <h2 id={`home-panel-${key}-heading`} style={sectionHeadingStyle}>
                {labelByKey.get(key) ?? key}
              </h2>
              {links.length > 0 ? (
                <span style={panelHeaderLinksStyle}>
                  {links.map((link) => (
                    <button key={link.label} type="button" style={panelHeaderLinkStyle} onClick={link.onPress}>
                      {link.label}
                    </button>
                  ))}
                </span>
              ) : null}
            </div>
            {renderPanel(key)}
          </section>
        );
      })}
    </>
  );
}
