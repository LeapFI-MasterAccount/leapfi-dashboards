/**
 * OnSideOverview — new screen, parity_ia_addendum.md §Batch 1
 * "OnSide · Overview & Domains" (D16 full-functional-parity addendum to
 * design_system_spec.md — this screen is not one of that document's 7
 * script-screen anatomies §5.1-§5.7; it extends the IA additively per the
 * addendum's own precedence rules).
 *
 * Hosts the merged base-engine `overview` + `domains`/`targets`/`dom-`
 * views (`osOverview` 3069-3084, `osKpis` 3055-3068, `osDomainsMaster`/
 * `domBody` 3664-3709, `setTarget` 3726-33, the `onsideShow` router's
 * `dom-` deep-link handling 3021-3054).
 *
 * Region map, top to bottom (addendum §Batch 1 / §1.1 rows 1-2): KPI
 * strip (6 StatCards, `osKpis`) → domain-posture grid (one summary card
 * per domain: name/scope, 5-point band via PosturePillBar, status Tag,
 * "Open →" row action) → "Scope changes this session" list → "Objectives
 * driving scope" Chip strip (cross-links into Studio · Ask's register) →
 * Connect teaser paragraph → a "Cases · approvals" entry-point row → the
 * Domains accordion (`views/DomainsAccordion.tsx`, this dispatch's sibling
 * file). Components per addendum: StatCard (C1) ×6, Label (P3) + Tag (P4)
 * + PosturePillBar (C12) for each posture card, Chip (P5, `suggestion`)
 * for the objectives strip, SetupCard (C15, `interactive`) for the Cases
 * entry point, Button (P2, `ghost`) for the Connect teaser link.
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: identical
 * passthrough pattern to every already-landed screen in this worktree
 * (`Home.tsx`, `OnSideDocuments.tsx`, `StudioAsk.tsx`) — full `topbar:
 * TopbarProps` bundle, `onNavigate: SidebarProps['onNavigate']`,
 * `activeId` hardcoded to `'onside.overview'` (intrinsic to this screen).
 * Per the dispatch brief, `Sidebar.tsx`'s `NAV` array does not carry an
 * `onside.overview` child yet (that is this dispatch's flagged, explicitly
 * out-of-allowlist wiring note — parity_ia_addendum.md §0/OQ-A) — until
 * that follow-up edit lands, this screen simply renders with no Sidebar
 * row highlighted for it, the same harmless gap every screen built ahead
 * of its own Sidebar wiring already carries in this worktree.
 *
 * AMBIGUITY RESOLVED — no live OS_SCOPE domain filter: source's
 * `osKpis`/`osOverview` both read a shared `OS_SCOPE` global (the
 * cross-view "scope to one domain" filter, `osScopeBar()`) that lives
 * outside any view this dispatch's data-module list names and has no
 * shell-level home yet in this worktree. This screen always renders the
 * all-domains figures (`OS_SCOPE==='all'` branch of every `osKpis`
 * ternary) — the scoped variant is a STOP-item for whichever future
 * dispatch introduces a shared scope-filter mechanism across OnSide's
 * screens.
 *
 * AMBIGUITY RESOLVED — "Scope changes this session" (`SCOPE_EVENTS`):
 * source's array starts empty on every fresh load and is only ever
 * populated by runtime handlers this dispatch's allowlist does not reach
 * (accepting a Discovery-surfaced play, the chat intake wizard — Batch 8).
 * This screen models the same session-scoped, empty-by-default state
 * locally (`useState<ScopeChangeEvent[]>([])`) and renders nothing when it
 * is empty, matching source's own `SCOPE_EVENTS.length?...:''` guard
 * exactly (Core Principle 3: never fabricate a state with no real
 * producer behind it) — not silently dropped, just honestly empty until a
 * future dispatch wires a real producer into this state setter.
 *
 * AMBIGUITY RESOLVED — StatCard (C1) has no press affordance and no
 * subtitle/caption slot (`StatCardProps` is `label`/`value`/`unit?`/
 * `state?` only — see `components/StatCard.tsx`), while source's `kpi()`
 * helper renders every KPI as a clickable card carrying a full descriptive
 * subtext line (e.g. "applicable to NorthWinds' profile & use cases").
 * Per the addendum's own component assignment ("StatCard (C1) ×6 for
 * osKpis" — no companion caption composite named), this dispatch does not
 * invent an unlisted extra text element or wrap StatCard in a synthetic
 * button to recover click-through: the 6 cards render as pure, correct,
 * non-interactive stats with a short `unit` qualifier only. Flagged as a
 * documented fidelity gap versus source (no long subtext, no per-KPI
 * navigation), not a defect — this is what C1's own closed prop surface
 * supports today.
 *
 * AMBIGUITY RESOLVED — `deepLinkDomainKey` prop (the `dom-KEY` navigation
 * entry point): no router or cross-screen navigation-with-payload
 * mechanism exists in this worktree yet — `Sidebar.tsx`'s `onNavigate` is
 * `(id: string) => void`, a bare id with no room for a domain-key payload,
 * and `App.tsx` (out of allowlist) is the only place such a mechanism
 * could be threaded. This screen exposes an optional `deepLinkDomainKey`
 * prop so a future integrator (e.g. `OnSideDocuments.tsx`'s post-Adopt
 * cascade, or a URL-hash parser in `App.tsx`) has a real prop to set —
 * the screen honors it correctly today (auto-expand + scroll-into-view,
 * matching `onsideShow`'s `domKey` branch exactly) even though nothing in
 * this worktree calls it with a real value yet. STOP-item for the wiring
 * dispatch, not a gap in this screen's own behavior.
 *
 * AMBIGUITY RESOLVED — domain-posture-grid card is a bespoke composite:
 * the addendum's own component list for this row ("a small per-domain
 * summary card built from Label (P3) + Tag (P4, status variants) +
 * PosturePillBar (C12)... row-action") names three primitives/composites,
 * not a single named C-id — there is no existing shared card component
 * matching this exact shape, so it is built as a private, unexported
 * render helper inside this screen file (`DomainPostureCard` below), the
 * same "local subcomponent, not a new shared file" pattern `DataTable.tsx`
 * already uses for its own `SortHeaderButton`. This is not a duplicate
 * component invention — it composes only already-built primitives/
 * composites, verbatim, with no new visual vocabulary of its own.
 *
 * Accessibility gate (persona directive 7): every table below the fold is
 * a real DataTable (C6, inside `DomainsAccordion.tsx`); each domain's
 * accordion header is a real `<button aria-expanded>`; the KPI strip's
 * live values are wrapped by StatCard's own `aria-live="polite"` region
 * (unmodified, inherited); posture-grid cards are real `<button>`s with
 * their full text content (name, scope, status, band) as their accessible
 * name — no icon-only or color-only affordance anywhere in this file.
 *
 * Irreversibility gate (persona directive 6): this screen performs no
 * irreversible action — every control here is either read-only display or
 * plain navigation (`onNavigate`, in-page expand/scroll). N/A, not
 * omitted.
 *
 * STOP-item — no executable test run: matches the STOP-item already
 * recorded on every sibling screen in this worktree (`OnSideDocuments.tsx`,
 * `Home.tsx`, `StudioAsk.tsx`) — no test runner is installed
 * (`package.json` out of this dispatch's allowlist). Verified instead via
 * `npx tsc --noEmit` against the whole `src/` tree (strict,
 * `exactOptionalPropertyTypes`) to confirm this file and its sibling
 * `views/DomainsAccordion.tsx` type-check against the real `StatCard`/
 * `DataTable`/`PosturePillBar`/`SetupCard`/`Chip`/`Tag`/`Button`/`Topbar`/
 * `Sidebar` prop shapes.
 *
 * Layout constants (240px sidebar column, 2rem content padding): copied
 * verbatim from `Home.tsx`/`OnSideDocuments.tsx`'s own documented
 * implementer judgment call for visual consistency across screens, not
 * re-derived independently — design_system_spec.md §1.4 is token-only and
 * does not specify layout dimensions.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { SetupCard } from '../components/SetupCard';
import { PosturePillBar } from '../components/PosturePillBar';
import { Button } from '../components/primitives/Button';
import { Chip } from '../components/primitives/Chip';
import { Label } from '../components/primitives/Label';
import { Tag } from '../components/primitives/Tag';
import { DomainsAccordion, DOMAIN_STATUS_LABEL, DOMAIN_STATUS_VARIANT, curOf, domainPostureSegments, oblToClose, statusOf } from '../views/DomainsAccordion';
import { DOMAINS, SRC_ITEMS } from '../data/onside';
import type { OnsideDomain } from '../data/onside';
import { OPPS } from '../data/studio';

/** Source line 1855: `function feedEventCount(days){...}` — counts every
 * SRC_ITEMS entry whose `daysAgo` (tuple index 0) falls within `days`. */
function feedEventCount(days: number): number {
  let count = 0;
  for (const key of Object.keys(SRC_ITEMS)) {
    for (const item of SRC_ITEMS[key]?.items ?? []) {
      if (item[0] <= days) count++;
    }
  }
  return count;
}

/** Source's `SCOPE_EVENTS` shape (3075) — no producer wired in this
 * dispatch; see file header "Scope changes this session" note. */
interface ScopeChangeEvent {
  uc: string;
  doms: string[];
  obl: number;
}

const DOCS_TOTAL = DOMAINS.reduce((sum, d) => sum + d.docs, 0);
const OBLIGATIONS_IN_SCOPE = DOMAINS.reduce((sum, d) => sum + d.appl, 0);
const OBLIGATIONS_MET = DOMAINS.reduce((sum, d) => sum + d.met, 0);
const GAPS_TO_TARGET = DOMAINS.reduce((sum, d) => sum + oblToClose(d), 0);
const DOMAINS_AT_OR_ABOVE = DOMAINS.filter((d) => statusOf(d) !== 'below').length;
const OBJECTIVES_PREVIEW_COUNT = 8;

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
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
};
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)' };
const KPI_GRID_STYLE: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' };
const POSTURE_GRID_STYLE: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.875rem' };
const CARD_STYLE: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md, 10px)',
  background: 'var(--panel)',
  padding: '1.25rem',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};
const SUB_TEXT_STYLE: CSSProperties = { margin: 0, fontSize: '0.875rem', color: 'var(--ink2)' };
const SCOPE_EVENT_ROW_STYLE: CSSProperties = { display: 'flex', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--ink2)' };
const CHIP_STRIP_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' };

/** Local, unexported render helper — see file header "domain-posture-grid
 * card is a bespoke composite." Not a new shared component; composes only
 * already-built Label/Tag/PosturePillBar. */
function DomainPostureCard({ domain, onOpen }: { domain: OnsideDomain; onOpen: (key: string) => void }) {
  const current = curOf(domain);
  const toClose = oblToClose(domain);
  const status = statusOf(domain);

  return (
    <button
      type="button"
      onClick={() => onOpen(domain.key)}
      style={{ ...CARD_STYLE, textAlign: 'left', cursor: 'pointer', width: '100%', outline: 'none' }}
      data-lf-composite="domain-posture-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ink)' }}>{domain.name}</div>
          <Label
            text={`${domain.bodies} · ${domain.appl}${domain.tot > domain.appl ? ` of ${domain.tot}` : ''} obligations in scope`}
            variant="body-secondary"
          />
        </div>
        <Tag text={DOMAIN_STATUS_LABEL[status]} variant={DOMAIN_STATUS_VARIANT[status]} />
      </div>

      <PosturePillBar segments={domainPostureSegments(current, domain.target)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--ink2)' }}>
        <span>
          {domain.met} at required maturity · {toClose} to close for target
        </span>
        <span aria-hidden="true" style={{ color: 'var(--accent)', fontWeight: 700 }}>
          Open →
        </span>
      </div>
    </button>
  );
}

export interface OnSideOverviewProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as every other screen in this worktree). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('onside.overview') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
  /** See file header "deepLinkDomainKey prop" note — a `dom-KEY` entry point for a future cross-screen deep link. Setting/changing this force-expands and scrolls to the matching domain's accordion row. */
  deepLinkDomainKey?: string;
}

export function OnSideOverview({ topbar, onNavigate, sidebarVersionLabel, deepLinkDomainKey }: OnSideOverviewProps) {
  const [expandedDomainKeys, setExpandedDomainKeys] = useState<ReadonlySet<string>>(new Set());
  const [pendingScrollKey, setPendingScrollKey] = useState<string | null>(null);
  // See file header "Scope changes this session" note — no producer wired
  // in this dispatch; starts and stays empty until one exists.
  const [scopeEvents] = useState<ScopeChangeEvent[]>([]);

  const lastDeepLinkRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!deepLinkDomainKey || deepLinkDomainKey === lastDeepLinkRef.current) return;
    lastDeepLinkRef.current = deepLinkDomainKey;
    setExpandedDomainKeys((prev) => (prev.has(deepLinkDomainKey) ? prev : new Set(prev).add(deepLinkDomainKey)));
    setPendingScrollKey(deepLinkDomainKey);
  }, [deepLinkDomainKey]);

  const openDomain = (key: string) => {
    setExpandedDomainKeys((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
    setPendingScrollKey(key);
  };

  const toggleDomain = (key: string) => {
    setExpandedDomainKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const objectivesPreview = OPPS.slice(0, OBJECTIVES_PREVIEW_COUNT);
  const objectivesRemaining = OPPS.length - objectivesPreview.length;

  const sidebarProps: SidebarProps = {
    activeId: 'onside.overview',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="onside-overview" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="onside-overview-main" style={MAIN_STYLE} aria-labelledby="onside-overview-title">
          <h1 id="onside-overview-title" style={TITLE_STYLE}>
            OnSide · Overview
          </h1>

          <section aria-labelledby="onside-overview-kpis-heading" style={SECTION_STYLE}>
            <h2 id="onside-overview-kpis-heading" style={{ ...SUBHEADING_STYLE, position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
              Key figures
            </h2>
            <div style={KPI_GRID_STYLE}>
              <StatCard label="Documents monitored" value={DOCS_TOTAL} unit="documents" />
              <StatCard label="Obligations in scope" value={OBLIGATIONS_IN_SCOPE} unit="obligations" />
              <StatCard label="Obligations met" value={OBLIGATIONS_MET} unit="obligations" />
              <StatCard label="Gaps to your targets" value={GAPS_TO_TARGET} unit="gaps" />
              <StatCard label="Domains at / above target" value={`${DOMAINS_AT_OR_ABOVE} / ${DOMAINS.length}`} />
              <StatCard label="Change events · 14 days" value={feedEventCount(14)} unit="events" />
            </div>
          </section>

          <section aria-labelledby="onside-overview-posture-heading" style={SECTION_STYLE}>
            <h2 id="onside-overview-posture-heading" style={SUBHEADING_STYLE}>
              Posture by domain · judged against your own targets
            </h2>
            <div style={POSTURE_GRID_STYLE}>
              {DOMAINS.map((domain) => (
                <DomainPostureCard key={domain.key} domain={domain} onOpen={openDomain} />
              ))}
            </div>
          </section>

          {scopeEvents.length > 0 ? (
            <section aria-labelledby="onside-overview-scope-events-heading" style={SECTION_STYLE}>
              <h2 id="onside-overview-scope-events-heading" style={SUBHEADING_STYLE}>
                Scope changes this session
              </h2>
              {scopeEvents.map((event, index) => (
                // eslint-disable-next-line react/no-array-index-key -- session-local, append-only, no stable id in source shape
                <div key={index} style={SCOPE_EVENT_ROW_STYLE}>
                  <span aria-hidden="true">◈</span>
                  <span>
                    <strong>{event.uc}</strong> entered the portfolio: pulls <strong>{event.obl} obligations</strong> into scope across{' '}
                    {event.doms.join(', ')}. Targets re-evaluated.
                  </span>
                </div>
              ))}
            </section>
          ) : null}

          <section aria-labelledby="onside-overview-objectives-heading" style={CARD_STYLE}>
            <h2 id="onside-overview-objectives-heading" style={SUBHEADING_STYLE}>
              Objectives driving scope
            </h2>
            <p style={SUB_TEXT_STYLE}>
              Applicability is derived from the use cases the institution has declared, with determination provenance on every inclusion
              and exclusion. Click one to open it in Studio.
            </p>
            <div style={CHIP_STRIP_STYLE}>
              {objectivesPreview.map((opportunity) => (
                <Chip key={opportunity.n} text={opportunity.n} variant="suggestion" onPress={() => onNavigate('studio.ask')} />
              ))}
              {objectivesRemaining > 0 ? (
                <Chip text={`+ ${objectivesRemaining} more in the register`} variant="suggestion" onPress={() => onNavigate('studio.ask')} />
              ) : null}
            </div>
          </section>

          <section aria-labelledby="onside-overview-connect-heading" style={CARD_STYLE}>
            <h2 id="onside-overview-connect-heading" style={SUBHEADING_STYLE}>
              Every system reads this record · LeapFI · Connect
            </h2>
            <p style={SUB_TEXT_STYLE}>
              Today someone reads the policy manual, decides what it requires, and configures each system by hand: limits, approval
              chains, retention rules, disclosure requirements, access rights. That translation repeats for every product under contract
              and starts drifting the day the next policy changes. Connect is the MCP and API layer of this record, so each system reads
              the approved policy and configures itself instead.
            </p>
            <div>
              <Button variant="ghost" label="Open Connect →" onPress={() => onNavigate('connect.allrailz')} />
            </div>
          </section>

          <section aria-labelledby="onside-overview-cases-heading" style={SECTION_STYLE}>
            <h2 id="onside-overview-cases-heading" style={{ ...SUBHEADING_STYLE, position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
              Cases and approvals
            </h2>
            <SetupCard
              title="Cases · approvals"
              description="Items routed to a named owner for approval, conditional approval, counsel routing, or rejection."
              variant="interactive"
              onPress={() => onNavigate('cases')}
            />
          </section>

          <section aria-labelledby="onside-overview-domains-heading" style={SECTION_STYLE}>
            <h2 id="onside-overview-domains-heading" style={SUBHEADING_STYLE}>
              Domains · gaps &amp; levers on one page
            </h2>
            <p style={SUB_TEXT_STYLE}>
              Every domain the institution monitors, judged against the target it set. Open any category to work its lever and see the
              gaps behind the score.
            </p>
            <DomainsAccordion
              domains={DOMAINS}
              expandedKeys={expandedDomainKeys}
              onToggle={toggleDomain}
              pendingScrollKey={pendingScrollKey}
              onScrollHandled={() => setPendingScrollKey(null)}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
