import Papa from 'papaparse';
import { getAllEntries, upsertEntries } from '../db';

const VALID_MOODS = new Set(['happy', 'calm', 'neutral', 'sad', 'frustrated', 'anxious']);
const COLUMNS = ['id', 'date', 'text', 'mood', 'tags', 'createdAt', 'updatedAt'];

export function exportCSV(entries) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const rows = sorted.map((e) => ({
    ...e,
    tags: e.tags.join('|'),
  }));
  const csv = Papa.unparse({ fields: COLUMNS, data: rows });
  const dateStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `journal-export-${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function triggerExport() {
  const entries = await getAllEntries();
  exportCSV(entries);
}

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const valid = [];
        let skipped = 0;
        for (const row of data) {
          if (!row.id || !row.date || !row.text || !row.mood) {
            skipped++;
            continue;
          }
          const mood = VALID_MOODS.has(row.mood) ? row.mood : 'neutral';
          const tags = row.tags ? row.tags.split('|').filter(Boolean) : [];
          valid.push({
            id: row.id,
            date: row.date,
            text: row.text,
            mood,
            tags,
            createdAt: Number(row.createdAt) || Date.now(),
            updatedAt: Number(row.updatedAt) || Date.now(),
          });
        }
        resolve({ entries: valid, skipped });
      },
      error: reject,
    });
  });
}

export async function importCSV(file) {
  const { entries, skipped } = await parseCSV(file);
  await upsertEntries(entries);
  return { imported: entries.length, skipped };
}
