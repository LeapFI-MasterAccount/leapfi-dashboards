/**
 * BoardDeck — Screen anatomy §5.7 "Board Deck — Step 7 'The ask'"
 * (design_system_spec.md), fed by demo_script_draft.md Step 7 ("The ask")
 * and its G10/G11/G12 gap register.
 *
 * Region map (§5.7): full-viewport DeckView (C18) — pagination Button
 * (`ghost`) → DeckSlide (C19) sequence ending on the economics slide
 * (survey_map.md 2393–2448: "$4.5M/yr, $180k, 12% freed") → the
 * DeckCTASlide (C20) carrying the tagline and design-partner ask (G12).
 * Components used per spec: Topbar, DeckView (C18), DeckSlide (C19),
 * DeckCTASlide (C20), StatCard (C1, via DeckSlide's own `stats` rendering),
 * Button (`ghost` pagination — owned by DeckView; `primary` on the CTA
 * slide only).
 *
 * AMBIGUITY RESOLVED — OQ-6 / DeckCTASlide inclusion (spec §10 OQ-4: "this
 * spec keeps C20 in the vocabulary as conditional and does not resolve
 * OQ-6 — that decision belongs to the program's existing open-question
 * track, not to this component spec"): OQ-6 is unresolved at the spec
 * level, but this file's dispatch brief explicitly instructs building the
 * closing slide "per spec §DeckCTASlide with tagline exact casing 'AI
 * Impact, Hand Delivered.' and www.LeapFI.AI" — a direct, unambiguous
 * build instruction that supersedes the spec's own "not resolved here"
 * deferral for the scope of this dispatch. Building it; flagging that the
 * upstream OQ-6 ratification itself still belongs to the program's
 * open-question track, not to this file.
 *
 * AMBIGUITY RESOLVED — DeckCTASlide (C20) has no dedicated file: C20 is
 * defined as "DeckSlide + Button (`primary`, design-partner ask)" (§2.2),
 * and no `DeckCTASlide.tsx` exists in this worktree or in any sibling
 * dispatch's allowlist naming. `DeckSlide.tsx`'s own header comment
 * anticipates exactly this composition path ("Extra slide-specific
 * content (e.g. a future DeckCTASlide's primary Button)... composed below
 * the standard content. Outside this dispatch's scope to populate.") — so
 * C20 is composed here, inline, as a `kind: 'generic'` DeckSlide whose
 * `children` slot carries the single `primary` Button. This keeps "one
 * accessible heading" and "single primary action, no competing control"
 * (C20 a11y baseline) intact without inventing a new component file
 * outside this dispatch's ALLOWLIST (which names only `BoardDeck.tsx`).
 *
 * AMBIGUITY RESOLVED — no Sidebar on this screen: §5.7 Nav classification
 * states Board Deck is "not a Sidebar item; this is a flow-level
 * presentation surface, not a persistent module" (Talon system item 3).
 * Unlike every other screen anatomy in §5 (each of which opens its region
 * map with "Topbar (shell) → Sidebar → …"), §5.7's region map and its own
 * "Components used" list both omit Sidebar entirely. This screen
 * therefore renders Topbar only, not Sidebar — consistent with, not a
 * contradiction of, §5.7's Exit line ("pagination back to the last slide
 * viewed, or any Sidebar/Topbar control"): that line is boilerplate
 * describing the shell affordances screens in this system exit through in
 * general, and on this particular screen only the Topbar instance of that
 * general rule is actually rendered.
 *
 * SUPERSEDED — Topbar data ownership (amendment A11, design_system_spec.md
 * §3.0): Topbar is no longer owned by any screen module, this one included
 * — App.tsx mounts Topbar exactly once, in a persistent Shell, wrapping
 * every routed screen's content region. This screen no longer accepts or
 * renders a `topbar: TopbarProps` prop at all; the "Sidebar exemption"
 * described below is unaffected (Board Deck still renders no Sidebar column
 * — see App.tsx's own `showSidebar` gate) but the Topbar half of the old
 * per-screen passthrough is now dead, and removed.
 *
 * G11 label requirement (§5.7): "both the Home StatCard... and the deck's
 * economics DeckSlide ('value at adoption') carry explicit measure
 * labels... this is a Label (P3) addition on each StatValue (P11), not a
 * new component." The economics slide's three stats each carry their own
 * explicit `label` (required on `DeckSlideStat`, enforced by `DeckSlide`
 * itself) so the $4.5M/yr "value at adoption" figure can never render
 * unlabelled next to Home's differently-measured $540k/yr "cost capacity
 * already freed" figure and read as a contradiction.
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner or component-testing
 * library installed, and every sibling composite already landed in this
 * worktree (`DeckView.tsx`, `DeckSlide.tsx`, `StatCard.tsx`, `Button.tsx`,
 * `Topbar.tsx`) ships with no accompanying test file for the same reason.
 * TDD-with-executed-output (this SOP's Directive 2/Principle 3) is
 * therefore not achievable within this dispatch's file boundary; the
 * closest available verification was running `npx tsc --noEmit` against
 * the whole `src/` tree (strict mode, `exactOptionalPropertyTypes`) after
 * writing this file, confirming it type-checks against the real
 * `DeckView`/`DeckSlide`/`Topbar`/`Button` prop shapes rather than a
 * guessed one. Recommending a follow-up dispatch, scoped to add test
 * tooling (vitest + @testing-library/react) via its own `package.json`
 * ALLOWLIST, so this screen and its siblings can get real interaction
 * tests (including the deck's keyboard-paging and CTA-button paths).
 */
import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { DeckView } from '../components/DeckView';
import type { DeckViewProps, DeckViewSlide } from '../components/DeckView';
import type { DeckSlideStat } from '../components/DeckSlide';
import { Button } from '../components/primitives/Button';

/** Exact tagline casing required by the design-partner ask (G12, brand_doctrine.md tagline casing). */
const CTA_TAGLINE = 'AI Impact, Hand Delivered.';
/** Exact URL casing required alongside the tagline (G12, brand_doctrine.md). */
const CTA_URL = 'www.LeapFI.AI';

const ECONOMICS_STATS: DeckSlideStat[] = [
  // G11: "value at adoption" is the explicit measure label distinguishing
  // this $4.5M/yr figure from Home's differently-measured $540k/yr "cost
  // capacity already freed" figure (§5.1) — the two are never allowed to
  // render as bare numbers next to each other.
  { value: '$4.5M', unit: '/yr', label: 'Value at adoption' },
  { value: '$180k', label: 'Platform cost' },
  { value: '12%', label: 'Compliance capacity freed' },
];

const ECONOMICS_SLIDE: DeckViewSlide = {
  id: 'board-deck-economics',
  kind: 'economics',
  eyebrow: 'Board deck',
  heading: 'The ask',
  icon: 'check',
  body: [
    'Same subscription funds the defense and the offense — the platform reports both measures explicitly so a numerate board member never reads one as contradicting the other.',
  ],
  stats: ECONOMICS_STATS,
};

// "full-viewport DeckView" (§5.7 region map): the deck fills every pixel
// of the content region below the Shell's Topbar (App.tsx).
const DECK_REGION_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minHeight: 0,
  overflow: 'auto',
};

const CTA_BUTTON_ROW_STYLE: CSSProperties = {
  display: 'flex',
  marginTop: '0.5rem',
};

export interface BoardDeckProps {
  /**
   * The DeckCTASlide's (C20) single primary action — "the design-partner
   * ask" (§5.7, G12). Fired only from that Button; never invoked
   * optimistically by this screen (Core Principle 1 — this is a lead
   * request, not an irreversible server-side operation, so no request-key
   * de-duplication is required here, but the click is still routed
   * through exactly the one control the spec names, never auto-fired).
   */
  onDesignPartnerRequest: () => void;
  /** Forwarded to DeckView (C18) — defaults to the economics slide (0) so the deck always opens ready for the ask. */
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function BoardDeck({ onDesignPartnerRequest, initialIndex, onIndexChange }: BoardDeckProps) {
  const ctaSlideChildren: ReactNode = useMemo(
    () => (
      <div style={CTA_BUTTON_ROW_STYLE}>
        <Button label="Become a design partner" variant="primary" icon="arrow-right" onPress={onDesignPartnerRequest} />
      </div>
    ),
    [onDesignPartnerRequest],
  );

  const slides = useMemo<DeckViewSlide[]>(
    () => [
      ECONOMICS_SLIDE,
      {
        id: 'board-deck-cta',
        kind: 'generic',
        eyebrow: 'First design partners',
        heading: CTA_TAGLINE,
        body: [
          'We are taking our first design partners now — roadmap influence, early access, perpetual pricing.',
          CTA_URL,
        ],
        children: ctaSlideChildren,
      },
    ],
    [ctaSlideChildren],
  );

  // Built conditionally (rather than forwarding the possibly-`undefined`
  // props directly) because this project's `exactOptionalPropertyTypes`
  // setting treats DeckView's optional `initialIndex`/`onIndexChange` as
  // exactly their declared types, not `T | undefined` — same pattern
  // `StatCard.tsx` documents for its own optional `unit` forwarding.
  const deckViewProps: DeckViewProps = {
    slides,
    ...(initialIndex !== undefined ? { initialIndex } : {}),
    ...(onIndexChange !== undefined ? { onIndexChange } : {}),
  };

  return (
    <div data-lf-screen-region="deck" style={DECK_REGION_STYLE}>
      <DeckView {...deckViewProps} />
    </div>
  );
}
