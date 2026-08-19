/**
 * DeckView — Composite C18 (design_system_spec.md §2.2)
 *
 * Built from: DeckSlide (C19) list + pagination Button (`ghost`, "Next
 * slide"/"Prev slide"). Composite state: `slide-n-of-total`.
 *
 * a11y baseline (spec C18): "Pagination announces current slide
 * position. Deck is reachable and operable by keyboard paging, not
 * mouse-only." §5.7 adds: pagination is utility chrome, never styled
 * `primary` — only the terminal slide's own content is the primary
 * action (out of this component's scope; DeckSlide/DeckCTASlide own
 * their own content).
 *
 * KEYBOARD NAV (this dispatch's explicit brief item): the spec names
 * the two pagination Buttons but does not enumerate a key list beyond
 * "operable by keyboard paging" — both Buttons are already natively
 * keyboard-operable (Tab + Enter/Space) with no extra work needed for
 * that baseline alone. This component adds the standard accessible-
 * carousel keyboard affordance (WAI-ARIA APG carousel pattern) as the
 * concrete shape of "paging": ArrowLeft/ArrowRight step one slide,
 * Home/End jump to the first/last slide, captured on the deck region so
 * they fire regardless of which descendant (a pagination Button, or the
 * slide content itself) currently has focus. Disabled at the bounds
 * (ArrowLeft/Home no-op on slide 1, ArrowRight/End no-op on the last
 * slide) rather than wrapping, matching the Prev/Next Buttons' own
 * disabled-at-bounds behavior below — one boundary rule, not two.
 *
 * Only the current slide is mounted (not all slides with the rest
 * `aria-hidden`) — this is a presenter-advanced deck (§4/§5.7), not a
 * live/auto-rotating carousel, so there is no case where an inactive
 * slide needs to stay in the DOM. Focus is left on whichever pagination
 * Button was pressed (same DOM node persists across the index change),
 * so keyboard users never lose their place — the `aria-live` region
 * below is what carries the position change to assistive tech instead
 * of a focus move.
 *
 * Not a focus trap (§5.7: "deck is not a trap — closable/exitable like
 * any screen"): unlike Drawer (C7), this component never calls
 * `preventDefault`/traps Tab, and exit happens via the shell
 * (Sidebar/Topbar), which is outside this composite's concern.
 *
 * OVERFLOW DISCIPLINE (fix A-overlap-01; base anchor
 * leapfi-platform.html:663 `.deck-stage{...overflow:hidden}`): the slide
 * box clips horizontally and scrolls vertically inside itself when a
 * slide's content is taller than the flex track. Without it, the
 * `minHeight:0` flex squeeze let slide content paint straight through
 * the later-DOM pagination row in both mounts (Reporting's board-pack
 * drawer and the BoardDeck screen under the PresenterRail height inset).
 * The base clipped hard (`overflow:hidden`); the twin adds internal
 * vertical scroll so squeezed content stays reachable rather than
 * silently truncated — containment identical, reachability strictly
 * better.
 *
 * DOT NAVIGATION (fix B-dead-interactions-13; base anchors
 * leapfi-platform.html:1524 `.deck-dots` in deck-nav, 1682–1683
 * `dots[j].onclick = deckShow(j)`, CSS 692–694): the base rendered one
 * clickable dot per slide between the count and Next — a per-slide jump
 * affordance the twin had dropped to a static "n / total" span. Ported
 * as real per-slide buttons (11px circles, `--border` inactive /
 * `--accent` active, matching the base's --line2/--cyan pair), each with
 * an accessible slide name and `aria-current` on the active dot. The
 * count span stays, as in the base (order: Prev · count · dots · Next).
 */
import { useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from './primitives/Button';
import { DeckSlide } from './DeckSlide';
import type { DeckSlideProps } from './DeckSlide';

export interface DeckViewSlide extends DeckSlideProps {
  id: string;
}

export interface DeckViewProps {
  slides: DeckViewSlide[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function DeckView({ slides, initialIndex = 0, onIndexChange }: DeckViewProps) {
  const clampedInitial = Math.min(Math.max(initialIndex, 0), Math.max(slides.length - 1, 0));
  const [index, setIndex] = useState(clampedInitial);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = slides.length;
  const current = slides[index];
  const atStart = index <= 0;
  const atEnd = index >= total - 1;

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), Math.max(total - 1, 0));
    if (clamped === index) return;
    setIndex(clamped);
    onIndexChange?.(clamped);
  };

  const announcement = useMemo(() => {
    if (!current || total === 0) return 'No slides.';
    return `Slide ${index + 1} of ${total}: ${current.heading}`;
  }, [current, index, total]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        goTo(index + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        goTo(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        goTo(0);
        break;
      case 'End':
        event.preventDefault();
        goTo(total - 1);
        break;
      default:
        break;
    }
  };

  if (!current) {
    return (
      <div data-lf-composite="deck-view" role="region" aria-roledescription="carousel" aria-label="Board deck">
        No slides.
      </div>
    );
  }

  // `current` is narrowed to defined below this point, so this is a
  // plain `string` — never explicit `undefined` — satisfying
  // DeckSlideProps.headingId under exactOptionalPropertyTypes.
  const headingId = `deck-slide-heading-${current.id}`;

  return (
    <div
      ref={containerRef}
      data-lf-composite="deck-view"
      role="region"
      aria-roledescription="carousel"
      aria-label="Board deck"
      onKeyDown={handleKeyDown}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%', boxSizing: 'border-box' }}
    >
      {/* top/left pinned to 0 is load-bearing — see the invariant note on DataTable.tsx's `srOnlyStyle` */}
      <div role="status" aria-live="polite" style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {announcement}
      </div>

      <div
        data-lf-composite="deck-view-slide"
        aria-roledescription="slide"
        aria-labelledby={headingId}
        // A-overlap-01: base `.deck-stage{overflow:hidden}` (source 663) —
        // clip sideways, scroll internally when the slide exceeds its track,
        // so content never paints under the pagination row below.
        style={{ flex: '1 1 auto', minHeight: 0, overflowX: 'hidden', overflowY: 'auto' }}
      >
        <DeckSlide {...current} headingId={headingId} />
      </div>

      <div
        data-lf-composite="deck-view-pagination"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.875rem', padding: '0 1rem 1rem' }}
      >
        <Button label="Prev slide" variant="ghost" icon="chevron-left" onPress={() => goTo(index - 1)} disabled={atStart} />
        <span style={{ font: 'inherit', fontSize: '0.8125rem', color: 'var(--ink3)' }}>
          {index + 1} / {total}
        </span>
        {/* B-dead-interactions-13: base per-slide jump dots (deck-nav source
            1524; wired 1682–1683 `dots[j].onclick = deckShow(j)`). */}
        <div data-lf-composite="deck-view-dots" style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          {slides.map((slide, dotIndex) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${dotIndex + 1}: ${slide.heading}`}
              aria-current={dotIndex === index ? 'true' : undefined}
              onClick={() => goTo(dotIndex)}
              onFocus={(event) => {
                event.currentTarget.style.boxShadow = 'var(--focus-ring)';
              }}
              onBlur={(event) => {
                event.currentTarget.style.boxShadow = 'none';
              }}
              style={{
                width: 11,
                height: 11,
                padding: 0,
                border: 'none',
                borderRadius: '50%',
                // Base CSS 692–694: `.deck-dots span{background:var(--line2)}`
                // / `.deck-dots span.on{background:var(--cyan)}`.
                background: dotIndex === index ? 'var(--accent)' : 'var(--border)',
                cursor: 'pointer',
                outline: 'none',
              }}
            />
          ))}
        </div>
        <Button label="Next slide" variant="ghost" icon="chevron-right" onPress={() => goTo(index + 1)} disabled={atEnd} />
      </div>
    </div>
  );
}
