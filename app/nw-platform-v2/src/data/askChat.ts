/**
 * Context-scoped Ask chat — scripted content (PI2-D42, amendment A16).
 *
 * Authoring venue: Marisol Vance (demo-narrator persona), on branch
 * `marisol/askchat-content`. Structure venue: `ux-designer` persona /
 * `design_system_spec.md` §2.9.4 (schema authority — commit
 * ef22e4ab480f5d0e3851eb4873c37380cf08765b, worktree pi1/design-system-
 * spec-amendment). This file supplies the two `ChatModuleConfig` records
 * the delta index (§8 R-4(n)) calls for; it authors content INTO that
 * schema and invents no structure of its own. The consumer (the Drawer/
 * ChatHero wiring on all seven `onside.*`/`studio.*` screens) is a
 * separate, concurrent lane (Lena) and does not exist in this worktree —
 * this module is self-contained, plain typed data, importable on its own.
 *
 * Click-path fidelity (this persona's SOP, sop-demo-narrator/SKILL.md):
 * every id below was read, not assumed, from the shipped data modules at
 * `leapfi-dashboards` pinned commit `1dde9e6` (branch
 * `pi/gh-1-nw-platform-demo`, read-only reference):
 *   - `data/onside.ts` — DOMAINS (domain keys), OBL (obligation ids per
 *     domain), GAPS, DOM_OPEN, INSTR, M (RACI), TRACKED_RULES/INFORCE_RULES.
 *   - `data/studio.ts` — OPPS (play names, cost/val/horizon/risk, minGate/
 *     weakGate), CTRL/GREEN/GOV/REGMAP, DETAIL (deps/unlocks).
 *   - `data/doclib.ts` — DOCLIB document ids + redline presence.
 *   - `data/cases.ts` — `seedCases()`'s fixed iteration order
 *     (['irp','tprm-program','aa-procedure','mrm-change-draft',
 *     'msg-disclosure','rege-proc','gov-charter','gen-ai-draft']), all
 *     eight of which carry a `redline` in `doclib.ts` (verified by direct
 *     read), so `CASES` seeds sequentially and deterministically:
 *     CASE-2026-001=irp, 002=tprm-program, 003=aa-procedure,
 *     004=mrm-change-draft, 005=msg-disclosure, 006=rege-proc,
 *     007=gov-charter, 008=gen-ai-draft. `seedCases()` is confirmed called
 *     at app init (`App.tsx`), so these ids are live at runtime, not
 *     merely theoretical.
 *   - `screens/OnSideOverview.tsx` — 'domain'/'obligation' deep-link
 *     consumer effects (obligation id format `${domKey}:${oblId}`,
 *     case-sensitive exact match against `OBL[domainKey]` row ids).
 *   - `screens/OnSideDocuments.tsx` — 'document' deep-link consumer
 *     (matches `DOCLIB`/doc-catalog id exactly).
 *   - `screens/Cases.tsx` — 'case' deep-link consumer (matches `CASES`
 *     id exactly).
 *   - `screens/OnSideFeed.tsx` — 'section' deep-link consumer (only the
 *     `'lifecycle'` id is wired; `'gaps'` is a documented open STOP-item
 *     in that screen's own header, so it is never used as a target here).
 *   - `screens/StudioAsk.tsx` / `screens/InvestmentDesign.tsx` — 'play'
 *     deep-link producer/consumer precedent (`{screen:
 *     'studio.investment-design', kind: 'play', id: row.n}`), and
 *     `buildPlayDrawerContent()`'s own "Sequence-gated: blocked until
 *     ${weakGate} reaches ${GREEN}%" line — the ONE existing home for
 *     blocker detail (Depends-on/Unlocks + per-gate governance fields),
 *     never duplicated into `responseText` here (§2.9.4 "Blockers
 *     linkage" rule, PI2-D28 precedent).
 *
 * Deliberately NOT used: 'control'/'signal'/'feed-source' deep-link kinds.
 * `App.tsx`'s own KIND VOCABULARY comment classifies these CLASS 3 — "no
 * live call site fires it anywhere in shipped code" — so, although each
 * has a built consumer effect, none has ever fired end-to-end in the
 * shipped product. This module only targets kinds with a confirmed live
 * producer AND consumer already wired (CLASS 1: domain, play, case,
 * document; CLASS 2, wired this wave: obligation, section['lifecycle']).
 *
 * `ScreenId`/`DeepLinkKind` are imported directly from `App.tsx` (read-
 * only) rather than restated as bare strings, so `tsc` itself enforces
 * that every `request.screen`/`request.kind` below is a real, currently-
 * shipped union member — the compiler proves the same claim the prose
 * evidence above makes.
 *
 * Voice: operator/examiner register (sop-demo-narrator Core Principle 2),
 * matching this codebase's own shipped copy (data/misc.ts COPILOT_QA,
 * screens/InvestmentDesign.tsx's governance/status field text) — plain,
 * specific, citation-bearing, no marketing framing. `brand_doctrine.md`'s
 * "authoritative, sophisticated, definitive, trustworthy… no hedging"
 * register is a color/logo/tagline doctrine file at the mark level; the
 * in-product operator voice precedent (cited above) is what this content
 * follows for in-app copy, per this persona's "voice is not mine to set —
 * use what's already ratified" rule. No STOP was needed on voice: no
 * conflict was found between the two, and no new tone was invented.
 *
 * `responseText` is plain text only (schema: "no markup") — no `<b>` tags,
 * unlike some source dataset string fields (e.g. `OnsideDomain.why`) which
 * carry inline HTML for a different rendering context.
 */
import type { ScreenId, DeepLinkKind } from '../App';

export type ChatModule = 'onside' | 'studio';

/** One scripted question/answer pair (design_system_spec.md §2.9.4). */
export interface ChatEntry {
  id: string;
  /** Suggestion Chip visible+fill text AND the exact-match key (case-insensitive, trimmed). */
  question: string;
  /** ChatMessage.text for the assistant's reply — plain text, no markup. */
  responseText: string;
  /** Zero or more inline references into real screens. */
  deepLinks?: ChatEntryDeepLink[];
}

export interface ChatEntryDeepLink {
  /** Visible inline-link text, e.g. "See MRM-09 in Model Risk." */
  label: string;
  /** Passed verbatim to onDeepLink — App.tsx's existing DeepLinkRequest contract. */
  request: { screen: ScreenId; kind: DeepLinkKind; id: string };
}

/** Fixed once per module (design_system_spec.md §2.9.4). */
export interface ChatModuleConfig {
  module: ChatModule;
  /** Drawer `title` — the scoping indicator. */
  drawerTitle: string;
  /** Utility-corner trigger Button label (§2.9.5). */
  entryLabel: string;
  /** ChatHero's inputLabel/inputPlaceholder (§2.9.3 item 1). */
  inputLabel: string;
  inputPlaceholder: string;
  /** Seeds the first assistant ChatMessage.text at every fresh open. */
  greeting: string;
  /** ChatHero's existing `noMatchMessage` prop. */
  defaultNoMatchMessage: string;
  /** Marisol's scripted set for this module. */
  entries: ChatEntry[];
}

/* ============================================================
 * OnSide chat — regulatory items scoped to OnSide's data domains.
 * ============================================================ */

export const ONSIDE_CHAT: ChatModuleConfig = {
  module: 'onside',
  drawerTitle: 'OnSide chat',
  entryLabel: 'Ask OnSide',
  inputLabel: 'Ask about a domain, obligation, or case',
  inputPlaceholder: 'Ask about a regulatory domain, obligation, document, or case…',
  greeting:
    "I can answer questions about NorthWinds' regulatory domains, obligations, documents, and open cases. Try one of the questions below, or type your own.",
  defaultNoMatchMessage:
    "I don't have a scripted answer for that yet. Try one of the questions below, or open the Regulatory Feed, Documents, or Ownership screens directly.",
  entries: [
    {
      id: 'onside-rfi-2026-04',
      question: 'What would RFI 2026-04 change here?',
      responseText:
        'RFI 2026-04 would pull generative and agentic systems inside the model-risk definition; comments are due September 30, 2026. MRM-11 is the one obligation that reaches — interim governance for generative and agentic models, currently a gap because those systems sit outside policy scope today. OnSide has pre-staged the scope language, so it ships into the Governance Charter the day the interagency scope finalizes.',
      deepLinks: [
        { label: 'See MRM-11 in Model Risk', request: { screen: 'onside.overview', kind: 'obligation', id: 'mrm:MRM-11' } },
        { label: 'Open the pre-staged governance language', request: { screen: 'onside.documents', kind: 'document', id: 'gen-ai-draft' } },
      ],
    },
    {
      id: 'onside-mrm-09-close',
      question: 'What closes MRM-09?',
      responseText:
        'MRM-09 requires a formal approval gate before model changes deploy; today changes ship on developer sign-off alone. The fix is drafted — the Model Change Approval Workflow, Draft 0.8, sitting in the HITL review queue — and it is moving through Case CASE-2026-004.',
      deepLinks: [
        { label: 'Open MRM-09 in Model Risk', request: { screen: 'onside.overview', kind: 'obligation', id: 'mrm:MRM-09' } },
        { label: 'See Case CASE-2026-004', request: { screen: 'cases', kind: 'case', id: 'CASE-2026-004' } },
      ],
    },
    {
      id: 'onside-nm-hb210',
      question: "Are we exposed on New Mexico's AI bill?",
      responseText:
        'NM HB 210 passed the Senate 34–6 and would extend AI-disclosure duties to third-party vendors — relevant because of our indirect-lending vendor relationships. TPRM-01, the complete vendor inventory, is already met. TPRM-04, the contract clauses covering audit rights, incident notification, and vendor disclosure, is partial: the disclosure language is drafted into Contract Rider v3.0, rolling into the 9 legacy contracts that predate it, on schedule through Q1-2027.',
      deepLinks: [
        { label: 'See TPRM-04 in Third-Party Risk', request: { screen: 'onside.overview', kind: 'obligation', id: 'tprm:TPRM-04' } },
        { label: 'Open the Contract Rider template', request: { screen: 'onside.documents', kind: 'document', id: 'contract-rider' } },
      ],
    },
    {
      id: 'onside-aigov-open',
      question: "What's open in AI Governance?",
      responseText:
        "AI Governance carries the widest gap: 104 of 214 applicable CRI controls sit below required maturity across GOVERN, MAP, MEASURE, and MANAGE. The highest-priority open item is the Incident Response Plan's missing escalation path for member-facing automation — the one critical-severity gap on the board, owned by P. Nguyen, with the §3.4 redline already drafted and awaiting her review. The Governance Charter's generative and agentic scope language is pre-staged and ships the day RFI 2026-04 finalizes.",
      deepLinks: [
        { label: 'Open AI Governance', request: { screen: 'onside.overview', kind: 'domain', id: 'aigov' } },
        { label: 'Read the Incident Response Plan redline', request: { screen: 'onside.documents', kind: 'document', id: 'irp' } },
      ],
    },
    {
      id: 'onside-tprm-08',
      question: "What's the status of the TPRM-08 exit-plan gap?",
      responseText:
        'TPRM-08 requires documented termination and exit plans for critical relationships, including data portability — today exit is handled ad hoc at contract end. The Exit Plan Standard, Draft 0.7, is in HITL review, and it proposes a new §6 on the Third-Party Risk Management Program itself. That is Case CASE-2026-002, owned by P. Nguyen.',
      deepLinks: [
        { label: 'See TPRM-08 in Third-Party Risk', request: { screen: 'onside.overview', kind: 'obligation', id: 'tprm:TPRM-08' } },
        { label: 'Open Case CASE-2026-002', request: { screen: 'cases', kind: 'case', id: 'CASE-2026-002' } },
      ],
    },
    {
      id: 'onside-aa-reason-codes',
      question: 'Where do adverse-action reason codes stand?',
      responseText:
        "Circular 2026-C1 requires specific principal reasons for model-assisted denials. The Adverse-Action Procedure's §4 redline is drafted: reason codes now derive from the model's documented feature attributions, mapped through a tested attribution-to-code matrix and verified quarterly against a sampled file review. That is Case CASE-2026-003, owned by M. Okafor.",
      deepLinks: [
        { label: 'Open the Adverse-Action Procedure redline', request: { screen: 'onside.documents', kind: 'document', id: 'aa-procedure' } },
        { label: 'See Case CASE-2026-003', request: { screen: 'cases', kind: 'case', id: 'CASE-2026-003' } },
      ],
    },
    {
      id: 'onside-reg-lifecycle',
      question: 'How does a rule move from proposed to in force?',
      responseText:
        'Every item moves through three stages on one page: newly proposed, tracked while it is live — like RFI 2026-04, comments due September 30, or NM HB 210, passed the Senate 34–6 and awaiting the House — and in force once it is binding, like Interagency Guidance 2026-13, effective since April 17, 2026.',
      deepLinks: [{ label: 'See the regulatory lifecycle', request: { screen: 'onside.feed', kind: 'section', id: 'lifecycle' } }],
    },
    {
      id: 'onside-mrm-policy-owner',
      question: 'Who owns the Model Risk Management Policy?',
      responseText:
        'The Model Risk Management Policy is CRO-accountable and Model Risk Manager-responsible, with General Counsel consulted and the Board and CCO informed. It is current — Board Risk Committee sign-off July 14, 2026, next review July 2027.',
      deepLinks: [{ label: 'Open the Model Risk Management Policy', request: { screen: 'onside.documents', kind: 'document', id: 'mrm-policy' } }],
    },
  ],
};

/* ============================================================
 * Studio chat — opportunity/development items and their blockers.
 * ============================================================ */

export const STUDIO_CHAT: ChatModuleConfig = {
  module: 'studio',
  drawerTitle: 'Studio chat',
  entryLabel: 'Ask Studio',
  inputLabel: 'Ask about an opportunity',
  inputPlaceholder: "Ask about a play in the portfolio, its cost, value, or what's blocking it…",
  greeting:
    "I can answer questions about the opportunity register — cost, value, and what's blocking each play from the funded portfolio. Try one of the questions below, or type your own.",
  defaultNoMatchMessage:
    "I don't have a scripted answer for that yet. Try one of the questions below, or open Investment Design to browse the full opportunity register.",
  entries: [
    {
      id: 'studio-blocker-underwriting-assist',
      question: "What's blocking Underwriting assist?",
      responseText:
        "Underwriting assist is sequence-gated on Adverse Action, the weakest of its three governance gates at 55% against the 80% bar — Fair Lending sits at 68%, Model Risk at 70%. It also depends on two other plays landing first: Unified data foundation and AI adverse-action letter drafting. At $150,000 to build against $400,000 in annual value, it's the largest single opportunity in the portfolio, and Adverse Action is what's holding it back.",
      deepLinks: [{ label: 'Open Underwriting assist in Investment Design', request: { screen: 'studio.investment-design', kind: 'play', id: 'Underwriting assist' } }],
    },
    {
      id: 'studio-blocker-txn-monitoring-tuning',
      question: "What's blocking Transaction-monitoring tuning assist?",
      responseText:
        'Transaction-monitoring tuning assist is gated on Model Risk, at 70% against the 80% bar — BSA/AML is already ahead at 74%. It also waits on Unified data foundation, the shared data layer every strategic play draws on. Once both clear, it is a $120,000 build against $330,000 a year.',
      deepLinks: [{ label: 'Open Transaction-monitoring tuning assist', request: { screen: 'studio.investment-design', kind: 'play', id: 'Transaction-monitoring tuning assist' } }],
    },
    {
      id: 'studio-blocker-fraud-model-refresh',
      question: "What's blocking Fraud model refresh?",
      responseText:
        'Fraud model refresh has one gate: Model Risk, at 70% against the 80% bar. It is also sequenced behind Unified data foundation. At $90,000 to build against $260,000 a year, it clears as soon as Model Risk closes.',
      deepLinks: [{ label: 'Open Fraud model refresh', request: { screen: 'studio.investment-design', kind: 'play', id: 'Fraud model refresh' } }],
    },
    {
      id: 'studio-blocker-deposit-pricing',
      question: "What's blocking Deposit pricing optimization?",
      responseText:
        'Deposit pricing optimization is gated the same way as the other Model Risk-dependent plays: 70% against the 80% bar, and sequenced behind Unified data foundation. Build is $80,000 against $240,000 a year once it clears.',
      deepLinks: [{ label: 'Open Deposit pricing optimization', request: { screen: 'studio.investment-design', kind: 'play', id: 'Deposit pricing optimization' } }],
    },
    {
      id: 'studio-unified-data-foundation',
      question: 'Why does everything wait on Unified data foundation?',
      responseText:
        'Unified data foundation is the one dependency the strategic plays share: the governed warehouse, conformed core, and feature layer everything else draws on. Six plays wait on it — Transaction-monitoring tuning assist, Fraud model refresh, Marketing personalization, Deposit pricing optimization, Underwriting assist, and Complaint analytics. It is a $250,000 build gated on InfoSec, already at 90% against the 80% bar.',
      deepLinks: [{ label: 'Open Unified data foundation', request: { screen: 'studio.investment-design', kind: 'play', id: 'Unified data foundation' } }],
    },
    {
      id: 'studio-biggest-opportunity',
      question: "What's the biggest opportunity in the portfolio?",
      responseText:
        'By annual value, Underwriting assist tops the catalog at $400,000 a year against a $150,000 build — the single largest opportunity, gated on Adverse Action governance maturity before it enters the funded portfolio.',
      deepLinks: [{ label: 'Open Underwriting assist in Investment Design', request: { screen: 'studio.investment-design', kind: 'play', id: 'Underwriting assist' } }],
    },
  ],
};

/**
 * Convenience lookup by module id — mechanical derivation from the two
 * records above (no additional authored content, no structure decision;
 * the seven host screens each need to select their own module's config).
 */
export const ASK_CHAT_MODULES: Record<ChatModule, ChatModuleConfig> = {
  onside: ONSIDE_CHAT,
  studio: STUDIO_CHAT,
};
