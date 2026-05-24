# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

`src/db.js` is the single source of truth for persistence. It opens an IndexedDB database (`journal-db`, object store `entries`, key path `id`) via the `idb` wrapper and exports async helpers (`getAllEntries`, `getEntry`, `saveEntry`, `deleteEntry`, `upsertEntries`). All page components call these directly — there is no state management layer.

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

- `src/main.jsx` — app entry; wires `ThemeProvider`, `CssBaseline`, `LocalizationProvider` (dayjs adapter), `HashRouter`, and routes
- `src/theme.js` — MUI v5 dark theme; extend here for any global style overrides
- `src/db.js` — all IndexedDB access; bump `DB_VERSION` and add an `upgrade()` branch if the schema changes
- `src/utils/tagParser.js` — `extractTags(text)` regex; returns lowercased unique tags
- `src/utils/csvHelpers.js` — `triggerExport()` and `importCSV(file)`; tags are pipe-separated in CSV (`productive|grateful`)

### UI conventions

- MUI v5 components throughout; dark theme applied globally via `ThemeProvider` in `main.jsx`
- Date handling uses `dayjs` (the MUI date picker adapter); keep date strings in ISO 8601 (`YYYY-MM-DD`)
- Mood is always one of the 6 fixed keys — never a free-form string. Invalid moods are coerced to `neutral` on CSV import.
- Components planned per DESIGN.md: `MoodChip`, `MoodSelector`, `TagPills`, `EntryCard`, `EntryRow`, `ConfirmDialog` in `src/components/`
