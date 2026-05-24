# Mobile Journal App — Design Document

**Version:** 0.2 (Draft)  
**Status:** Review  
**Purpose:** Reference document for code generation in Claude Code

---

## Overview

A mobile-first React web application for personal journaling. All data is stored locally in the browser using IndexedDB — there is no backend, no authentication, and no network dependency. Users can export and import their journal as a CSV file for backup purposes.

---

## Goals

- Simple, fast daily journaling from a mobile browser  
- Mood tracking per entry using a fixed set of categories  
- Inline hashtag tagging extracted automatically from entry text  
- Full data portability via CSV export and import  
- Minimum viable product — keep scope tight, defer enhancements

---

## Tech Stack

| Concern | Choice | Notes |
| :---- | :---- | :---- |
| Build tool | Vite | Fast dev server, modern defaults |
| UI framework | React 19 | Component-based, wide ecosystem |
| UI component library | MUI v5 | Light and dark themes, mobile-friendly components |
| Theme | MUI light + dark | Toggleable via button in app bar; user preference saved to localStorage |
| Local storage | IndexedDB via `idb` | Promise-based wrapper, simple API |
| Routing | React Router v6 | Client-side navigation between screens |
| CSV handling | PapaParse | Robust CSV parse and export |
| Date picker | `@mui/x-date-pickers` + `dayjs` | MUI DatePicker requires a separate package and date adapter |
| Icons | MUI Icons / Emoji | Mood indicators use emoji characters |

---

## Data Model

Each journal entry is a single object stored in an IndexedDB object store named `entries`.

{

  id:        string    // UUID v4, auto-generated on creation

  date:      string    // ISO 8601 date string, e.g. "2026-05-22"

  text:      string    // Full entry body text

  mood:      string    // One of the 6 mood category keys (see below)

  tags:      string\[\]  // Extracted from inline \#hashtags in text body

  createdAt: number    // Unix timestamp (ms), set on creation

  updatedAt: number    // Unix timestamp (ms), updated on every save

}

### Mood Categories

| Key | Display |
| :---- | :---- |
| `happy` | 😊 Happy |
| `calm` | 😌 Calm |
| `neutral` | 😐 Neutral |
| `sad` | 😔 Sad |
| `frustrated` | 😤 Frustrated |
| `anxious` | 😰 Anxious |

Mood is **required** on every entry. It defaults to `neutral` when creating a new entry.

### Tag Extraction

Tags are parsed from the entry text body using the pattern `#word` (a `#` followed by one or more word characters, no spaces). Extraction runs client-side on every save. The parsed tags are stored in the `tags` array — they are **derived from the text** and not independently editable. Tags are case-normalized to lowercase on extraction.

Example: `"Had a great day at work #productive #grateful"` → `tags: ["productive", "grateful"]`

### IndexedDB Schema

- **Database name:** `journal-db`  
- **Version:** 1  
- **Object store:** `entries`  
- **Key path:** `id`  
- **Indexes:**  
  - `by-date` on `date` (non-unique; multiple entries per date are allowed)  
  - `by-createdAt` on `createdAt` (for insertion-order sort)  
  - `by-tags` on `tags` (`multiEntry: true`, for future tag filtering)

---

## Screens

### 1\. List View (`/`)

The main screen and entry point of the app.

**Layout (top to bottom):**

- App bar: app name/logo, overflow menu (⋮) with Export CSV and Import CSV actions  
- **Featured card** — the most recent entry displayed prominently:  
  - Full date (e.g. "Friday, May 22, 2026")  
  - Mood emoji \+ label  
  - Entry text, truncated at 300 characters with ellipsis (tap card to read in full)  
  - Tag pills for all tags  
  - Tap anywhere on the card → Read View  
- **History list** — all remaining entries, newest first:  
  - Each row: date, mood emoji, 120-character text preview (ellipsis truncated), tag pills  
  - Tap anywhere on a row → Read View  
- **FAB** (Floating Action Button) — bottom-right corner, `+` icon → New Entry (`/entry/write`)

**Empty state:** If no entries exist, show a centered prompt: "No entries yet — tap \+ to write your first."

---

### 2\. Read View (`/entry/:id`)

Displays a single entry in full, read-only.

**Layout:**

- App bar: back arrow (← returns to List View), "Edit" button (top-right) → Edit View  
- Full date  
- Mood emoji \+ label  
- Full entry text (preserves line breaks)  
- Tag pills for all tags

---

### 3\. Write View (`/entry/write`) and Edit View (`/entry/:id/edit`)

Shared component for creating and editing entries. Write View initializes with defaults; Edit View pre-fills from the existing entry.

**Layout:**

- App bar: back arrow (discards unsaved changes, returns to previous screen), "Save" button (top-right)  
- **Date field** — MUI DatePicker, defaults to today for new entries  
- **Mood selector** — a row of 6 MUI Chip components, one per mood category, single-select, Neutral pre-selected for new entries. Selected chip is visually highlighted.  
- **Text area** — large, multiline MUI TextField, no character limit, auto-grows vertically. Placeholder: "What's on your mind? Use \#tags to categorize."  
- **Tag preview** — below the text area, a live-updating row of detected tag pills. Updates as the user types. Label: "Detected tags:"  
- Save button: the app bar "Save" button and any inline save trigger are the same action — validates that text is non-empty (mood always has a default), writes to IndexedDB, then navigates to Read View for the saved entry.  
- Cancel / back: prompts "Discard changes?" if the form is dirty.

---

## Navigation Structure

/#/                       → List View

/#/entry/write            → Write View (new entry)

/#/entry/:id              → Read View

/#/entry/:id/edit         → Edit View

React Router v6 with `HashRouter`. URLs take the form `/#/entry/:id`. This works with any static host without server-side redirect configuration. Navigation is shallow — no nested layouts beyond the shared app bar pattern per screen.

---

## CSV Export and Import

Accessible via the overflow menu (⋮) on the List View app bar.

### CSV Format

id,date,text,mood,tags,createdAt,updatedAt

- `tags` is serialized as a pipe-separated string: `productive|grateful|work`  
- `text` is quoted and newlines within text are preserved per CSV spec (PapaParse handles this)  
- Dates (`date`) are ISO 8601 strings: `2026-05-22`  
- Timestamps (`createdAt`, `updatedAt`) are Unix milliseconds

### Export

1. User taps "Export CSV" in overflow menu  
2. All entries are read from IndexedDB, sorted by `date` ascending  
3. Serialized to CSV string via PapaParse  
4. Triggered as a browser file download: `journal-export-YYYY-MM-DD.csv`

### Import

1. User taps "Import CSV" in overflow menu  
2. A file picker opens (`.csv` files only)  
3. File is parsed via PapaParse  
4. Each row is validated (required fields: `id`, `date`, `text`, `mood`). If `mood` is present but not one of the 6 valid keys, it is coerced to `neutral` rather than skipping the row.  
5. Tags are taken from the CSV `tags` column as-is (pipe-separated). The CSV value is trusted over re-deriving from text, allowing manually curated tags.  
   Timestamps (`createdAt`, `updatedAt`) are also taken from the CSV as-is, preserving original history on restore.  
6. **Upsert logic:** if an entry with the same `id` already exists in IndexedDB, it is replaced. New `id`s are inserted.  
7. On completion: show a snackbar with count of records imported/updated  
8. On parse error: show an error snackbar with a brief description

---

## Component Structure (suggested)

src/

  main.jsx                  \# App entry, ThemeContextProvider, Router

  theme.js                  \# MUI light and dark theme configuration

  ThemeContext.jsx          \# Theme state management and useTheme hook

  db.js                     \# IndexedDB setup and query helpers (idb)

  utils/

    tagParser.js            \# \#hashtag extraction regex utility

    csvHelpers.js           \# PapaParse export/import logic

  components/

    ThemeToggle.jsx         \# Light/dark mode toggle button

    MoodChip.jsx            \# Single mood display chip (read-only)

    MoodSelector.jsx        \# Clickable mood chip row (write mode)

    TagPills.jsx            \# Renders an array of tag strings as chips

    EntryCard.jsx           \# Featured entry card (List View)

    EntryRow.jsx            \# History list row (List View)

    ConfirmDialog.jsx       \# "Discard changes?" generic dialog

  pages/

    ListView.jsx

    ReadView.jsx

    WriteEditView.jsx       \# Shared for /entry/new and /entry/:id/edit

---

## Error Handling

- **IndexedDB unavailable** (e.g. private browsing on some browsers): show a persistent banner warning that data will not be saved.  
- **Import parse error**: snackbar with message, no data written.  
- **Import validation error** (missing required fields): skip invalid rows, import valid ones, report skipped count in snackbar.  
- **Empty save attempt**: inline validation — text area shows error state if empty on Save.

---

## Future Directions

The following features are explicitly out of scope for this MVP but are natural next steps:

- **Tag filtering** — tap a tag to filter the history list to matching entries  
- **Search** — full-text search across entry bodies  
- **Stats / insights screen** — mood trend chart over time, most-used tags  
- **PWA support** — installable to home screen, offline caching via service worker and `vite-plugin-pwa`  
- **Push notifications** — daily journaling reminders (requires backend)  
- **Cloud sync** — optional account to sync entries across devices  
- **Export formats** — JSON export, Markdown export

---

## Open Questions

*None at time of writing. Update this section if new decisions are deferred during implementation.*  
