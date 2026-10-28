import test from 'node:test';
import assert from 'node:assert/strict';
import { scriptures } from '../src/data/scriptures.js';
import { quizzes } from '../src/data/quizzes.js';

const devanagari = /[\u0900-\u097f]/u;

function assertHindi(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert.ok(value.trim().length > 0, `${label} must not be empty`);
  assert.match(value, devanagari, `${label} must contain Devanagari text`);
  assert.doesNotMatch(value, /[a-z]/iu, `${label} must not contain English placeholders`);
}

function assertSource(value, label) {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', `${label} must use HTTPS`);
  assert.ok(url.hostname && url.pathname !== '/', `${label} must identify a source document`);
}

test('the library contains each of the five requested scriptures exactly once', () => {
  assert.equal(scriptures.length, 5);
  assert.deepEqual(scriptures.map((book) => book.id).sort(), [
    'bhagavata', 'devi', 'gita', 'ramayana', 'shiva',
  ]);
  assert.match(scriptures.find((book) => book.id === 'shiva').title, /शिव/);
  assert.match(scriptures.find((book) => book.id === 'gita').title, /गीता/);
  assert.match(scriptures.find((book) => book.id === 'ramayana').title, /वाल्मीकि.*रामायण/);
  assert.match(scriptures.find((book) => book.id === 'bhagavata').title, /भागवत/);
  assert.match(scriptures.find((book) => book.id === 'devi').title, /देवी.*भागवत/);
});

test('every scripture offers multiple Sanskrit verses with Hindi meanings and traceable references', () => {
  for (const book of scriptures) {
    for (const field of ['title', 'subtitle', 'description', 'deity']) {
      assertHindi(book[field], `${book.id}.${field}`);
    }
    assertSource(book.sourceUrl, `${book.id}.sourceUrl`);
    assert.ok(book.verses.length >= 3, `${book.id} must have at least three selections`);
    for (const verse of book.verses) {
      const label = `${book.id}/${verse.id}`;
      assertHindi(verse.sanskrit, `${label}.sanskrit`);
      assert.match(verse.sanskrit, /[।॥]/u, `${label} must contain verse punctuation`);
      assertHindi(verse.translation, `${label}.translation`);
      assert.notEqual(verse.sanskrit, verse.translation, `${label} needs a Hindi meaning`);
      assertHindi(verse.reference, `${label}.reference`);
      assert.match(verse.reference, /[०-९0-9]/u, `${label} needs a numbered reference`);
      assertHindi(verse.chapter, `${label}.chapter`);
      assertSource(verse.sourceUrl, `${label}.sourceUrl`);
    }
  }
});

test('book, verse and quiz identifiers are unique within their storage namespaces', () => {
  const verseIds = scriptures.flatMap((book) => book.verses.map((verse) => verse.id));
  for (const [label, ids] of [
    ['books', scriptures.map((book) => book.id)],
    ['verses', verseIds],
    ['quizzes', quizzes.map((quiz) => quiz.id)],
  ]) {
    assert.ok(ids.every((id) => typeof id === 'string' && id.length > 0), `${label}: IDs are required`);
    assert.equal(new Set(ids).size, ids.length, `${label}: IDs must not collide`);
  }
});

test('five complete quizzes provide 25 answerable Hindi questions and explanations', () => {
  assert.equal(quizzes.length, 5);
  const questions = quizzes.flatMap((quiz) => quiz.questions);
  assert.equal(questions.length, 25);
  assert.equal(new Set(questions.map((question) => question.question)).size, questions.length);
  for (const quiz of quizzes) {
    assertHindi(quiz.title, `${quiz.id}.title`);
    assertHindi(quiz.subtitle, `${quiz.id}.subtitle`);
    assert.equal(quiz.questions.length, 5, `${quiz.id} must contain five questions`);
    for (const question of quiz.questions) {
      assertHindi(question.question, `${quiz.id}: question`);
      assert.equal(question.options.length, 4);
      assert.equal(new Set(question.options).size, 4, 'Answer options must be distinguishable');
      question.options.forEach((option) => assertHindi(option, `${quiz.id}: option`));
      assert.ok(Number.isInteger(question.answer), 'Correct answers use integer option indices');
      assert.ok(question.answer >= 0 && question.answer < question.options.length);
      assertHindi(question.explanation, `${quiz.id}: explanation`);
    }
    assert.ok(new Set(quiz.questions.map((question) => question.answer)).size >= 3,
      `${quiz.id} must vary the correct answer position`);
  }
  assert.deepEqual([...new Set(questions.map((question) => question.answer))].sort(), [0, 1, 2, 3]);
});
