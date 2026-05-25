export function sortEntriesByJournalDate(entries) {
  return [...entries].sort((a, b) => {
    const dateCompare = String(b.date).localeCompare(String(a.date));
    if (dateCompare !== 0) return dateCompare;
    return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
  });
}
