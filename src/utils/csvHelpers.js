import Papa from 'papaparse';
import { getAllEntries, upsertEntries } from '../db';
import { extractTags } from './tagParser';
import { coerceMood } from './moods';

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
      complete: ({ data, errors }) => {
        if (errors?.length) {
          reject(errors[0]);
          return;
        }
        const valid = [];
        let skipped = 0;
        for (const row of data) {
          if (!row.id || !row.date || !row.text || !row.mood) {
            skipped++;
            continue;
          }
          valid.push({
            id: row.id,
            date: row.date,
            text: row.text,
            mood: coerceMood(row.mood),
            tags: extractTags(row.text),
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

export async function importCSV(entries) {
  await upsertEntries(entries);
  return { imported: entries.length };
}
