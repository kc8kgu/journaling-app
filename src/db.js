import { openDB } from 'idb';

const DB_NAME = 'journal-db';
const DB_VERSION = 1;
const STORE = 'entries';

function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE, { keyPath: 'id' });
      store.createIndex('by-date', 'date');
      store.createIndex('by-createdAt', 'createdAt');
      store.createIndex('by-tags', 'tags', { multiEntry: true });
    },
  });
}

let dbPromise;
function getDB() {
  if (!dbPromise) dbPromise = initDB();
  return dbPromise;
}

export async function getAllEntries() {
  const db = await getDB();
  return db.getAllFromIndex(STORE, 'by-createdAt');
}

export async function getEntry(id) {
  const db = await getDB();
  return db.get(STORE, id);
}

export async function saveEntry(entry) {
  const db = await getDB();
  await db.put(STORE, entry);
}

export async function deleteEntry(id) {
  const db = await getDB();
  await db.delete(STORE, id);
}

export async function upsertEntries(entries) {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readwrite');
  await Promise.all([...entries.map((e) => tx.store.put(e)), tx.done]);
}
