export const hindiNumber = (value) => new Intl.NumberFormat('hi-IN-u-nu-deva').format(value);

export function normalize(value) {
  return value.normalize('NFC').toLocaleLowerCase('hi').replace(/[।॥.,:;!?]/g, '').replace(/\s+/g, ' ').trim();
}

export function searchScriptures(scriptures, query, category = 'all') {
  const needle = normalize(query);
  return scriptures.filter((book) => {
    if (category !== 'all' && book.id !== category) return false;
    const haystack = [book.title, book.description, book.deity, ...book.verses.flatMap((verse) => [verse.sanskrit, verse.translation, verse.reference])].join(' ');
    return !needle || normalize(haystack).includes(needle);
  });
}

export function readSaved(storage, validIds) {
  try {
    const data = JSON.parse(storage.getItem('anant-sanatan-saved') || '[]');
    if (!Array.isArray(data)) return [];
    return [...new Set(data.filter((id) => typeof id === 'string' && validIds.includes(id)))];
  } catch { return []; }
}

export function dailyVerse(scriptures, date = new Date()) {
  const verses = scriptures.flatMap((book) => book.verses.map((verse) => ({ book, verse })));
  // Use the calendar date, so this selection stays stable throughout the day.
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return verses[((day % verses.length) + verses.length) % verses.length];
}
