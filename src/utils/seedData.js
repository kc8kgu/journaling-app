import { v4 as uuidv4 } from 'uuid';
import { upsertEntries } from '../db';

const entries = [
  {
    date: '2026-05-24',
    mood: 'happy',
    text: "Really productive day today. Knocked out the ListView prototype and it's looking solid. Excited to keep the momentum going. #productive #coding #momentum",
  },
  {
    date: '2026-05-23',
    mood: 'calm',
    text: "Slow morning with coffee and a long walk. No agenda, just enjoyed the quiet. Sometimes that's exactly what you need. #mindfulness #rest",
  },
  {
    date: '2026-05-22',
    mood: 'anxious',
    text: "Big presentation at work today. Spent the morning rehearsing and second-guessing every slide. It ended up going fine but the lead-up was rough. #work #presentation #stress",
  },
  {
    date: '2026-05-21',
    mood: 'neutral',
    text: "Ordinary Wednesday. Groceries, laundry, a bit of reading. Nothing to write home about but nothing went wrong either.",
  },
  {
    date: '2026-05-20',
    mood: 'frustrated',
    text: "Spent three hours debugging a config issue that turned out to be a single missing environment variable. I can't get that time back. #debugging #devlife #frustrated",
  },
  {
    date: '2026-05-18',
    mood: 'sad',
    text: "Caught up with an old friend I hadn't spoken to in years. Good conversation, but it made me realize how much time has passed and how much has changed. Bittersweet. #friendship #nostalgia",
  },
  {
    date: '2026-05-15',
    mood: 'happy',
    text: "Weekend hike with the group. Perfect weather, great views from the top. Exactly the reset I needed after a hectic week. #hiking #outdoors #weekend #grateful",
  },
];

export async function seedDummyData() {
  const now = Date.now();
  const seeded = entries.map((e, i) => {
    const tags = [...e.text.matchAll(/#(\w+)/g)].map((m) => m[1].toLowerCase());
    return {
      id: uuidv4(),
      date: e.date,
      text: e.text,
      mood: e.mood,
      tags,
      createdAt: now - i * 60000,
      updatedAt: now - i * 60000,
    };
  });
  await upsertEntries(seeded);
}
