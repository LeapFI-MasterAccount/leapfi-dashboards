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
 * `entries` IS Marisol's territory (`ChatEntry.question`'s own doc comment:
 * "Marisol's scripted set for this module") and is DELIBERATELY EMPTY here
 * — this dispatch's ALLOWLIST explicitly forbids creating or touching the
 * real content data file her concurrent, disjoint lane owns, and her exact
 * file path/export names are not stated in this dispatch's brief. Wiring
 * her `entries` into these two records (or importing them directly) is the
 * next integration step, not this one: with `entries: []` today, every
 * "Ask OnSide"/"Ask Studio" trigger, Drawer, and ChatHero surface renders
 * and behaves fully (greeting, no suggestion chips, every submission
 * honestly falls to `defaultNoMatchMessage` — never a fabricated match)
 * until that follow-up lands real scripted content here.
 *
 * STOP-item / integration note for the orchestrator: once Marisol's content
 * file exists, replace the two empty `entries: []` below with her exported
 * `ChatEntry[]` sets (or merge her file's records directly) — no other
 * change is needed anywhere else in this dispatch's consumer code, since
 * every screen/component here already renders whatever `entries` this
 * record carries.
 */
import type { ChatModuleConfig } from './chatTypes';

export const ONSIDE_CHAT_MODULE_CONFIG: ChatModuleConfig = {
  module: 'onside',
  drawerTitle: 'OnSide chat',
  entryLabel: 'Ask OnSide',
  inputLabel: 'Ask OnSide a question',
  inputPlaceholder: 'Ask about a regulatory item, obligation, or document…',
  greeting: 'Ask me about anything in your regulatory feed, obligations, or documents.',
  defaultNoMatchMessage: 'No matching OnSide answer for that yet.',
  entries: [],
};

export const STUDIO_CHAT_MODULE_CONFIG: ChatModuleConfig = {
  module: 'studio',
  drawerTitle: 'Studio chat',
  entryLabel: 'Ask Studio',
  inputLabel: 'Ask Studio a question',
  inputPlaceholder: 'Ask about an opportunity, play, or what is blocking it…',
  greeting: "Ask me about an opportunity, play, or what's blocking it.",
  defaultNoMatchMessage: 'No matching Studio answer for that yet.',
  entries: [],
};
