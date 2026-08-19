/**
 * SettingsAbout — parity_ia_addendum.md §1.4 "Settings" rows 2-3
 * ("Release notes / changelog" + "About"), dispatched as Batch 6. Not one
 * of the 7 script screens (design_system_spec.md §9: "Settings toggles /
 * About (1032–1140) — Switch (P8), Label (P3) — no new composite; not one
 * of the 7 screens, minimal coverage per scope").
 *
 * Base engine anchors ported: Release notes card leapfi-platform.html
 * 1056–1130 (`<ul class="changelog">`, 71 entries, v1.001–v1.071); About
 * card 1132–1137.
 *
 * Region map: Topbar (shell) → page title → Release notes card (Label (P3)
 * blocks, one per changelog entry) → About card (Label (P3) rows + Tag
 * (`count`) pills), matching parity_ia_addendum.md §1.4's exact component
 * budget for this screen.
 *
 * VERBATIM CHANGELOG PORT: parity_ia_addendum.md §1.4 directs this file to
 * carry "a new small literal array — the changelog is copy, not business
 * data; port verbatim as a plain string-list constant local to this screen
 * (no shared data module needed)." `CHANGELOG` below is exactly that: all
 * 71 entries from the source `<ul class="changelog">` (1059–1129), each
 * reduced from source HTML (`<b>`/`<i>`/`<br>` inline markup) to plain text
 * — Label (P3) takes only a `text: string` prop with no rich-markup
 * rendering path, so a literal HTML-to-plain-text reduction is the only
 * way to route this copy through the primitive the spec assigns it to
 * ("Label (P3) blocks, one per entry"), not a content cut. No entry's
 * wording, count, or ordering was altered — this is copy, ported whole per
 * the addendum's own instruction, not summarized.
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: identical
 * passthrough pattern already landed by every sibling screen in this
 * worktree — full `topbar: TopbarProps` bundle, `onNavigate:
 * SidebarProps['onNavigate']`, `activeId` hardcoded to `'settings.about'`
 * (intrinsic to this screen).
 *
 * AMBIGUITY RESOLVED — About-card figures are literal copy, not derived:
 * base engine anchor 1132–1137 hardcodes "v 1.071" / "3 + 3" /
 * "Demo" directly in markup (no live computation in the source either —
 * `Discovery · Studio · OnSide · (Connect, AllRailz upcoming · Vantage
 * targeted v3)` names 3 shipped + 3 upcoming modules as prose, "3 + 3" is
 * typed, not counted). Porting these as literal strings is therefore full
 * fidelity to the source, not a shortcut around deriving them from live
 * data this worktree doesn't have a module for.
 *
 * Accessibility: each changelog entry is a labelled group (`role="group"
 * aria-labelledby`) so a screen-reader user gets "vX.XXX · <date>" as the
 * entry's accessible name before its body text, mirroring the visual
 * eyebrow/body pairing. About-card rows pair a Label (eyebrow, the field
 * name) with a Label (body-secondary, the value) plus a trailing Tag
 * (`count`) — Tag's own primitive contract already guarantees the pill is
 * never the sole carrier of meaning (the adjacent Label states the same
 * fact in words). Card and page headings are real heading elements
 * (`h1`/`h2`), and `main` carries `aria-labelledby` pointing at the page
 * `h1`, matching every sibling screen's landmark pattern.
 *
 * No screen-level primary CTA: design_system_spec.md §9 and
 * parity_ia_addendum.md §4 both classify Settings as "a settings/reference
 * panel" with the explicit stated-reason exemption under Core Principle 2
 * ("one primary [CTA], or a stated reason none applies").
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner installed, matching
 * every sibling screen already landed here. Verified via `npx tsc --noEmit`
 * (strict mode, `exactOptionalPropertyTypes`) against the whole `src/`
 * tree to confirm this file type-checks against the real `Topbar`/
 * `Sidebar`/`Label`/`Tag` shapes it consumes.
 */
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { Label } from '../components/primitives/Label';
import { Tag } from '../components/primitives/Tag';

interface ChangelogEntry {
  version: string;
  date: string;
  summary: string;
}

// Verbatim port, leapfi-platform.html 1059–1129 (`<ul class="changelog">`,
// 71 entries). See file header "VERBATIM CHANGELOG PORT."
const CHANGELOG: ChangelogEntry[] = [
  { version: "v 1.071", date: "Aug 18, 2026", summary: "The demo now opens with every case plainly undecided, and the Cases tab carries the count. Two things were wrong at the opening frame. The nav badge counted cases waiting on whoever was signed in, and the demo opens as the CRO while all eight cases sit with the analyst, so the badge rendered blank on a fresh load; it was also only written inside the OnSide router, so it did not exist at all until you navigated in. It now counts open cases, reads the same for every persona, and is drawn wherever the notification bell is drawn, which covers boot, sign-in, every navigation, and every case action. Separately, all eight cases read With the analyst in the Stage column, which only repeated the With column and never said the thing that matters. A case nobody has acted on now reads Not decided yet in neutral grey rather than amber, because nothing is at risk, it simply has not been decided. A case that has come back to the analyst still reads Back with the analyst, since that is a different fact. Both states are seeded, so every reset returns to eight open and none decided." },
  { version: "v 1.070", date: "Aug 18, 2026", summary: "Home now reads in the order you pick. Customize this page used to decide only what showed; the sequence was fixed in the code, so an executive could remove a panel but never move one. Each role now carries its own order: turning a panel on puts it at the end of your page, turning it off takes it out, and the real DOM is reordered to match. Every active chip shows its position number, so the mechanic is visible on screen rather than something a presenter has to explain. Two shortcuts sit at the end of the bar: Clear all, so you can empty the page and then pick the panels back in the order you want to read them, and Reset layout, which restores the shipped order. Both the order and the visibility are per role and both are in the demo reset, so a walkthrough always opens on the same page." },
  { version: "v 1.069", date: "Aug 18, 2026", summary: "Strategic signal rebuilt as a six-across dashboard strip: 945px down to about 300px, roughly a third of what it was. Each tile carries the scope, the instrument, where it sits in the pipeline, and a new line that answers the question the card never answered: does this land on something we already have in force. That count is derived from live state, not typed, so it moves as the demo moves. An obligation that is met today counts as needing an update, because the rule would move underneath a control that currently passes. An obligation that is already a gap is not counted again, because it is already in your queue. A document with language already drafted reads as already staged, which is the point of the product. A domain register is a route, not a control, so it is never counted. The per-item paragraph and the live chip row are not deleted, they moved one click into a panel that also states, in words, which controls would need updating and which were drafted ahead of the rule." },
  { version: "v 1.068", date: "Aug 18, 2026", summary: "Risk posture at half the height: 312px down to 170px, with every domain still on one row. The eight semicircular gauges are now linear meters. Each tile reads name and score on one line, then a meter with a tick at your target, then one line of target 4 \u00b7 2 to close. Eight bars on aligned tracks are far easier to compare at a glance than eight separate arcs, and the tile costs 74px instead of 214px. The below-target chip is retired because the footer already carries the judgment in colour, so posture is stated once rather than twice. One accuracy fix rides along: the old gauge filled from zero, but the maturity scale starts at 1, so every score was drawn longer than it is. The meter runs 1 to 5, which is why AI Governance at 2.6 now looks as far back as it actually is." },
  { version: "v 1.067", date: "Aug 17, 2026", summary: "Investments and Return are one card, Investment and return, keeping both links: Work the levers goes to Investment Design, Platform ROI opens the report. The four numbers now say what they are in a CFO\u2019s language rather than shorthand: return on investment against the hurdle, one-time build cost against the approved envelope, recurring annual value, and payback in months. Compliance capacity freed is now its own highlighted block with the explanation it never had: what the hours are, that it is roughly 3.5 full-time equivalents of loaded salary returned to other work rather than a headcount cut, that it falls to the efficiency ratio, and that it lands whether or not a single funded play ships. Adoption and efficacy now opens at 70%. Brand: the fallback font chain, the metadata grey, and the em dashes are corrected against the brand kit." },
  { version: "v 1.066", date: "Aug 16, 2026", summary: "Model Risk and Third-Party Risk are built out in full. All 57 documents behind the Model Risk register and all 74 behind Third-Party Risk are in the universe and open: validation reports for each tiered model, conceptual soundness documentation, quarterly outcomes and monitoring packets, vendor model evidence, change logs, standards, committee minutes, board summaries, and training attestations on the model side; due diligence and SOC 2 packets for all twelve critical vendors, financial condition and resiliency assessments, executed contract records, questionnaires, monitoring attestations, and offboarding records on the vendor side. The corpus is written against the open gaps rather than around them, so the documents that would close an item you still show as open are absent and say why. Scope to a domain and the view states whether you are seeing all of it or a sample. A type filter joins the search and status filters, and the table reports how many rows it is showing." },
  { version: "v 1.065", date: "Aug 16, 2026", summary: "The gap statement now reads required vs current, and it sits on two lines: what the rule requires, then what the institution does today, each on its own row with its own label. Reading a gap no longer means finding the break in a paragraph. Every card carrying proposed language now shows the before and the after, labelled, whether the language is still proposed or already adopted: previously an adopted change showed only the new text, so the thing it replaced disappeared from view at exactly the moment someone would ask what changed. Obligations, documents, cases, and the board report all render from the same two helpers, so they cannot drift apart again." },
  { version: "v 1.064", date: "Aug 16, 2026", summary: "One level of back, in the top bar. Any click that moves you to a different view leaves a Back to chip naming the place you came from, and it returns you there at the scroll position you left. It is one step, never a stack, so it always does exactly what it says. This closes the one drill-down with no way home: the register links on the Strategic signal took you into a domain and left you to find your way back. Side panels are unchanged: they still close to wherever you opened them from." },
  { version: "v 1.063", date: "Aug 16, 2026", summary: "OnSide and Studio swap places in the navigation. OnSide now leads the module list, which matches how the platform is sold and how a walkthrough runs: the governance record first, then what the institution decides to build on top of it." },
  { version: "v 1.062", date: "Aug 16, 2026", summary: "The home page is simpler and leads with what is coming. Three numbers across the top instead of six: domains at or above target, gaps to those targets, and what is high priority. Expected return, annual value, and committed spend come off the top and stay where they belong, in the Return and Investments panels below. Risk posture runs across the full width underneath, all eight domains in one row with the gauge and the gap on each. Under it, Strategic signal: the instruments that have just been proposed, before any of them is law, with what each one would mean for this institution and, under \u201cwould touch\u201d, the specific obligations and documents it lands on. Every one is a link, so a control ID opens its register row and a policy opens the document." },
  { version: "v 1.061", date: "Aug 16, 2026", summary: "The notification count now follows the person signed in. Switching user left the previous person\u2019s badge in the corner until something else redrew it, so a case routed to the CRO looked unread by nobody. The bell redraws on sign-in and on every navigation." },
  { version: "v 1.060", date: "Aug 16, 2026", summary: "The approval path now follows the document, not one fixed rule. Settings carries an approval matrix: board-level policy takes a conditional approval from the CRO and a committee vote before it is adopted, executive policy and procedures the CRO can adopt directly. Every case reads the matrix when it opens, and turning the committee requirement off for a tier changes what the CRO sees. On a case the CRO can approve outright, approve subject to a named condition, or route it to counsel: Dana Reyes, General Counsel, joins the demo and either clears the language or returns it to the analyst with notes, with the opinion on file either way. A conditional approval that names the committee puts the change into the Gap Closure Board Approval Report, a new report written for the board book: what changed, why, the exact language for the vote, and the motion. After the vote the CRO attaches the minutes to the case and gives final approval, and only then does the language go into force and the obligation close. Two levels, every time, with the evidence for both." },
  { version: "v 1.059", date: "Aug 16, 2026", summary: "Proposed language now runs through a Case. OnSide opens one the moment it detects a change, and the case carries the whole record: what triggered it, the language drafted, every edit, every routing, and every approval, each stamped with the time and the name of the person who did it. That record is the exam answer. A fifth persona joins the demo, Priya Raman, Risk Analyst, who is the maker: she accepts OnSide\u2019s draft or edits it in her own words, with the original kept alongside, then routes it to the CRO. Rachel gets a notification in the app and an email you can open and read, and hers is the approval that adopts the change and closes the obligation behind it. Rejecting returns it to OnSide with nothing touched in the in-force document. Cases live under OnSide with a count of what is waiting on you, and the bell in the top bar shows the same by role." },
  { version: "v 1.058", date: "Aug 16, 2026", summary: "Every regulatory source now opens its own page instead of a side panel. A source is somewhere you spend time, not something you glance at and dismiss: the page carries what it covers and how it is captured, how many items landed in the last thirty days, which registers they fed, the last capture and the next sweep, and the full dated activity list with a way into the obligation or document behind each one. Sources still in a connector phase say so on the page. Digest and alerts sit above the source list and on every source page. Pick a cadence, real-time through quarterly, choose email or in-app or both, narrow to binding rules only, and see how many items that setting would carry right now. Alerts are the exception path: switch one on for a source and a change from it reaches you the moment a sweep finds it, whatever the digest cadence." },
  { version: "v 1.057", date: "Aug 16, 2026", summary: "Two fixes for demo day. Approving language now closes the gap everywhere. The priority queue read from a fixed list, so an item you had just approved kept sitting there as open. Every row now reads its state from the document it closes: approve the language and the item moves into a Closed in this session table with who approved it and when, the obligation behind it is marked met, and the domain score, the donuts, and the counts all move with it. Rejecting or routing puts it back. Reset demo lives under your avatar, or Shift + Alt + R. It restores every gap, redline, lever, filter, and conversation to the opening state without reloading the page, so the next walkthrough starts clean." },
  { version: "v 1.056", date: "Aug 16, 2026", summary: "Thesis V14 incorporated. Connect is no longer a module beside OnSide. V14 names four modules and makes Connect the native MCP and API layer of OnSide itself, so Connect now sits inside the OnSide navigation and the platform reads as four modules, not five. The Connect page leads with the burden V14 puts in the opening paragraph: technical staff whose real job is translating the policy manual into system settings, one product at a time. System classes match the five V14 names. OnSide\u2019s overview states the same problem and links straight through. Each Soon page closes on why the module compounds, Connect\u2019s being the vendor economics: one integration configures every client, which beats re-implementing policy client by client. The document universe gains the two fairness artifacts the thesis says the governance engine ships, the Fairness & Bias Impact Assessment and the Human-in-the-Loop Decision Authority Standard." },
  { version: "v 1.055", date: "Aug 16, 2026", summary: "Two demo personas retitled: Jose Ribau is Engagement Manager and Dan Scheffler is Product Manager. The titles show in the profile card, the switch-user list, and anywhere a role is named. Each persona still lands on the same homepage and permissions as before." },
  { version: "v 1.054", date: "Aug 16, 2026", summary: "The page now tells browsers not to hold a cached copy. The demo keeps one filename on purpose so the embed never breaks, which meant a browser that had already loaded it would keep showing an older build after a publish. Each load now revalidates against the published file." },
  { version: "v 1.053", date: "Aug 16, 2026", summary: "Two Studio pages renamed. Design studio is now Investment Design, which says what the levers actually decide. Three-year roadmap is now Roadmaps. Page headings, breadcrumbs, the CEO queue, and every link that named either page follow the new labels." },
  { version: "v 1.052", date: "Aug 16, 2026", summary: "The How it works diagram comes off the Connect, AllRailz, and Vantage pages. Four boxes, eight labels, and a policy spine were carrying more detail than a page about something not yet built needs. Each page now states the same idea as three numbered steps on one line under the opening paragraph, with the point of it underneath. What it delivers and What changes are untouched. All three pages stay identical in structure." },
  { version: "v 1.051", date: "Aug 16, 2026", summary: "Numbers line up across every card row. Where one heading wrapped to two lines and its neighbours did not, the number underneath sat lower than the rest. Each row now measures its own headings, holds them all to the tallest, and drops any footnote line to a shared bottom edge, so the figures read straight across on every screen and at every window width." },
  { version: "v 1.050", date: "Aug 16, 2026", summary: "Ten more documents in the sample universe, chosen to show the kinds of record an examiner actually asks for: the AI system inventory, AI Governance Committee minutes, AI acceptable use training attestations, the business continuity and disaster recovery plan, the annual penetration test and remediation tracker, SAR quality assurance, the OFAC screening independent test, the Regulation E error resolution procedure (with a drafted redline on the error clock for automated channels), the HMDA data integrity review, and the CBLR calculation worksheet. The capital narrative, which was already in the library, is now listed too. The sample runs 25 documents and covers all eight domains, so the domain scope filter no longer comes back empty on Capital or thin on AI Governance." },
  { version: "v 1.049", date: "Aug 16, 2026", summary: "Connect, AllRailz, and Vantage rebuilt from the thesis on one shared page system, so all three carry the same graphics at the same sizes: a hero, a How it works flow diagram showing the module reading live policy from OnSide before it acts, a four-tile What it delivers row, and a By hand today versus With the module comparison. All three stay marked Soon and not part of this demo build. Every figure comes from the thesis: Connect\u2019s six system classes and same-day propagation, AllRailz\u2019s 11+ agents across 12 rails on three cores, Vantage\u2019s five review types across 87 vendors." },
  { version: "v 1.048", date: "Aug 16, 2026", summary: "Every source in the regulatory feed now carries live activity. All fifteen open with dated captures, what each one touched, and a link into the register or document behind it, instead of ten of them dead-ending on a placeholder. Sources still in a connector phase show their items in preview and say so, with the phase on the card, so the demo stays rich without overclaiming. Time filters cover 14 days, 30 days, and all activity." },
  { version: "v 1.047", date: "Aug 16, 2026", summary: "Accessibility and boardroom readability, the last of the five review passes. Every interactive element is reachable by keyboard and answers to Enter or Space, with a visible cyan focus ring. Side panels are proper dialogs: they take focus on open, Escape closes, and focus returns to whatever opened them. Arrow keys drive the board deck. Lever explanations answer to tap as well as hover, so they work on an iPad, and each carries its text as a label for screen readers. Gauges, donuts, bar rows, and the value sparkline describe themselves. Text bottoms out at 11px, deck dots are large enough to hit, and everything respects a reduced-motion preference." },
  { version: "v 1.046", date: "Aug 16, 2026", summary: "Visual system. The type ramp collapses from 26 sizes to eight steps with an 11px floor, so hierarchy reads instead of drifting. KPI numbers are white, with colour reserved for values that are genuinely negative, and the off-kit green is gone in favour of brand teal. Amber now means one thing, below target or at risk: human-review, sequence-gated, and update-proposed states moved to neutral and cyan. Posture uses one encoding everywhere, a neutral gauge with a target tick and the judgment carried by the status chip, so the deck no longer shows eight alarm-coloured dials under the words \u201cnever a failing grade.\u201d Home posture tiles use short domain names on a full row, the register states its own length, deck slides fill their frame with larger type and a single-row process flow, value segments are labelled in place, and emoji are replaced by one monochrome glyph set." },
  { version: "v 1.045", date: "Aug 15, 2026", summary: "Chat guardrails. Unrecognized input no longer hijacks the conversation into the scoping wizard: greetings and short messages get a plain statement of what the box can do, and unmatched longer input offers scoping as a choice, not a default. The wizard carries a visible Cancel at every step. Catalog pricing and policy answers now require two distinctive matching words before answering, so a single stray word cannot produce a confident wrong answer. Chips debounce, so a double-click cannot answer two questions. The assistant speaks under one name throughout." },
  { version: "v 1.044", date: "Aug 15, 2026", summary: "Credibility pass: every checkable number now derives from the model or states its definition. The document universe headline equals the sum of the domains (AI Governance carries the CRI crosswalk set), category tiles re-tuned to match, and evidence counts reconcile. The sources claim is 15 sources on three layers everywhere. The change-events KPI is computed from the feed. Model Risk and Third-Party report donuts label Below maturity and carry the sentence that ties the donut, the target math, and the worked queue together. The standing view counts workstreams, the program queue counts the registers\u2019 actual review items, above-target domains explain their open items, and deck slide 2 claims only what the record shows." },
  { version: "v 1.043", date: "Aug 15, 2026", summary: "Hostile-review fixes, round one of five. OnSide no longer renders full-bleed and clipped (legacy embed CSS removed) and its footer reads as a customer demo. The Back button in obligation-to-document chains works (quote-escaping bug). One demo date everywhere. Secondary text lightened for projector-safe contrast. Demo personas carry NorthWinds emails. Settings toggles toggle, the two dead feed drill-downs open their instruments, lifecycle and in-force rows are fully clickable, and the gaps row for messaging disclosure opens the document that actually carries the drafted language. Deck slide 9 matches the Studio roadmap sequence, slide 10 computes its multiple, slide 11 nets the subscription to agree with the ROI report, and Prev/Next disable at the ends. Reports say Reporting, the stale add-it chat chip is gone, and an empty Send flashes the input." },
  { version: "v 1.042", date: "Aug 15, 2026", summary: "The Board Pack now opens with a 12-slide presentation for the CEO: title, the one-slide story, four risk slides (posture gauges, gaps, the regulatory environment, how change is governed), four opportunity slides (portfolio composition, economics, the Year-1 quarters, what Years 2 and 3 unlock), the money picture, and the ask. Every slide is generated live from the record, navigated with prev/next and dots, in the brand system with the chevron motif. The one-page read remains beneath as the appendix." },
  { version: "v 1.041", date: "Aug 15, 2026", summary: "Domain open items rebuilt as single cards. Each item (the Incident Response Plan escalation and its peers) is one card in one type treatment: the item on top, the document, citation, and proposed-language status on a single meta line beneath. The whole card is clickable and opens the document with its redline. Items without evidence route to the gap queue." },
  { version: "v 1.040", date: "Aug 15, 2026", summary: "Every report now opens with a signature graphic computed live from the model. Board Pack shows where the annual value comes from and the budget committed. The Regulatory Change Briefing opens with its status distribution across the seven instruments. Risk Posture charts the gaps by domain. Compliance draws every control family against the 80% gate. Model Risk and Third-Party open with register donuts plus the inventory splits and SOC 2 coverage. IT & InfoSec shows program coverage and connector health. Investment & ROI leads with the money picture and the Year-1 value ramp. All in the brand palette, amber and red reserved for what is genuinely open." },
  { version: "v 1.039", date: "Aug 15, 2026", summary: "Reporting promoted to its own tab, directly under Home and above the Modules section. It is the platform\u2019s cross-cutting output layer, drawing on both the OnSide record and the Studio dials, so it sits with Home rather than inside a module. OnSide\u2019s nav slims to the governance record. Every old route redirects: OnSide reporting links, the home quick action, report generation, and the panel return-point all land on and return from the new tab." },
  { version: "v 1.038", date: "Aug 15, 2026", summary: "Closing a side panel now returns you to where you started. Panels that navigate before opening (play details land on Design studio, reports land on Reporting) remember the page and scroll position you came from and restore both on close. Deep links inside a panel still take you where they say, and chained panels return to the original page, not an intermediate one." },
  { version: "v 1.037", date: "Aug 15, 2026", summary: "Design studio: removed the intro paragraphs above the levers. The card now opens with the live stance readout and goes straight to the levers, with the lever explanations living entirely in the hover tips." },
  { version: "v 1.036", date: "Aug 15, 2026", summary: "The ROI guidance now explains the diminishing-returns math instead of contradicting it. Plays fund best-first, so a larger budget reaches deeper into the register and the blended return falls even as total value rises. When the blend is below the bar, the note shows the marginal return of the last play funded and points at the moves that actually help: trim to the best plays, raise adoption, or lower the bar. The Target ROI tooltip carries the same explanation." },
  { version: "v 1.035", date: "Aug 15, 2026", summary: "Design studio levers gained real granularity. Investment horizon is a continuous dial: every notch shifts the weighting between fastest-payback and foundational-first sequencing instead of snapping between three modes. Risk appetite now shows the exact unlock gate its position produces (each notch moves the gate). Budget moves in $5k steps and adoption in single points. Ambition stays a five-stop lever on purpose: it maps to the five maturity bands the domain targets are judged against." },
  { version: "v 1.034", date: "Aug 15, 2026", summary: "The target-lever rationale is live. At the approved target it shows the board-approved appetite statement. Move the slider and it becomes a what-if: the new bar\u2019s obligation math, what would be open against it today, and the approved statement it departs from, with one-click paths to reset to the approved target or adopt the new one (stamped with approver, date, and a route to the Board Risk Committee)." },
  { version: "v 1.033", date: "Aug 15, 2026", summary: "The redline approval workflow is live. Approve & adopt bumps the document version, flips its status to Current, seals the new language as in force, archives the prior text, and writes the audit entry with approver and date. Route to consultancy queues the draft with the engagement team while approval authority stays with the owner. Reject returns it to OnSide to redraft, with a restore path. State carries across the document viewer and the obligation drawer, and every action lands in the document\u2019s activity log." },
  { version: "v 1.032", date: "Aug 15, 2026", summary: "Home is clickable everywhere: panel titles (Risk posture, Investments, Return, Your queue, Legislation & rulemaking) open their sections, and every list row responds to a click anywhere on it, name included, with the name lighting up on hover. The Open and Review labels stay as the visual cue." },
  { version: "v 1.031", date: "Aug 15, 2026", summary: "Removed the always-on compliance loop explainer from the bottom of the OnSide overview. The overview ends on the objectives driving scope." },
  { version: "v 1.030", date: "Aug 14, 2026", summary: "Ask the platform and the Opportunity register merged into one page. The conversation sits on top, the pipeline strip and the register it feeds sit directly below, so a scoped idea lands in view the moment it is added. The separate register nav item is gone, and every old register link routes to the merged page and scrolls to the register." },
  { version: "v 1.029", date: "Aug 14, 2026", summary: "Design studio: fixed the garbled calibration line under Your levers and rewrote the intro. The panel now opens with the two questions the levers answer, and grounds them in the onboarding questionnaire result: NorthWinds starts at Developing, and ambition reaches from there." },
  { version: "v 1.028", date: "Aug 14, 2026", summary: "RACI matrix: the Informed badge is brighter so the I reads clearly at a glance, while staying visually quieter than Responsible, Accountable, and Consulted." },
  { version: "v 1.027", date: "Aug 14, 2026", summary: "Opportunity register rows are fully interactive: every opportunity highlights on hover and opens its full detail drawer on click, anywhere on the row. Catalog entries without a drafted deep-dive open with a standard scoping envelope instead of doing nothing." },
  { version: "v 1.026", date: "Aug 14, 2026", summary: "Vantage nav badge changed from V3 to Soon, matching Connect and AllRailz." },
  { version: "v 1.025", date: "Aug 14, 2026", summary: "All reporting collapsed to one screen. The Reporting nav item opens a single page of eight standing reports spanning every audience: Board Pack, Regulatory Change Briefing (the standing board view now lives inside it, updates still logged in place), Risk Posture & Targets with per-domain gauges, Compliance Open Items, Model Risk Report with the validation calendar, Third-Party & Vendor Risk with SOC 2 and exit-plan status, IT & Information Security with the IRP priority and connector health, and Investment & ROI, which now carries the funded portfolio behind the number. Each card names its audience, every figure links back to the register it came from, and all eight generate from the same live data model." },
  { version: "v 1.024", date: "Aug 14, 2026", summary: "Rachel\u2019s dashboard review, worked through end to end. Home: every KPI tile now opens the work behind it, the risk-posture tiles carry gauges showing score against the target tick, and a Customize control lets each executive choose which panels their page shows. Scoring transparency: every domain opens with a gauge and a plain-language \u201chow this score is calculated\u201d walk-through of applicable obligations, the target math, and the met count. OnSide: a scope filter on Overview, Open gaps, and Documents so each officer sees what they oversee; all overview boxes clickable; the gaps view reconciles its full count by domain; documents get search and status filters. Regulatory feed: every source row opens its dated activity, and the lifecycle leads with a Newly Proposed section (the Fed/FDIC Reg O NPRM and peers) with area filters. Studio: intake distinguishes internal work that feeds financial reporting (GL / SOX named, moderate risk) and splits sensitive-financial from PII; new use cases land in the register through the same four questions (the direct-entry form is retired); risk tolerance is now risk appetite with fuller definitions and a link to calibrate from the adoption questionnaire; play economics state what the build number includes. Board reporting defines Tracking vs Open, open items carry target compliance dates, and updates can be logged in place. Obligations accept attached evidence pending reviewer sign-off, and provenance reads in plain language." },
  { version: "v 1.023", date: "Aug 14, 2026", summary: "Three-year roadmap rebuilt at full width: a KPI band (investment, annual value, ROI against hurdle, payback), then Year 1 as four tall quarter columns with per-quarter spend, larger play cards, and a running value-online marker, a visual link where the data foundation unlocks Year 2, and full-width Year 2 and Year 3 lanes showing every queued play with what it waits on. Everything still recomputes live from the Design studio levers, and every card opens its play." },
  { version: "v 1.022", date: "Aug 14, 2026", summary: "The full RACI policy ownership matrix returns to OnSide \u00b7 RACI & owners: every governance document mapped to Responsible, Accountable, Consulted, and Informed across the eight named roles, grouped by domain, with each document opening its viewer and each domain linking to its gaps and levers. The domain-owner table stays alongside it." },
  { version: "v 1.021", date: "Aug 14, 2026", summary: "Every Partial and Gap obligation now opens one view with the whole story, from anywhere on the row: the difference (what the obligation requires vs what exists today) and the remediation (the action, with any drafted language rendered inline as a redline with approve and route actions), shown whether the item is Approved or still in the HITL queue." },
  { version: "v 1.020", date: "Aug 14, 2026", summary: "Domains \u00b7 gaps & levers now links everything. Every open item in every domain links its evidence document, pin-cites open the instrument, and wherever OnSide has drafted proposed language an amber chip opens the redline directly, in both the accordion gap lists and the deep obligation registers. Added the Member Messaging Disclosure Standard draft with its proposed disclosure language." },
  { version: "v 1.019", date: "Aug 14, 2026", summary: "Ask page reworked. Headline now reads One conversation with your platform. The greeting bubble is gone, the highlighted input sits directly under the headline with the prompt chips beneath it, and the conversation thread only appears once there is one." },
  { version: "v 1.018", date: "Aug 14, 2026", summary: "OnSide navigation nested. The menu collapses to six rows: Overview, Domains, then Reporting, Documents, Regulatory feed, and Ownership & setup as expandable groups. One group open at a time, and deep links auto-open the group that holds the destination." },
  { version: "v 1.017", date: "Aug 14, 2026", summary: "Lever explanations now appear instantly on hover as styled pop-outs instead of relying on the browser\u2019s native tooltip, which only showed after a long dwell." },
  { version: "v 1.016", date: "Aug 14, 2026", summary: "Studio page headers removed entirely. Orientation moved into the top bar as a breadcrumb (Studio \u00b7 Ask the platform) that updates as you move, in Studio and OnSide both. Content now starts at the top of every page." },
  { version: "v 1.015", date: "Aug 14, 2026", summary: "Page headers simplified. Studio drops the repeated hero and status chips for a slim header that changes with the page: What do you want to do? \u00b7 Design the portfolio \u00b7 The opportunity register \u00b7 The three-year plan. OnSide\u2019s header trimmed to one line." },
  { version: "v 1.014", date: "Aug 14, 2026", summary: "Discovery folded into Studio: the opportunity register, pipeline, and intake form now live on a Studio sub page, and Discovery reads as the engine that fills the register rather than a place in the nav. Home rebuilt as a single executive dashboard: risk posture by domain against the institution\u2019s own targets, the funded portfolio with budget committed, and expected return against the hurdle, identical for every executive, with a small role-aware queue. Every tile links to the work behind it." },
  { version: "v 1.013", date: "Aug 14, 2026", summary: "One conversation, in Studio. The ask panel is now a full chat thread serving both directions: questions answered from the catalog and the approved policy record, and new ideas captured through the scoping conversation, all in one box. Discovery keeps the register and intake form and points to Studio. Reports moved to OnSide, which now carries the reporting job: Board reporting plus the generated Report library. OnSide domains collapsed onto one master page where each category (BSA/AML, Model Risk, Third-Party Risk, and the rest) expands in place to show its gaps and its target lever." },
  { version: "v 1.012", date: "Aug 14, 2026", summary: "The two conversational surfaces now state their jobs. Studio: instant answers from what the platform already knows (catalog pricing and cited policy). Discovery: a scoping conversation that captures what it does not know yet. Each panel names its role, says when to use the other, and links across, and the Studio handoff message explains why a new idea goes to Discovery." },
  { version: "v 1.011", date: "Aug 14, 2026", summary: "Studio reorganized into four sub pages, matching the OnSide navigation pattern: Ask the platform, Design studio (levers, economics, and the funded portfolio together so the live recompute stays visible), Three-year roadmap, and Board-ready reports. The Knowledge Copilot moved from OnSide into the Studio ask panel: one input now routes ideas to catalog pricing and policy questions to cited policy answers, each response labeled with its source. Play and report links land on the right sub page." },
  { version: "v 1.010", date: "Aug 14, 2026", summary: "Every reference inside popout panels now links to its home elsewhere in the app. Gating controls in play drawers, board and compliance reports, roadmap lists, and chat answers jump to their OnSide domain (keeping their status color). Blocked and bumped plays open their own drawer. Domain names in scope events and intake answers open the domain view, and the sequence-gated banner links straight to the gap queue." },
  { version: "v 1.009", date: "Aug 14, 2026", summary: "Studio ask panel promoted to the hero of the page: doubled in height, cyan-washed with a chevron top edge and a soft halo, pulsing live indicator, larger input and prompt chips. It is the one glowing object on the screen. Brand kit only, with red and amber still reserved for negative status." },
  { version: "v 1.008", date: "Aug 14, 2026", summary: "Language pass across every screen. Semicolons and contrast constructions removed from product copy, decorative aphorisms cut, and structural metaphors replaced with plain terms: the play formerly named Unified data spine is now Unified data foundation, and the obligations model is described as one data model throughout. AllRailz and Vantage splash pages restructured with scannable lists. Disclaimers rewritten in plain language. No functional changes." },
  { version: "v 1.007", date: "Aug 14, 2026", summary: "Thesis v13 incorporated. New Vantage module (agentic third-party oversight, targeted v3) added to the rail. OnSide gains Board & regulatory reporting (the standing sourced view: what changed, what applies given charter and business lines, what we are doing, what remains open), a Knowledge Copilot preview answering from approved policy only with citations and audit logging, the five-step onboarding walkthrough with the three immediate improvements, and the three-layer source model (Financial \u00b7 Systemic \u00b7 Regional, obligations stack) including OFAC, SEC/FINRA, FHFA, Executive Orders, and municipal coverage. Overview loop restored to the canonical Monitor \u2192 Detect \u2192 Propose \u2192 Version \u2192 Enforce \u2192 Report. Discovery ingestion now reflects SharePoint/GRC connectors alongside upload. Studio library extended with regulator-facing remediation plays." },
  { version: "v 1.006", date: "Aug 14, 2026", summary: "Everything referenceable is now clickable. Full document viewer for every referenced governance document (content, version, SHA-256 integrity, mapped obligations, activity log) with proposed redlines and approve/route/reject actions on documents with open gaps. Obligation rows open a provenance drawer: verbatim source span, resolvable pin-cite, extraction confidence, and HITL review state. Pin-cites and regulatory instruments open an instrument viewer (issuer, effective date, source connector, domains driven). Control chips in Studio and Discovery link to their OnSide domain; gaps, feed items, owners, and KPI tiles all deep-link." },
  { version: "v 1.005", date: "Aug 14, 2026", summary: "Regulatory expansion overhaul. OnSide rebuilt natively as the system of governance record for every category a bank monitors: obligations-based model across 8 domains on one data model, five-point maturity scale with institution-set targets per domain (posture judged against your own bar, never a perfect score), use-case-driven applicability with determination provenance, CRI-depth obligation registers for Model Risk (2026-13) and Third-Party Risk (2023 Interagency Guidance), 517-document monitored universe, source-connector matrix (eCFR, Federal Register, agency guidance, states, Congress), HITL review status throughout. AI-specific language retired platform-wide; CRI FS AI RMF stays the flagship framework inside the AI Governance domain. Studio restructured: ask-first layout, streamlined levers with hover explanations, controls/regulations/roadmap-slot impact on every idea, three-year roadmap (Year 1 tactical, Years 2\u20133 vision), Platform ROI report." },
  { version: "v 1.004", date: "Aug 14, 2026", summary: "OnSide nav group is now collapsible: clicking the module name opens and closes the sub menu, with a caret indicator showing state." },
  { version: "v 1.003", date: "Aug 14, 2026", summary: "Navigation simplified: sub menus removed from Discovery and Studio. OnSide is the only module with a sub menu at this stage." },
  { version: "v 1.002", date: "Aug 14, 2026", summary: "OnSide module replaced with the full Regulatory Command Center (complete original build: 230-control register, document register with redlines, rulemaking lifecycle, RACI ownership, report library). Left-rail sub menus added for OnSide, Studio and Discovery so every data view is reachable from the platform navigation. Role homepage deep-links route straight to the relevant OnSide view." },
  { version: "v 1.001", date: "Aug 14, 2026", summary: "Unified platform demo: SaaS shell with left-rail modules \u00b7 role-based homepage (CEO, CRO, AI Leader, Program Manager) \u00b7 new Discovery module with advisor chat + use-case register wired into Studio \u00b7 OnSide Regulatory Command Center \u00b7 Studio portfolio designer ported intact \u00b7 Connect & AllRailz splash pages \u00b7 Active Directory profile sync (mock)." },
];

interface AboutRow {
  label: string;
  value: string;
  pill: string;
}

// Verbatim port, leapfi-platform.html 133–138 ("About" card).
const ABOUT_ROWS: AboutRow[] = [
  { label: 'Product', value: 'LeapFI Platform · all-in-one back-office infrastructure', pill: 'v 1.071' },
  {
    label: 'Modules licensed',
    value: 'Discovery · Studio · OnSide · (Connect, AllRailz upcoming · Vantage targeted v3)',
    pill: '3 + 3',
  },
  { label: 'Environment', value: 'Demo · illustrative customer data · NorthWinds Credit Union', pill: 'Demo' },
];

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
  gap: '1.75rem',
};
const HEADER_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.375rem' };
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const SUBTITLE_STYLE: CSSProperties = { margin: 0, maxWidth: '38rem', fontSize: '0.9375rem', color: 'var(--ink2)', lineHeight: 1.5 };
const CARD_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
  padding: '1.1rem 1.25rem',
  borderRadius: 'var(--radius-md, 10px)',
  border: '1px solid var(--border)',
  background: 'var(--panel)',
  boxSizing: 'border-box',
  minWidth: 0,
};
const CARD_TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)' };
const CARD_SUBTITLE_STYLE: CSSProperties = { margin: 0, fontSize: '0.8125rem', color: 'var(--ink2)', lineHeight: 1.5 };
const CHANGELOG_LIST_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  maxHeight: '32rem',
  overflowY: 'auto',
  paddingRight: '0.25rem',
};
const CHANGELOG_ENTRY_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '0.75rem 0',
  borderTop: '1px solid var(--border)',
};
const CHANGELOG_ENTRY_FIRST_STYLE: CSSProperties = { ...CHANGELOG_ENTRY_STYLE, borderTop: 'none', paddingTop: 0 };
const CHANGELOG_SUMMARY_STYLE: CSSProperties = { margin: 0, fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.55 };
const ABOUT_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.75rem 0',
  borderTop: '1px solid var(--border)',
};
const ABOUT_ROW_FIRST_STYLE: CSSProperties = { ...ABOUT_ROW_STYLE, borderTop: 'none', paddingTop: 0 };
const ABOUT_ROW_MAIN_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 };

export interface SettingsAboutProps {
  /** Full Topbar prop bundle — same passthrough pattern as every sibling screen. */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('settings.about') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
}

export function SettingsAbout({ topbar, onNavigate, sidebarVersionLabel }: SettingsAboutProps) {
  // See `Home.tsx`'s identical note: built conditionally because this
  // project's `exactOptionalPropertyTypes` setting treats an optional prop
  // as exactly its declared type, not `T | undefined`.
  const sidebarProps: SidebarProps = {
    activeId: 'settings.about',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="settings-about" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="settings-about-main" style={MAIN_STYLE} aria-labelledby="settings-about-title">
          <div style={HEADER_STYLE}>
            <Label text="Platform" variant="eyebrow" />
            <h1 id="settings-about-title" style={TITLE_STYLE}>
              Settings · About
            </h1>
            <p style={SUBTITLE_STYLE}>Release history and platform information for NorthWinds Credit Union.</p>
          </div>

          <div style={CARD_STYLE} role="group" aria-labelledby="release-notes-heading">
            <h2 id="release-notes-heading" style={CARD_TITLE_STYLE}>
              Release notes
            </h2>
            <p style={CARD_SUBTITLE_STYLE}>Version increments +0.001 on every update; major launches step the whole number.</p>
            <div style={CHANGELOG_LIST_STYLE}>
              {CHANGELOG.map((entry, index) => {
                const entryHeadingId = `changelog-${entry.version.replace(/\s+/g, '-')}`;
                return (
                  <div key={entry.version} role="group" aria-labelledby={entryHeadingId} style={index === 0 ? CHANGELOG_ENTRY_FIRST_STYLE : CHANGELOG_ENTRY_STYLE}>
                    <span id={entryHeadingId}>
                      <Label text={`${entry.version} · ${entry.date}`} variant="eyebrow" />
                    </span>
                    <p style={CHANGELOG_SUMMARY_STYLE}>{entry.summary}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={CARD_STYLE} role="group" aria-labelledby="about-heading">
            <h2 id="about-heading" style={CARD_TITLE_STYLE}>
              About
            </h2>
            {ABOUT_ROWS.map((row, index) => (
              <div key={row.label} style={index === 0 ? ABOUT_ROW_FIRST_STYLE : ABOUT_ROW_STYLE}>
                <div style={ABOUT_ROW_MAIN_STYLE}>
                  <Label text={row.label} variant="eyebrow" />
                  <Label text={row.value} variant="body-secondary" />
                </div>
                <Tag text={row.pill} variant="count" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
