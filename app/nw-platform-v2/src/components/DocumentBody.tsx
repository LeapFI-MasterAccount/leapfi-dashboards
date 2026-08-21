/**
 * DocumentBody — shared full-document-body + inline RedlineDiffView (C9)
 * render, extracted from OnSideDocuments.tsx/OnSideOwnership.tsx's own
 * previously-duplicated Drawer content (design_system_spec.md §2.11,
 * amendment A18; PI2-D35's "the full document body renders only on
 * OnSideDocuments.tsx:700/OnSideOwnership.tsx:600, never by the case
 * surface" gap this extraction exists to let a third caller close).
 *
 * What this component owns (and only this): the document's own full
 * `secs` text as `DrawerContent` (C8, `kind: 'doc'`) field rows, plus —
 * when the document carries a pending `redline` — the same
 * `RedlineDiffView` (C9) composition both screens already render right
 * after those fields (before/after diff, `hitl` Tag, the redline's
 * `note` paragraph). A9's "exactly one document detail surface app-wide"
 * rule is honored at the CALL-SITE level, per this dispatch's own
 * framing: OnSideDocuments.tsx and OnSideOwnership.tsx keep their own
 * screen-specific metadata (Version/Domain/Owner/RACI assignments/
 * evidenced-obligation actions) — that shape differs per screen and is
 * NOT this component's concern — and now both, plus §2.11/A18's case
 * side-car (a third, future call site, outside this lane's allowlist),
 * share exactly one `secs`-rendering + one `RedlineDiffView`-rendering
 * code path instead of each screen re-authoring its own copy.
 *
 * Prop surface, by design, couples to nothing but a document id:
 *  - `docId` resolves the document directly against `DOCLIB` — the sole
 *    document-identifying input. A third caller (a case side-car) needs
 *    only the document id a case record already names to mount this
 *    component; no Cases.tsx/CaseDetail.tsx type or shape is imported
 *    here, or ever needs to be.
 *  - `redline clause anchor`, named in this dispatch's prop-surface
 *    guidance: DOCLIB's `DocRedline` (data/doclib.ts) carries at most
 *    ONE `redline` per document, with no separate clause-id/heading
 *    link into `secs` — there is no multi-clause-anchor data to key on
 *    today. `docId` therefore already IS that anchor (one document, one
 *    redline, rendered inline after its full body — the same
 *    composition `OnSideDocuments.tsx`/`OnSideOwnership.tsx` already
 *    use, and the same one §2.11/A18 documents as satisfying "renders
 *    inline at its clause location"). If a future data model adds
 *    multiple redlines per document, that is a data-model change outside
 *    this lane's allowlist (this lane has no knowledge of cases or of
 *    DOCLIB's own shape beyond consuming it) — flagged here, not
 *    resolved by inventing an unused prop against data that does not
 *    exist.
 *  - `metadataFields`/`tags`/`actions` are the screen-specific
 *    `DrawerContent` rows/pills/buttons each caller already builds
 *    (Version/Domain/Owner, evidenced-obligation action buttons, etc.);
 *    they render BEFORE the document's own full-text `secs` fields,
 *    exactly the order both screens' pre-extraction JSX already used.
 *  - `redlineHitlText` stays a prop, never hardcoded: OnSideDocuments
 *    needs a LIVE adoption-state string ("Adopted" vs "HITL review"),
 *    OnSideOwnership always passes the static default — the same
 *    `RedlineDiffView.hitlText` default ("HITL review") is reused when
 *    omitted, so OnSideOwnership's call site needs no explicit literal.
 *  - `decodeText` is passed in, not reimplemented a third time: both
 *    call sites already carry their own byte-identical copy of the
 *    doclib ported-HTML-entity decoder (see each screen's own file
 *    header "HTML entity/inline-tag decoding" note for why neither
 *    could host a shared copy inside its own single-file allowlist);
 *    this component has no allowlisted home for a fourth copy either, so
 *    it takes the function rather than adding one.
 *
 * An id DOCLIB does not carry renders nothing — never a fabricated body
 * (Core Principle 3: the screen renders server/data truth, including
 * "no such document," not an empty-looking-but-present placeholder).
 */
import { DrawerContent } from './DrawerContent';
import type { DrawerContentAction, DrawerContentField, DrawerContentTag } from './DrawerContent';
import { RedlineDiffView } from './RedlineDiffView';
import { DOCLIB } from '../data/doclib';

export interface DocumentBodyProps {
  /** DOCLIB key identifying the document whose full body (+ redline, if
   * any) to render — see file header "redline clause anchor" note. */
  docId: string;
  /** Screen-owned `DrawerContent` field rows (Version/Domain/Owner/RACI
   * assignments/etc.) rendered BEFORE the document's own full `secs`
   * text — this component appends the full body, it never replaces or
   * reorders a caller's own metadata. */
  metadataFields?: DrawerContentField[];
  tags?: DrawerContentTag[];
  actions?: DrawerContentAction[];
  /** Redline HITL pill text — see file header; omit for
   * `RedlineDiffView`'s own default ("HITL review"). */
  redlineHitlText?: string;
  /** Decodes doclib's ported HTML entity/inline-tag vocabulary — see
   * file header; both existing call sites already carry an identical
   * copy of this function. */
  decodeText: (input: string) => string;
}

const REDLINE_BLOCK_STYLE = { marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' } as const;
/** FIX WAVE (Class C, C1), carried over verbatim from both pre-extraction
 * call sites: rendered inside the shared Drawer, whose root background is
 * var(--panel) — --ink2 fails AA there in light theme; --chart-axis is
 * the prescribed panel-seated substitute. */
const REDLINE_NOTE_STYLE = { marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--chart-axis)' } as const;

export function DocumentBody({ docId, metadataFields = [], tags = [], actions = [], redlineHitlText, decodeText }: DocumentBodyProps) {
  const doc = DOCLIB[docId];
  if (!doc) return null;

  const fields: DrawerContentField[] = [...metadataFields, ...doc.secs.map(([heading, body]) => ({ label: heading, value: decodeText(body) }))];

  return (
    <>
      <DrawerContent kind="doc" fields={fields} tags={tags} actions={actions} />
      {doc.redline ? (
        <div style={REDLINE_BLOCK_STYLE}>
          <RedlineDiffView
            before={decodeText(doc.redline.old)}
            after={decodeText(doc.redline.nw)}
            hitl
            {...(redlineHitlText !== undefined ? { hitlText: redlineHitlText } : {})}
          />
          <p style={REDLINE_NOTE_STYLE}>{decodeText(doc.redline.note)}</p>
        </div>
      ) : null}
    </>
  );
}
