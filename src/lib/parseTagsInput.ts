/** Split comma-separated tags without breaking spaces inside a tag. */
export const parseTagsInput = (raw: string): string[] => {
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};
