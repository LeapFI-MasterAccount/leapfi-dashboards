/**
 * StudioAsk — Screen anatomy §5.4 "Studio · Ask — Step 4 'One answer'"
 * (design_system_spec.md), fed by demo_script_draft.md Step 4 and its
 * G5/G6 gap-register entries.
 *
 * Region map (§5.4): Topbar → page title → ChatHero (C10): counters
 * StatCard row ("412 monitored docs", "interviews 11 of 12" —
 * survey_map.md 895–919) → message list → suggestion Chips (`#uc-list`) →
 * Input + "Ask" Button. Components used per spec: Topbar, Sidebar, ChatHero
 * (C10), StatCard (C1, via ChatHero's own counter row), Input (P6), Button
 * (`primary`), Chip (`suggestion`).
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: identical passthrough
 * pattern to the already-landed `Home.tsx`/`BoardDeck.tsx`/
 * `OnSideDocuments.tsx` screens in this worktree — `topbar: TopbarProps`
 * full bundle, `onNavigate: SidebarProps['onNavigate']`, `activeId`
 * hardcoded to `'studio.ask'`.
 *
 * AMBIGUITY RESOLVED — the seeded Q&A matching engine is authored here, not
 * ported: `ChatHero.tsx`'s own file header states plainly that "Studio ·
 * Ask's own matching engine (`COPILOT_QA`/`autoLoanAnswer`...) is a
 * different engine entirely, outside this dispatch's cited line range and
 * not ported here... [ChatHero] never fabricates... state locally" — i.e.
 * ChatHero is purely presentational and expects a screen-owned controller
 * to drive `state`/`messages` from a real matching engine. `data/misc.ts`'s
 * own file header makes the same point from the data side: `autoLoanAnswer`
 * ()'s narrative-composition logic "is UI-rendering logic, not a standalone
 * data object, and is likewise not ported here" — it ports only the two
 * plain-data records (`AUTO_LOAN_OPPORTUNITY`, `AUTO_LOAN_DETAIL`) those
 * handlers operate on, for "whichever data/screen dispatch" consumes them.
 * This screen is that consumer: `matchSeed` below is a locally-authored,
 * simple two-way substring fuzzy match (not a port of any specific ported
 * algorithm — none was ported) over `COPILOT_QA` plus a dedicated
 * indirect-auto-lending branch that composes an answer from the verbatim
 * `AUTO_LOAN_DETAIL`/`AUTO_LOAN_OPPORTUNITY` records and real citations
 * pulled from `data/doclib.ts` (existing indirect-auto-pricing model
 * validation + fair-lending documents already in the corpus — not
 * fabricated new facts).
 *
 * AMBIGUITY RESOLVED — "opportunity register list" (this dispatch's TASK
 * line): demo_script_draft.md Step 4's own "See" line names "the sized
 * use-case list beneath" the chat hero as part of this screen's visible
 * content, and `data/studio.ts`'s 15-play `OPPS` catalog is exactly that
 * sized use-case list (cost/value/horizon/risk per play, already ported
 * verbatim). Rendered here as a `DataTable` beneath ChatHero. The seeded
 * auto-loan Q&A flow (this same TASK line's other half) appends
 * `AUTO_LOAN_OPPORTUNITY` to this register live once its answer completes
 * — mirroring the base engine's own `addAutoLoan()`/`acceptProposed()`
 * mechanic (out of scope to port per `data/misc.ts`'s header, since it
 * reaches into cross-module runtime state; this screen owns triggering the
 * equivalent visible effect from data it does hold), badged "From Ask" and
 * briefly highlighted with a screen-owned `aria-live` announcement — never
 * silently appearing with no signal to an assistive-tech user watching the
 * register update live.
 *
 * AMBIGUITY RESOLVED — citations rendering: `ChatHero.tsx`'s `ChatMessage`
 * shape is `{ id, role, text: string }` — plain text, no structured
 * citation slot. Demo script Step 4's "See" line explicitly calls out "the
 * auto-loan answer rendering... with citations back to approved policy
 * documents" as visible content, so this screen renders a companion
 * "Sources" panel beneath ChatHero, populated from the matched seed's
 * `citations` list and shown once the answer is final — not inside
 * ChatHero's own message bubble (which stays plain text per its existing
 * contract) and not a second competing live-region announcement (ChatHero's
 * own message-bubble live region is already the one owned announcement for
 * this flow; the Sources panel is supplementary visual detail, same
 * category as a Tag's paired status text).
 *
 * Inline-tag stripping: `COPILOT_QA[].a` (`data/misc.ts`) carries `<b>...
 * </b>` emphasis spans the original source rendered via `innerHTML`.
 * `ChatMessage.text` is plain text only (no `dangerouslySetInnerHTML`
 * anywhere in this worktree's composites), so `stripInlineTags` below
 * removes the tags rather than leaving literal "<b>" characters on screen
 * — same category of decision as `OnSideDocuments.tsx`'s `decodeDocText`,
 * duplicated locally rather than shared (no cross-screen utils file in
 * either dispatch's allowlist).
 *
 * Accessibility gate (persona directive 7): ChatHero (C10, unmodified here)
 * already owns the Ask flow's own `aria-live="polite"` answer announcement
 * and the `no-match` fallback's `role="status"`; this screen adds exactly
 * one further screen-owned `aria-live="polite"` region for the opportunity
 * register's live addition (never per-row, matching this codebase's
 * established "one summarized announcement, not a flood" doctrine — see
 * `DataTable.tsx`/`SliderControlRow.tsx`). The register `DataTable` (C6,
 * unmodified) is real `<table>` semantics with a sortable Value/Cost
 * column pair, fully keyboard-operable.
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner or component-testing
 * library installed, matching every sibling screen/composite already
 * landed here. TDD-with-executed-output is therefore not achievable within
 * this dispatch's file boundary; verified instead via `npx tsc --noEmit`
 * against the whole `src/` tree (strict mode, `exactOptionalPropertyTypes`)
 * to confirm this file type-checks against the real `ChatHero`/`DataTable`/
 * `Topbar`/`Sidebar` prop shapes. Recommending the same test-tooling
 * follow-up dispatch `Home.tsx`/`BoardDeck.tsx` already recommend.
 *
 * Layout constants: copied verbatim from `Home.tsx`'s own documented
 * implementer judgment call for visual consistency across screens (see
 * that file's header note — design_system_spec.md §1.4 carries colors
 * only, no px/spacing values).
 */
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { ChatHero } from '../components/ChatHero';
import type { ChatCounter, ChatMessage, ChatHeroState } from '../components/ChatHero';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { Tag } from '../components/primitives/Tag';
import { COPILOT_QA, AUTO_LOAN_OPPORTUNITY, AUTO_LOAN_DETAIL } from '../data/misc';
import { OPPS, CTRL } from '../data/studio';
import type { StudioOpportunity, OppHorizon, OppRisk } from '../data/studio';
import { DOCLIB } from '../data/doclib';

interface OpportunityRow extends StudioOpportunity {
  discovered?: boolean;
}

interface SeedAnswer {
  text: string;
  citations: string[];
  opportunityMatch: boolean;
}

/** See file header "inline-tag stripping." */
function stripInlineTags(input: string): string {
  return input.replace(/<\/?(b|strong|em|br)\s*\/?>/gi, '');
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}k`;
}

/** Real, already-in-corpus citations for the indirect-auto-lending seed —
 * not fabricated: `mrm-val-indirect`/`mrm-cs-indirect` are the existing
 * validation + conceptual-soundness documents for the indirect auto
 * pricing model already in `data/doclib.ts`; `aa-procedure`/`fl-review`
 * cover the adverse-action and fair-lending review gates
 * `AUTO_LOAN_OPPORTUNITY.g` names. */
const AUTO_LOAN_CITATION_DOC_IDS = ['mrm-val-indirect', 'mrm-cs-indirect', 'aa-procedure', 'fl-review'] as const;

/** Step 4's own seeded question (demo_script_draft.md §2 Step 4 `say` line:
 * "what are our rules on indirect auto lending?"). */
const SEEDED_AUTO_LOAN_QUESTION = 'What are our rules on indirect auto lending?';

function buildAutoLoanAnswer(): SeedAnswer {
  const citations = AUTO_LOAN_CITATION_DOC_IDS.map((id) => DOCLIB[id]?.t).filter((t): t is string => Boolean(t)).map(stripInlineTags);
  const gates = AUTO_LOAN_OPPORTUNITY.g.join(', ');
  const text = `${AUTO_LOAN_DETAIL.sum} Governance gates before this ships: ${gates}. Estimated build cost ${formatCurrency(
    AUTO_LOAN_OPPORTUNITY.cost,
  )}, estimated annual value ${formatCurrency(AUTO_LOAN_OPPORTUNITY.val)}.`;
  return { text, citations, opportunityMatch: true };
}

function matchCopilotQA(query: string): SeedAnswer | null {
  const q = query.trim().toLowerCase();
  for (const item of COPILOT_QA) {
    const phrase = item.chips.toLowerCase();
    if (q === item.q.toLowerCase() || q.includes(phrase) || phrase.includes(q)) {
      return { text: stripInlineTags(item.a), citations: item.src, opportunityMatch: false };
    }
  }
  return null;
}

/** See file header "the seeded Q&A matching engine is authored here." */
function matchSeed(query: string): SeedAnswer | null {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return null;
  if (q.includes('indirect') || q.includes('auto lend') || q.includes('auto loan')) {
    return buildAutoLoanAnswer();
  }
  return matchCopilotQA(query);
}

/** Mirrors `data/studio.ts`'s own (unexported) `gateCalc` exactly —
 * duplicated locally since it is not exported, same "small local helper
 * duplicated across sibling files" convention this codebase already uses
 * (see `ChatHero.tsx`/`SliderControlRow.tsx`'s duplicated `StatTile`). */
function buildAutoLoanOpportunityRow(): OpportunityRow {
  const gates = AUTO_LOAN_OPPORTUNITY.g;
  const minGate = Math.min(...gates.map((g) => CTRL[g] ?? 0));
  const weakGate = [...gates].sort((a, b) => (CTRL[a] ?? 0) - (CTRL[b] ?? 0))[0] ?? gates[0] ?? '';
  return {
    n: AUTO_LOAN_OPPORTUNITY.n,
    c: AUTO_LOAN_OPPORTUNITY.c,
    cost: AUTO_LOAN_OPPORTUNITY.cost,
    val: AUTO_LOAN_OPPORTUNITY.val,
    h: AUTO_LOAN_OPPORTUNITY.h as OppHorizon,
    r: AUTO_LOAN_OPPORTUNITY.r as OppRisk,
    g: AUTO_LOAN_OPPORTUNITY.g,
    minGate,
    weakGate,
    discovered: true,
  };
}

/** ASK_SUBMIT_DELAY_MS / ASK_RENDER_DELAY_MS: implementer judgment calls
 * (design_system_spec.md §1.4 carries no timing values) — long enough that
 * ChatHero's `submitting`/`answer-rendering` states are visibly real
 * waits, matching Core Principle 1's discipline against instant,
 * indistinguishable-from-fake state flips, even though Ask itself (a
 * read-only query, not an irreversible operation) does not require the
 * formal request-key idempotency gate the persona reserves for
 * OnSideDocuments' Adopt action. */
const ASK_SUBMIT_DELAY_MS = 350;
const ASK_RENDER_DELAY_MS = 450;
const REGISTER_HIGHLIGHT_MS = 1800;

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
const CHAT_PANEL_STYLE: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md, 10px)',
  background: 'var(--panel)',
  padding: '1.5rem',
};
const SOURCES_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const SOURCES_HEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '0.06em' };
const SOURCES_LIST_STYLE: CSSProperties = { margin: 0, padding: '0 0 0 1.1rem', fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.6 };
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)' };
const SECTION_NOTE_STYLE: CSSProperties = { margin: 0, fontSize: '0.875rem', color: 'var(--ink2)' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto' };
const SR_ONLY_STYLE: CSSProperties = {
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

const COUNTERS: ChatCounter[] = [
  // survey_map.md 895–919 / demo_script_draft.md Step 4 say line — cited
  // literal figures, not invented.
  { value: 412, label: 'Monitored documents' },
  { value: '11 of 12', label: 'Discovery interviews complete' },
];

const SUGGESTIONS: string[] = [...COPILOT_QA.map((item) => item.chips), SEEDED_AUTO_LOAN_QUESTION];

export interface StudioAskProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as `Home.tsx`). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('studio.ask') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
}

export function StudioAsk({ topbar, onNavigate, sidebarVersionLabel }: StudioAskProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState<ChatHeroState>('idle');
  const [citations, setCitations] = useState<string[]>([]);
  const [registeredOpportunities, setRegisteredOpportunities] = useState<OpportunityRow[]>(() => OPPS.map((o) => ({ ...o })));
  const [justRegisteredId, setJustRegisteredId] = useState<string | null>(null);
  const [registerAnnouncement, setRegisterAnnouncement] = useState('');

  const requestSeqRef = useRef(0);
  const msgSeqRef = useRef(0);
  const registerTimeoutRef = useRef<number | undefined>(undefined);

  const registerAutoLoanOpportunity = () => {
    setRegisteredOpportunities((prev) => {
      if (prev.some((o) => o.n === AUTO_LOAN_OPPORTUNITY.n)) return prev;
      return [buildAutoLoanOpportunityRow(), ...prev];
    });
    setJustRegisteredId(AUTO_LOAN_OPPORTUNITY.n);
    setRegisterAnnouncement(
      `New opportunity registered: ${AUTO_LOAN_OPPORTUNITY.n} — ${formatCurrency(AUTO_LOAN_OPPORTUNITY.val)} annual value, gated on ${AUTO_LOAN_OPPORTUNITY.g.join(', ')}.`,
    );
    if (registerTimeoutRef.current !== undefined) window.clearTimeout(registerTimeoutRef.current);
    registerTimeoutRef.current = window.setTimeout(() => setJustRegisteredId(null), REGISTER_HIGHLIGHT_MS);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setChatState((current) => {
      if (current === 'submitting' || current === 'answer-rendering') return current;
      return value.trim().length > 0 ? 'typing' : 'idle';
    });
  };

  const handleAsk = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    const requestKey = ++requestSeqRef.current;

    msgSeqRef.current += 1;
    const userMessage: ChatMessage = { id: `msg-${msgSeqRef.current}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setChatState('submitting');

    window.setTimeout(() => {
      if (requestSeqRef.current !== requestKey) return; // superseded by a newer Ask press
      setChatState('answer-rendering');
      window.setTimeout(() => {
        if (requestSeqRef.current !== requestKey) return;
        const matched = matchSeed(trimmed);
        if (matched) {
          msgSeqRef.current += 1;
          const assistantMessage: ChatMessage = { id: `msg-${msgSeqRef.current}`, role: 'assistant', text: matched.text };
          setMessages((prev) => [...prev, assistantMessage]);
          setCitations(matched.citations);
          setChatState('answer-complete');
          if (matched.opportunityMatch) registerAutoLoanOpportunity();
        } else {
          setCitations([]);
          setChatState('no-match');
        }
      }, ASK_RENDER_DELAY_MS);
    }, ASK_SUBMIT_DELAY_MS);
  };

  const showSources = chatState === 'answer-complete' && citations.length > 0;

  const opportunityColumns: DataTableColumn<OpportunityRow>[] = [
    {
      id: 'name',
      header: 'Opportunity',
      sortable: true,
      sortValue: (row) => row.n,
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {row.n}
          {row.discovered ? <Tag text="From Ask" variant="hitl" /> : null}
        </span>
      ),
    },
    { id: 'category', header: 'Category', render: (row) => <span>{row.c}</span> },
    { id: 'cost', header: 'Build cost', align: 'end', sortable: true, sortValue: (row) => row.cost, render: (row) => <span>{formatCurrency(row.cost)}</span> },
    { id: 'value', header: 'Annual value', align: 'end', sortable: true, sortValue: (row) => row.val, render: (row) => <span>{formatCurrency(row.val)}</span> },
    { id: 'horizon', header: 'Horizon', render: (row) => <span style={{ textTransform: 'capitalize' }}>{row.h}</span> },
    { id: 'gate', header: 'Weakest control gate', render: (row) => <span>{row.weakGate} · {row.minGate}</span> },
  ];

  const updatingRowIdsProp = justRegisteredId ? { updatingRowIds: new Set([justRegisteredId]) } : {};

  const sidebarProps: SidebarProps = {
    activeId: 'studio.ask',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="studio-ask" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="studio-ask-main" style={MAIN_STYLE} aria-labelledby="studio-ask-title">
          <h1 id="studio-ask-title" style={TITLE_STYLE}>
            Studio · Ask
          </h1>

          <div style={CHAT_PANEL_STYLE}>
            <ChatHero
              counters={COUNTERS}
              messages={messages}
              suggestions={SUGGESTIONS}
              inputValue={inputValue}
              onInputChange={handleInputChange}
              onAsk={handleAsk}
              state={chatState}
            />
          </div>

          {showSources ? (
            <div style={SOURCES_STYLE} aria-label="Answer sources">
              <h2 style={SOURCES_HEADING_STYLE}>Sources</h2>
              <ul style={SOURCES_LIST_STYLE}>
                {citations.map((citation) => (
                  <li key={citation}>{citation}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <section aria-labelledby="studio-ask-register-heading" style={SECTION_STYLE}>
            <h2 id="studio-ask-register-heading" style={SUBHEADING_STYLE}>
              Opportunity register
            </h2>
            <p style={SECTION_NOTE_STYLE}>
              The sized use-case catalog Studio funds against. Asking the seeded indirect-auto-lending question registers a new discovered
              opportunity here, live.
            </p>
            <span role="status" aria-live="polite" style={SR_ONLY_STYLE}>
              {registerAnnouncement}
            </span>
            <div style={SCROLL_WRAP_STYLE}>
              <DataTable
                caption="Opportunity register"
                columns={opportunityColumns}
                rows={registeredOpportunities}
                getRowId={(row) => row.n}
                {...updatingRowIdsProp}
                defaultSortColumnId="value"
                defaultSortDirection="descending"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
