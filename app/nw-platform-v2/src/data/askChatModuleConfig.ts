/**
 * Context-scoped Ask chat — per-module CHROME configuration (design_system_
 * spec.md §2.9.4/§2.9.5, amendment A16 / PI2-D42).
 *
 * `ChatModuleConfig`'s own doc comment (`data/chatTypes.ts`) is explicit:
 * every field except `entries` is "Fixed once per module — authored by this
 * amendment, not per-entry content Marisol supplies." This file is that
 * authoring — `drawerTitle`/`entryLabel` are the exact literals the ruling
 * itself quotes (§2.9.4, §2.9.5); `inputLabel`/`inputPlaceholder`/
 * `greeting`/`defaultNoMatchMessage` are implementer-authored UI chrome
 * copy (no doctrine source dictates exact wording for these, same category
 * of judgment call as `ChatHero.tsx`'s own pre-A16 hardcoded literals).
 *
 * INTEGRATION SEAM CLOSED (hostile-review finding, PI2-D42 verifier):
 * `entries` IS Marisol's territory (`ChatEntry.question`'s own doc comment:
 * "Marisol's scripted set for this module"). Her content file now exists at
 * `./askChat.ts` (`ONSIDE_CHAT`/`STUDIO_CHAT`), every entry click-path-
 * verified against the shipped data modules (see that file's own header).
 * `entries` below is that file's `entries` array, imported directly — the
 * SAME array reference, not a copy — so this file never restates or drifts
 * from her content; only she authors it, going forward, in her own file.
 * Her local `ChatEntry`/`ChatEntryDeepLink`/`ChatModuleConfig` types
 * (authored independently, against the same §2.9.4 schema) are structurally
 * identical to this file's own `chatTypes.ts` types — including
 * `ChatEntryDeepLink.request`, which both sides type as the real, generated
 * `DeepLinkRequest` shape (`{ screen: ScreenId; kind: DeepLinkKind; id:
 * string }`, `App.tsx`) — so `tsc` accepts the assignment with no adapter
 * needed on this side; no schema contradiction was found.
 *
 * This file's own chrome fields (`drawerTitle`, `entryLabel`, `inputLabel`,
 * `inputPlaceholder`, `greeting`, `defaultNoMatchMessage`) are left
 * unchanged: Marisol's file separately authors its own full
 * `ChatModuleConfig` records for self-contained testability, but this
 * dispatch's brief scopes the wiring to `entries` only, and the schema's
 * own doc comment (above) already assigns chrome authorship to this file,
 * not hers — no conflict to STOP on.
 */
import type { ChatModuleConfig } from './chatTypes';
import { ONSIDE_CHAT, STUDIO_CHAT } from './askChat';

export const ONSIDE_CHAT_MODULE_CONFIG: ChatModuleConfig = {
  module: 'onside',
  drawerTitle: 'OnSide chat',
  entryLabel: 'Ask OnSide',
  inputLabel: 'Ask OnSide a question',
  inputPlaceholder: 'Ask about a regulatory item, obligation, or document…',
  greeting: 'Ask me about anything in your regulatory feed, obligations, or documents.',
  defaultNoMatchMessage: 'No matching OnSide answer for that yet.',
  entries: ONSIDE_CHAT.entries,
};

export const STUDIO_CHAT_MODULE_CONFIG: ChatModuleConfig = {
  module: 'studio',
  drawerTitle: 'Studio chat',
  entryLabel: 'Ask Studio',
  inputLabel: 'Ask Studio a question',
  inputPlaceholder: 'Ask about an opportunity, play, or what is blocking it…',
  greeting: "Ask me about an opportunity, play, or what's blocking it.",
  defaultNoMatchMessage: 'No matching Studio answer for that yet.',
  entries: STUDIO_CHAT.entries,
};
