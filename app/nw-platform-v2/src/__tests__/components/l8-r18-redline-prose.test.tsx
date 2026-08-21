/**
 * L8 exit criterion 2 (D15) — AC-r18-1 (`r18_redline_review_ux.md`):
 * "A contiguous change renders as ONE run, not one per word." The AC's
 * OWN root-cause note (r18 file, AC-r18-1): `RedlineDiffView.tsx`'s
 * `tokenize` emits whitespace as its own tokens, and the LCS matches
 * those spaces across the before/after pair, so `mergeAdjacent` never
 * sees adjacent same-type parts to merge — a multi-word replacement
 * renders one pill per word ("word-fragment pill treatment," the
 * reported bug) instead of one continuous prose edit.
 *
 * NOTE ON THE DISPATCH BRIEF'S AC NUMBER: the dispatch brief cites this
 * item as "AC-r18-3 redline-prose redesign." Read against
 * `r18_redline_review_ux.md`'s own text (as the brief itself instructs),
 * AC-r18-3 is the "why" line data-binding criterion — already `[x]`
 * satisfied by PI2-D31's origin field group, unrelated to prose. The
 * criterion whose own title and text IS "redline presentation redesign"
 * / "not token confetti — continuous prose with inline strike/insert
 * runs" is AC-r18-1, independently confirmed in `01-architecture.md` row
 * 16 ("r18 (redline presentation redesign — prose-over-confetti on
 * RedlineDiffView, C9)") and explicitly flagged in the r18 file itself
 * as "confirmed genuinely unbuilt." This test targets AC-r18-1 per that
 * cross-referenced source-of-truth (doctrine: "path, never paraphrase") —
 * flagged in the evidence return, not silently resolved.
 *
 * DISCRIMINATING: reverting `tokenize` in `RedlineDiffView.tsx` to its
 * pre-fix `/\S+|\s+/g` pattern (separate whitespace tokens) makes this
 * test fail — a five-word contiguous replacement renders 5 `<del>`s and
 * 5 `<ins>`s instead of 1 each.
 */
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { RedlineDiffView } from '../../components/RedlineDiffView'

describe('RedlineDiffView — AC-r18-1 contiguous-run redesign (prose, not confetti)', () => {
  it('a contiguous multi-word phrase replacement renders as exactly ONE <del> and ONE <ins>, not one per word', () => {
    const before = 'The committee shall review the quick brown fox jumps report annually.'
    const after = 'The committee shall review the swift crimson wolf leaps report annually.'
    const { container } = render(<RedlineDiffView before={before} after={after} />)

    expect(container.querySelectorAll('del').length).toBe(1)
    expect(container.querySelectorAll('ins').length).toBe(1)
    expect(container.querySelector('del')?.textContent).toContain('quick brown fox jumps')
    expect(container.querySelector('ins')?.textContent).toContain('swift crimson wolf leaps')
  })

  it('an unchanged phrase surrounding the edit still renders as plain equal text (no spurious runs)', () => {
    const before = 'Reviewed by the Risk Committee on a quarterly basis for adequacy.'
    const after = 'Reviewed by the Risk Committee on an annual basis for adequacy.'
    const { container } = render(<RedlineDiffView before={before} after={after} />)

    expect(container.querySelectorAll('del').length).toBe(1)
    expect(container.querySelectorAll('ins').length).toBe(1)
    expect(container.textContent).toContain('Reviewed by the Risk Committee on')
    expect(container.textContent).toContain('basis for adequacy.')
  })
})
