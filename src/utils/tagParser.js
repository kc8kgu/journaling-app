const TAG_PATTERN = /#(\w+)/g;

export function extractTags(text) {
  if (!text) return [];
  const matches = [...text.matchAll(TAG_PATTERN)];
  const unique = [...new Set(matches.map((m) => m[1].toLowerCase()))];
  return unique;
}
