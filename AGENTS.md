# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server (localhost:5173)
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

There are no tests or linters configured yet.

## Architecture

This is a mobile-first React 19 journaling app. All data lives in the browser — no backend, no auth, no network calls. The canonical spec is **DESIGN.md** in the repo root; consult it for screen layouts, data model details, and CSV format.

### Data flow

`src/db.js` is the single source of truth for persistence. It opens an IndexedDB database (`journal-db`, object store `entries`, key path `id`) via the `idb` wrapper and exports async helpers (`getAllEntries`, `getEntry`, `saveEntry`, `deleteEntry`, `upsertEntries`, `checkDBAvailable`). All page components call these directly — there is no state management layer.

### Entry shape

```js
{
  id:        string    // UUID v4
  date:      string    // "YYYY-MM-DD"
  text:      string
  mood:      string    // one of: happy | calm | neutral | sad | frustrated | anxious
  tags:      string[]  // derived from text, never edited directly
  createdAt: number    // Unix ms
  updatedAt: number    // Unix ms
}
```

Mood defaults to `neutral` on new entries. Tags are always derived by `extractTags()` from `src/utils/tagParser.js` on every save — they are never manually edited.

List views sort entries with `sortEntriesByJournalDate()` from `src/utils/entrySort.js`: `date` descending first, then `updatedAt` descending as the tie-breaker.

### App bootstrapping

`src/main.jsx` wraps the app in `ThemeContextProvider`, uses `useTheme()` to choose the active MUI theme, checks IndexedDB availability with `checkDBAvailable()`, wires `CssBaseline`, `LocalizationProvider` (dayjs adapter), `HashRouter`, and lazy-loads route components under `Suspense`.

`src/theme.js` exports both `lightTheme` and `darkTheme`. `src/ThemeContext.jsx` persists the selected mode in `localStorage` under `theme-mode`.

### Routing

`HashRouter` is used so the app works on any static host without server-side redirects. Routes:

| Path | Component |
| --- | --- |
| `/#/` | `ListView` |
| `/#/entry/new` | `WriteEditView` (new entry) |
| `/#/entry/:id` | `ReadView` |
| `/#/entry/:id/edit` | `WriteEditView` (edit existing) |

`WriteEditView` serves both create and edit — it detects mode by whether `:id` is present in params.

### Key files

- `src/main.jsx` — app entry; wires theme context, storage availability warning, `LocalizationProvider`, `HashRouter`, and lazy routes
- `src/theme.js` — MUI v5 light/dark themes; extend here for any global style overrides
- `src/ThemeContext.jsx` — theme mode state, persistence, and active theme selection
- `src/db.js` — all IndexedDB access; bump `DB_VERSION` and add an `upgrade()` branch if the schema changes
- `src/utils/tagParser.js` — `extractTags(text)` regex; returns lowercased unique tags
- `src/utils/moods.js` — mood metadata, validation, and coercion to `neutral`
- `src/utils/entrySort.js` — journal timeline sorting
- `src/utils/csvHelpers.js` — `triggerExport()`, `parseCSV(file)`, and `importCSV(entries)`; tags are pipe-separated on export (`productive|grateful`), but import must re-derive tags from `text` via `extractTags()`
- `src/utils/seedData.js` — dev-only sample data helpers used by `ListView`

### UI conventions

- MUI v5 components throughout; light/dark theme applied globally via `ThemeProvider` in `main.jsx`
- Date handling uses `dayjs` (the MUI date picker adapter); keep date strings in ISO 8601 (`YYYY-MM-DD`)
- Mood is always one of the 6 fixed keys — never a free-form string. Invalid moods are coerced to `neutral` on CSV import.
- CSV import is two-step: `parseCSV(file)` validates/parses and returns `{ entries, skipped }`, then the UI shows a confirmation summary before `importCSV(entries)` writes records. Upsert behavior replaces entries with matching `id`s only after confirmation.
- Read View includes a delete action behind confirmation before removing an entry.
- The empty List View state includes both a visible "Write first entry" button and a short local-only storage note.
- Existing shared components in `src/components/`: `MoodChip`, `MoodSelector`, `TagPills`, `EntryCard`, `EntryRow`, `ConfirmDialog`, `ThemeToggle`.
