import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyVerse, hindiNumber, normalize, readSaved, searchScriptures } from '../src/lib.js';
import { scriptures } from '../src/data/scriptures.js';

const ids = (books) => books.map((book) => book.id);
const validIds = scriptures.flatMap((book) => book.verses.map((verse) => verse.id));
const storageWith = (value) => ({
  getItem(key) {
    assert.equal(key, 'anant-sanatan-saved');
    return value;
  },
});

test('normalization preserves meaningful Unicode and ignores case, punctuation and excess whitespace', () => {
  assert.equal(normalize('  धर्मः।   कर्म॥\nज्ञान! '), 'धर्मः कर्म ज्ञान');
  assert.equal(normalize('CAFÉ'), normalize('cafe\u0301'));
  assert.equal(normalize('क़'), normalize('क़'));
  assert.equal(normalize('  ॥ ।  '), '');
});

test('Sanskrit, Hindi meaning, book title and numbered reference searches find the expected book', () => {
  assert.deepEqual(ids(searchScriptures(scriptures, 'कर्मण्येवाधिकारस्ते')), ['gita']);
  assert.deepEqual(ids(searchScriptures(scriptures, 'निष्काम')), ['bhagavata']);
  assert.deepEqual(ids(searchScriptures(scriptures, '  वाल्मीकि   रामायण  ')), ['ramayana']);
  assert.deepEqual(ids(searchScriptures(scriptures, 'अध्याय १२ श्लोक १३')), ['gita']);
  assert.deepEqual(ids(searchScriptures(scriptures, 'आदिशक्ति')), ['devi']);
});

test('category filters combine with search and empty queries return the selected collection', () => {
  assert.deepEqual(searchScriptures(scriptures, ''), scriptures);
  assert.deepEqual(searchScriptures(scriptures, ' \n\t '), scriptures);
  assert.deepEqual(ids(searchScriptures(scriptures, '', 'shiva')), ['shiva']);
  assert.deepEqual(ids(searchScriptures(scriptures, 'कर्मण्येवाधिकारस्ते', 'gita')), ['gita']);
  assert.deepEqual(searchScriptures(scriptures, 'कर्मण्येवाधिकारस्ते', 'shiva'), []);
  assert.deepEqual(searchScriptures(scriptures, '', 'unknown-book'), []);
  assert.deepEqual(searchScriptures(scriptures, 'this phrase is not in the library'), []);
  assert.deepEqual(searchScriptures([], 'धर्म'), []);
});

test('saved verses retain known IDs once, preserve their order and reject obsolete or non-string entries', () => {
  const first = validIds[0], last = validIds.at(-1);
  const json = JSON.stringify([last, first, last, 'removed-verse', null, 17, { id: first }]);
  assert.deepEqual(readSaved(storageWith(json), validIds), [last, first]);
  assert.deepEqual(readSaved(storageWith(JSON.stringify([first])), []), []);
});

test('missing, corrupt and non-array saved data do not crash the reader', () => {
  for (const value of [null, '', '{broken', 'null', '{}', '42', '"gita-1"']) {
    assert.deepEqual(readSaved(storageWith(value), validIds), [], `Unsupported data: ${value}`);
  }
});

test('storage access failures gracefully produce an empty collection', () => {
  assert.deepEqual(readSaved({ getItem() { throw new Error('Storage is blocked'); } }, validIds), []);
  assert.deepEqual(readSaved(undefined, validIds), []);
});

test('daily verse is deterministic throughout a calendar day and advances across every selection', () => {
  const morning = new Date(2026, 9, 28, 0, 1);
  const evening = new Date(2026, 9, 28, 23, 59);
  const selected = dailyVerse(scriptures, morning);
  assert.deepEqual(dailyVerse(scriptures, evening), selected);
  assert.ok(scriptures.includes(selected.book));
  assert.ok(selected.book.verses.includes(selected.verse));

  const count = validIds.length;
  const sequence = Array.from({ length: count }, (_, offset) =>
    dailyVerse(scriptures, new Date(2026, 9, 28 + offset, 12)).verse.id);
  assert.equal(new Set(sequence).size, count, 'A cycle should visit every selected verse');
  assert.equal(dailyVerse(scriptures, new Date(2026, 9, 28 + count, 12)).verse.id, selected.verse.id);
  assert.notEqual(sequence[0], sequence[1], 'The next calendar day should select another verse');
});

test('daily selection also handles dates before the Unix epoch', () => {
  const result = dailyVerse(scriptures, new Date(1969, 11, 31, 12));
  assert.equal(result.verse.id, validIds.at(-1));
});

test('numeric UI labels use Devanagari digits', () => {
  assert.equal(hindiNumber(5), '५');
  assert.equal(hindiNumber(25), '२५');
  assert.equal(hindiNumber(0), '०');
});
