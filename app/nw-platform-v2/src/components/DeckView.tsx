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
      <div role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {announcement}
      </div>

      <div data-lf-composite="deck-view-slide" aria-roledescription="slide" aria-labelledby={headingId} style={{ flex: '1 1 auto', minHeight: 0 }}>
        <DeckSlide {...current} headingId={headingId} />
      </div>

      <div
        data-lf-composite="deck-view-pagination"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem 1rem' }}
      >
        <Button label="Prev slide" variant="ghost" icon="chevron-left" onPress={() => goTo(index - 1)} disabled={atStart} />
        <span style={{ font: 'inherit', fontSize: '0.8125rem', color: 'var(--ink3)' }}>
          {index + 1} / {total}
        </span>
        <Button label="Next slide" variant="ghost" icon="chevron-right" onPress={() => goTo(index + 1)} disabled={atEnd} />
      </div>
    </div>
  );
}
