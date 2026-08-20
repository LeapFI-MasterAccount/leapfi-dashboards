/**
 * DocumentBody — extraction regression (lane-3, §2.11/A18 export side).
 *
 * Pins the shared component's own contract in isolation (no screen, no
 * Drawer wrapper needed — DocumentBody renders DrawerContent(kind:'doc')
 * + an inline RedlineDiffView block only, exactly the two screens'
 * previously-duplicated JSX at OnSideDocuments.tsx/OnSideOwnership.tsx's
 * own doc-drawer content, now sourced from one place):
 *
 *  - AC-A18-1 (full body reachable, not a snippet): every `secs`
 *    heading/body pair renders as a field row.
 *  - AC-A18-4 (redline renders inline via RedlineDiffView, no second
 *    diff path): a doc carrying `redline` renders exactly one
 *    `[data-lf-composite="redline-diff-view"]` node with the before/
 *    after text and the hitl Tag; a doc with no `redline` renders none.
 *  - Screen-specific metadata fields (caller-supplied) render ahead of
 *    the document's own full-text sections, never replacing them.
 *  - `redlineHitlText` is a prop (OnSideDocuments needs a LIVE adoption-
 *    state string; OnSideOwnership always passes the static default) —
 *    never hardcoded in the shared component.
 *  - `docId` is the only document-identifying input (DOCLIB is the sole
 *    data source), so a third caller (Lane 2's case side-car) can mount
 *    this from nothing but a document id, no Cases.tsx/CaseDetail.tsx
 *    coupling.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { DocumentBody } from '../../components/DocumentBody'
import { DOCLIB } from '../../data/doclib'

// 'irp' (Incident Response Plan): 3 secs + a redline — the load-bearing
// fixture the existing OnSideDocuments deep-link test already pins.
const REDLINE_DOC_ID = 'irp'
// 'pentest' (Annual Penetration Test & Remediation Tracker): 3 secs, no
// redline — pins the "no redline block at all" branch.
const NO_REDLINE_DOC_ID = 'pentest'

function decode(input: string): string {
  return input.replace(/&rsquo;/g, '’')
}

describe('DocumentBody — shared full-document-body + inline RedlineDiffView export', () => {
  it('renders every secs heading/body pair as a field row — the full body, not a snippet (AC-A18-1)', () => {
    render(<DocumentBody docId={REDLINE_DOC_ID} decodeText={decode} />)
    const doc = DOCLIB[REDLINE_DOC_ID]!
    for (const [heading, body] of doc.secs) {
      expect(screen.getByText(heading)).toBeInTheDocument()
      expect(screen.getByText(decode(body))).toBeInTheDocument()
    }
  })

  it('renders the redline inline via RedlineDiffView (C9), exactly one diff node, with hitl Tag + before/after text (AC-A18-4)', () => {
    render(<DocumentBody docId={REDLINE_DOC_ID} decodeText={decode} redlineHitlText="Adopted" />)
    const diffNodes = document.querySelectorAll('[data-lf-composite="redline-diff-view"]')
    expect(diffNodes).toHaveLength(1)
    const doc = DOCLIB[REDLINE_DOC_ID]!
    expect(screen.getByText('Adopted')).toBeInTheDocument()
    // RedlineDiffView (unmodified, out of this lane's allowlist) word-diffs
    // before/after into per-run <del>/<ins>/<span> siblings, so a whole-
    // phrase getByText match is the wrong tool here (that is the diff
    // component's own, already-covered behavior, and a multi-word phrase
    // can straddle a run boundary) — this test only proves DocumentBody
    // handed the real old/nw strings through, via single-token substring
    // checks (tokenize never splits mid-word) scoped to the diff node.
    const diffText = diffNodes[0]!.textContent ?? ''
    expect(diffText).toContain('defined') // old-only word
    expect(diffText).toContain('CCO') // nw-only word
    expect(screen.getByText(decode(doc.redline!.note))).toBeInTheDocument()
  })

  it('defaults the hitl pill to "HITL review" when redlineHitlText is not supplied', () => {
    render(<DocumentBody docId={REDLINE_DOC_ID} decodeText={decode} />)
    expect(screen.getByText('HITL review')).toBeInTheDocument()
  })

  it('renders no redline block at all for a document with no redline (no second diff-rendering path invented for the empty case)', () => {
    render(<DocumentBody docId={NO_REDLINE_DOC_ID} decodeText={decode} />)
    expect(document.querySelectorAll('[data-lf-composite="redline-diff-view"]')).toHaveLength(0)
    const doc = DOCLIB[NO_REDLINE_DOC_ID]!
    expect(doc.redline).toBeUndefined()
  })

  it('renders caller-supplied metadata fields ahead of the document full-text sections, never replacing them', () => {
    render(
      <DocumentBody
        docId={NO_REDLINE_DOC_ID}
        decodeText={decode}
        metadataFields={[{ label: 'Owner', value: 'P. Nguyen · ISD' }]}
      />,
    )
    const dl = document.querySelector('dl')
    expect(dl).not.toBeNull()
    const labels = within(dl as HTMLElement)
      .getAllByText(/.+/, { selector: 'dt *' })
      .map((el) => el.textContent)
    const ownerIndex = labels.indexOf('Owner')
    const doc = DOCLIB[NO_REDLINE_DOC_ID]!
    const firstSecsHeadingIndex = labels.indexOf(doc.secs[0]![0])
    expect(ownerIndex).toBeGreaterThanOrEqual(0)
    expect(firstSecsHeadingIndex).toBeGreaterThan(ownerIndex)
  })

  it('renders caller-supplied tags and actions through to DrawerContent', () => {
    render(
      <DocumentBody
        docId={NO_REDLINE_DOC_ID}
        decodeText={decode}
        tags={[{ text: 'Current', variant: 'status-positive' }]}
        actions={[{ label: 'Do a thing', variant: 'ghost', onPress: () => {} }]}
      />,
    )
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Do a thing' })).toBeInTheDocument()
  })

  it('resolves the document purely from docId against DOCLIB — no other document-identifying input required (third-caller contract)', () => {
    const { container } = render(<DocumentBody docId="no-such-doc" decodeText={decode} />)
    // An id DOCLIB does not carry renders nothing rather than a fabricated body.
    expect(container).toBeEmptyDOMElement()
  })
})
