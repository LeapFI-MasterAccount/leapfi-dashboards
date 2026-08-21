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
 *
 * ============================================================
 * AMENDMENT A20 / PI2-D47 pass (2026-08-20) — response-type extension.
 * ============================================================
 *
 * Dispatch: Marisol Vance, ALLOWLIST `data/askChat.ts` only, branch
 * `marisol/ask-agent-content`, worktree `wt/askagent-content`. Reference
 * pins re-verified for this pass (not re-copied from the A16 header
 * above): `leapfi-dashboards` @ `9da2fa3` (branch `pi/gh-1-nw-platform-
 * demo`, read-only reference for every id below); spec authority
 * `design_system_spec.md` @ `52d7219b6c9d983029d035142dd6ca2bcbde5940`
 * (worktree `wt/pi1-spec-amend`, branch `pi1/design-system-spec-
 * amendment`) §2.9.8–§2.9.11 (StudioAsk becomes the agent, PI2-D47).
 *
 * Schema: `ChatResponseType`/the four response-payload interfaces/
 * `ChatEntry.response?` below are this file's OWN local authoring of
 * §2.9.10's TypeScript-flavored text — the same "authored independently,
 * against the same schema" pattern this file's types already used for
 * A16 relative to `data/chatTypes.ts` (see `data/askChatModuleConfig.ts`'s
 * header). `data/chatTypes.ts` gains the equivalent extension separately,
 * on the implementer (Lena) lane — confirmed NOT yet landed at this pin
 * (`wt/askagent-build`, branch `lena/ask-agent-screen`, checked at
 * dispatch time: still at the base A16 shape, no `response` field). Per
 * §2.9.10's own "complete enough to build concurrently" framing, this
 * lane does not block on that one — this file's local types are
 * structurally identical to the ruling's text and to the eventual
 * `chatTypes.ts` extension, so `tsc --noEmit` stands alone against THIS
 * file today, and `askChatModuleConfig.ts`'s existing `entries:
 * ONSIDE_CHAT.entries` / `STUDIO_CHAT.entries` assignments keep compiling
 * unchanged (structural assignability — a value with an extra optional
 * field assigns fine to a narrower target type; excess-property checks
 * only fire on object literals, not on this kind of property access).
 *
 * Dual-consumer content (one array, two renderers — §2.9.10's own
 * documented behavior, restated here because it governs what belongs on
 * each `STUDIO_CHAT` entry): `STUDIO_CHAT.entries` is read by BOTH (1)
 * the rebuilt `StudioAsk.tsx` response canvas (§2.9.9 — reads
 * `response`, renders one of the four typed layouts; ignores nothing) and
 * (2) the unchanged Drawer-hosted `AskChatPanel`/ChatHero bubble surface
 * still mounted on Investment Design and Roadmap (§2.9.5's six-screen
 * narrowing, §2.9.12 — StudioAsk itself no longer mounts it, but its two
 * Studio siblings still do) — that surface ignores `response` entirely
 * and always renders `responseText` + `deepLinks`. So every
 * `STUDIO_CHAT` entry below keeps its pre-A20 `deepLinks` (still live for
 * consumer 2) AND gains a `response` payload (for consumer 1) — neither
 * field is dead weight; each serves a different, real, shipped call site.
 * `ONSIDE_CHAT` has only the Drawer-hosted consumer (no response canvas
 * exists for `onside.*` screens), so `response` there is authored ONLY
 * where §8 R-4(r) explicitly calls for it ("including at least one new
 * `compliance-attainment` entry in ONSIDE_CHAT" — the ONE new entry
 * below) and left OMITTED elsewhere, which is the schema's own stated
 * backward-compatible default ("Absence of `response` = 'instructional'-
 * equivalent rendering") — not a gap, a deliberate minimal footprint on
 * content that a real render surface will never read differently.
 *
 * New-entry grounding, each independently re-verified against the
 * pinned data modules for this pass (not carried over from the A16 pass
 * above):
 *   - `studio-doc-adverse-action-redline` ('document'): cost/gate figures
 *     for Underwriting assist re-read from `data/studio.ts` OPPS_BASE
 *     (`{ n: 'Underwriting assist', ..., g: ['Fair Lending', 'Adverse
 *     Action', 'Model Risk'] }`) and `CTRL` (`'Adverse Action': 55`); the
 *     Adverse-Action Procedure redline text and Case CASE-2026-003 are
 *     the same two facts the pre-existing `onside-aa-reason-codes` entry
 *     already cites (re-read from `data/doclib.ts`'s `aa-procedure` key
 *     and `data/cases.ts`'s `seedCases()` iteration order, both
 *     confirmed present at this pin) — reused, not duplicated invention.
 *   - `studio-howto-unblock-play` ('instructional'): the two-clause
 *     unblock mechanic (weakest listed gate must clear the 80% `GREEN`
 *     bar; every `deps` entry must land first) is read directly from
 *     `engine/plan.ts`'s `gateCalc()`/`sortPool()` shape and
 *     `data/studio.ts`'s `GREEN = 80` constant; the six-play dependency
 *     list on 'Unified data foundation' is read from `data/studio.ts`
 *     `DETAIL_BASE`'s `deps` arrays (`Transaction-monitoring tuning
 *     assist`, `Fraud model refresh`, `Marketing personalization`,
 *     `Deposit pricing optimization`, `Underwriting assist`, `Complaint
 *     analytics` — six, an exact count, not an estimate), matching the
 *     pre-existing `studio-unified-data-foundation` entry's own count.
 *   - `studio-fairlend-attainment` / `onside-aigov-attainment`
 *     ('compliance-attainment'): `met`/`appl`/`target`/`bodies`/`owner`/
 *     `inst`/`why` fields re-read verbatim from `data/onside.ts` DOMAINS
 *     (`fairlend`: appl 29, met 21, target 4, bodies 'CFPB · NCUA';
 *     `aigov`: appl 214, tot 230, met 110, target 3, bodies 'NCUA ·
 *     Interagency'). The "obligations short of target" figure in prose
 *     is computed the SAME way `views/DomainsAccordion.tsx`'s own
 *     `oblToClose()` computes it (`Math.max(0, Math.round(target/5*appl -
 *     met))`) — worked by hand here from the same real inputs, never
 *     invented: fairlend = max(0, round(4/5*29-21)) = 2; not re-derived
 *     for aigov since that entry states counts directly (110 of 214),
 *     the exact "N at required maturity" framing §2.9.9(d) itself
 *     specifies, with no derived "short by" figure needed. The
 *     `CTRLDOM` map (`data/studio.ts`) confirms both CTRL gate names
 *     'Fair Lending' and 'Adverse Action' key to OnSide domain
 *     `fairlend` — the cross-reference `studio-fairlend-attainment`'s
 *     prose relies on to name both of Underwriting assist's non-Model-
 *     Risk gates in the same breath as the domain's obligation count,
 *     without conflating the two different metrics (a 0-100 control-
 *     maturity score vs. an obligations-met count) — each is stated with
 *     its own real, sourced number, never merged into one figure.
 *   - The 214-110=104 identity cross-checks the pre-existing
 *     `onside-aigov-open` entry's own "104 of 214 applicable CRI controls
 *     sit below required maturity" line — confirms both entries describe
 *     the same real dataset consistently, not two different numbers for
 *     the same fact.
 *
 * No STOP was needed on structure or voice for this pass: §2.9.9/§2.9.10
 * fully specify the four canvas layouts and the schema shape (nothing
 * left to infer), and the new entries' register matches the same
 * plain, citation-bearing, no-hype voice the A16 pass already
 * established and no doctrine has since revised.
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
  /**
   * NEW (amendment A20, PI2-D47, §2.9.10). Omitted = 'instructional'-
   * equivalent rendering — backward compatible with every pre-A20 entry.
   * Read ONLY by StudioAsk's rebuilt response canvas (§2.9.9);
   * AskChatPanel/ChatHero's Drawer-hosted bubble surface (unchanged)
   * ignores it entirely and always renders `responseText` + `deepLinks`
   * regardless of `response`'s presence.
   */
  response?: ChatEntryResponse;
}

export interface ChatEntryDeepLink {
  /** Visible inline-link text, e.g. "See MRM-09 in Model Risk." */
  label: string;
  /** Passed verbatim to onDeepLink — App.tsx's existing DeepLinkRequest contract. */
  request: { screen: ScreenId; kind: DeepLinkKind; id: string };
}

/**
 * Response-type discriminant + typed payload (amendment A20, PI2-D47,
 * design_system_spec.md §2.9.10). 'document'/'instructional' carry no
 * extra fields — their canvas needs nothing beyond `responseText`/
 * `deepLinks` (§2.9.9(a)/(b)). `opportunity-status`/`compliance-
 * attainment` each carry ONE string id/key the canvas resolves LIVE
 * against already-shipped datasets at render time — never a duplicate of
 * the resolved fields (PI2-D28): the response canvas, not this file,
 * looks up cost/value/horizon/gate/status or name/bodies/met/target.
 */
export type ChatResponseType = 'document' | 'instructional' | 'opportunity-status' | 'compliance-attainment';

/** 'document' — full agent-style response + a REQUIRED non-empty Artifacts
 * list (this entry's own `deepLinks`, PI2-D47(a)). */
export interface ChatEntryDocumentResponse {
  responseType: 'document';
}

/** 'instructional' — policy/how-to answer; `deepLinks` optional (PI2-D47(b)). */
export interface ChatEntryInstructionalResponse {
  responseType: 'instructional';
}

/** 'opportunity-status' — register-backed status (PI2-D47(c)). */
export interface ChatEntryOpportunityStatusResponse {
  responseType: 'opportunity-status';
  /** `PlanOpportunity.n` (engine/plan.ts) — the SAME id `data/studio.ts`'s
   * `OPPS`/`DETAIL` (keyed by play name) and the relocated register
   * (§2.9.11) key on. Must resolve against a real `OPPS[].n` value. */
  opportunityId: string;
}

/** 'compliance-attainment' — OCC/NCUA-framed compliance-attainment status
 * (PI2-D47(d)). */
export interface ChatEntryComplianceAttainmentResponse {
  responseType: 'compliance-attainment';
  /** `OnsideDomain.key` (`data/onside.ts` `DOMAINS`). Must resolve
   * against a real `DOMAINS[].key` value. */
  domainKey: string;
}

export type ChatEntryResponse =
  | ChatEntryDocumentResponse
  | ChatEntryInstructionalResponse
  | ChatEntryOpportunityStatusResponse
  | ChatEntryComplianceAttainmentResponse;

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
    {
      id: 'onside-aigov-attainment',
      question: "What's our compliance-attainment standing in AI Governance?",
      responseText:
        'AI Governance stands at 110 of 214 applicable CRI FS AI RMF controls at the required maturity band — target 3 for the current use-case set, stepping to 4 once agentic workflows reach production. NCUA and the interagency framework are the governing authority (CRI FS AI RMF, the 230-control flagship framework, cross-checked against the NIST AI RMF catalog). R. Fischer, CRO, owns the program.',
      deepLinks: [{ label: 'Open AI Governance', request: { screen: 'onside.overview', kind: 'domain', id: 'aigov' } }],
      response: { responseType: 'compliance-attainment', domainKey: 'aigov' },
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
  inputLabel: 'Ask about an opportunity, a document, a policy, or a compliance domain',
  inputPlaceholder: "Ask about a play's cost or blockers, a governing document, or a compliance domain's standing…",
  greeting:
    "I can answer questions about the opportunity register — cost, value, and what's blocking each play — plus the documents and compliance domains behind those blockers. Try one of the questions below, or type your own.",
  defaultNoMatchMessage:
    "I don't have a scripted answer for that yet. Try one of the questions below, or open Investment Design to browse the full opportunity register.",
  entries: [
    {
      id: 'studio-blocker-underwriting-assist',
      question: "What's blocking Underwriting assist?",
      responseText:
        "Underwriting assist is sequence-gated on Adverse Action, the weakest of its three governance gates at 55% against the 80% bar — Fair Lending sits at 68%, Model Risk at 70%. It also depends on two other plays landing first: Unified data foundation and AI adverse-action letter drafting. At $150,000 to build against $400,000 in annual value, it's the largest single opportunity in the portfolio, and Adverse Action is what's holding it back.",
      deepLinks: [{ label: 'Open Underwriting assist in Investment Design', request: { screen: 'studio.investment-design', kind: 'play', id: 'Underwriting assist' } }],
      response: { responseType: 'opportunity-status', opportunityId: 'Underwriting assist' },
    },
    {
      id: 'studio-blocker-txn-monitoring-tuning',
      question: "What's blocking Transaction-monitoring tuning assist?",
      responseText:
        'Transaction-monitoring tuning assist is gated on Model Risk, at 70% against the 80% bar — BSA/AML is already ahead at 74%. It also waits on Unified data foundation, the shared data layer every strategic play draws on. Once both clear, it is a $120,000 build against $330,000 a year.',
      deepLinks: [{ label: 'Open Transaction-monitoring tuning assist', request: { screen: 'studio.investment-design', kind: 'play', id: 'Transaction-monitoring tuning assist' } }],
      response: { responseType: 'opportunity-status', opportunityId: 'Transaction-monitoring tuning assist' },
    },
    {
      id: 'studio-blocker-fraud-model-refresh',
      question: "What's blocking Fraud model refresh?",
      responseText:
        'Fraud model refresh has one gate: Model Risk, at 70% against the 80% bar. It is also sequenced behind Unified data foundation. At $90,000 to build against $260,000 a year, it clears as soon as Model Risk closes.',
      deepLinks: [{ label: 'Open Fraud model refresh', request: { screen: 'studio.investment-design', kind: 'play', id: 'Fraud model refresh' } }],
      response: { responseType: 'opportunity-status', opportunityId: 'Fraud model refresh' },
    },
    {
      id: 'studio-blocker-deposit-pricing',
      question: "What's blocking Deposit pricing optimization?",
      responseText:
        'Deposit pricing optimization is gated the same way as the other Model Risk-dependent plays: 70% against the 80% bar, and sequenced behind Unified data foundation. Build is $80,000 against $240,000 a year once it clears.',
      deepLinks: [{ label: 'Open Deposit pricing optimization', request: { screen: 'studio.investment-design', kind: 'play', id: 'Deposit pricing optimization' } }],
      response: { responseType: 'opportunity-status', opportunityId: 'Deposit pricing optimization' },
    },
    {
      id: 'studio-unified-data-foundation',
      question: 'Why does everything wait on Unified data foundation?',
      responseText:
        'Unified data foundation is the one dependency the strategic plays share: the governed warehouse, conformed core, and feature layer everything else draws on. Six plays wait on it — Transaction-monitoring tuning assist, Fraud model refresh, Marketing personalization, Deposit pricing optimization, Underwriting assist, and Complaint analytics. It is a $250,000 build gated on InfoSec, already at 90% against the 80% bar.',
      deepLinks: [{ label: 'Open Unified data foundation', request: { screen: 'studio.investment-design', kind: 'play', id: 'Unified data foundation' } }],
      response: { responseType: 'opportunity-status', opportunityId: 'Unified data foundation' },
    },
    {
      id: 'studio-biggest-opportunity',
      question: "What's the biggest opportunity in the portfolio?",
      responseText:
        'By annual value, Underwriting assist tops the catalog at $400,000 a year against a $150,000 build — the single largest opportunity, gated on Adverse Action governance maturity before it enters the funded portfolio.',
      deepLinks: [{ label: 'Open Underwriting assist in Investment Design', request: { screen: 'studio.investment-design', kind: 'play', id: 'Underwriting assist' } }],
      response: { responseType: 'opportunity-status', opportunityId: 'Underwriting assist' },
    },
    {
      id: 'studio-doc-adverse-action-redline',
      question: 'What document closes the Adverse Action gate blocking Underwriting assist?',
      responseText:
        "Underwriting assist's weakest gate is Adverse Action, at 55% against the 80% bar. The fix is already drafted: the Adverse-Action Procedure's §4 redline derives reason codes from the model's documented feature attributions, mapped through a tested attribution-to-code matrix and verified quarterly against a sampled file review. It's moving through Case CASE-2026-003, owned by M. Okafor.",
      deepLinks: [
        { label: 'Open the Adverse-Action Procedure redline', request: { screen: 'onside.documents', kind: 'document', id: 'aa-procedure' } },
        { label: 'See Case CASE-2026-003', request: { screen: 'cases', kind: 'case', id: 'CASE-2026-003' } },
      ],
      response: { responseType: 'document' },
    },
    {
      id: 'studio-howto-unblock-play',
      question: 'How does a play get unblocked?',
      responseText:
        "Two things hold a play back. First, a governance gate below the 80% control-maturity bar — a play's weakest listed gate has to clear 80 before the play is ready. Second, any dependency play in its own list that hasn't landed yet. Unified data foundation is the one dependency six plays share — Transaction-monitoring tuning assist, Fraud model refresh, Marketing personalization, Deposit pricing optimization, Underwriting assist, and Complaint analytics — so it lands first in the funded sequence almost by construction.",
      deepLinks: [{ label: 'Open Unified data foundation', request: { screen: 'studio.investment-design', kind: 'play', id: 'Unified data foundation' } }],
      response: { responseType: 'instructional' },
    },
    {
      id: 'studio-fairlend-attainment',
      question: 'Is Fair Lending compliance ready to support Underwriting assist?',
      responseText:
        "Fair Lending governs two of Underwriting assist's three gates — Fair Lending itself, at 68% control maturity, and Adverse Action, its weakest gate at 55% — both against the 80% bar the play needs to clear. On the compliance side, the same domain (Fair Lending · ECOA / Reg B, CFPB and NCUA authority, Circular 2026-C1's adverse-action specificity) stands at 21 of 29 applicable obligations met — two short of the Managed target, which was raised to 4 because Underwriting assist and adverse-action drafting trigger disparate-impact testing and model-derived reason-code obligations.",
      deepLinks: [{ label: 'Open Fair Lending in OnSide', request: { screen: 'onside.overview', kind: 'domain', id: 'fairlend' } }],
      response: { responseType: 'compliance-attainment', domainKey: 'fairlend' },
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
