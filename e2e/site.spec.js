import { test, expect } from '@playwright/test';
import { scriptures } from '../src/data/scriptures.js';
import { quizzes } from '../src/data/quizzes.js';

test('loads the Hindi site, artwork and all requested scriptures without browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/अनन्त सनातन/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await expect(page.locator('.book-card')).toHaveCount(5);
  await expect(page.locator('.quiz-card')).toHaveCount(5);
  await expect(page.getByText('Vaibhav Thakur', { exact: true })).toBeVisible();
  await expect(page.locator('.hero-art img')).toBeVisible();
  expect(await page.locator('.hero-art img').evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(errors).toEqual([]);
});

test('filters by scripture and searches actual Sanskrit and Hindi content', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'शिव पुराण', exact: true }).click();
  await expect(page.locator('.book-card')).toHaveCount(1);
  await expect(page.locator('.book-card h3')).toHaveText('शिव पुराण');
  await page.getByRole('button', { name: 'सभी ग्रंथ', exact: true }).click();
  const search = page.getByRole('searchbox');
  await search.fill('कर्मण्येवाधिकारस्ते');
  await expect(page.locator('.book-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'श्रीमद्भगवद्गीता पढ़ें' }).click();
  await expect(page.getByRole('dialog').locator('.reader-sanskrit')).toContainText('कर्मण्येवाधिकारस्ते');
  await page.getByRole('button', { name: 'बंद करें', exact: true }).click();
  await search.fill('not-a-real-scripture');
  await expect(page.getByText('इस खोज से कोई ग्रंथ नहीं मिला')).toBeVisible();
  await page.getByRole('button', { name: 'सभी ग्रंथ देखें', exact: true }).click();
  await expect(page.locator('.book-card')).toHaveCount(5);
});

test('all fifteen verses open with Hindi meanings, source links and correct navigation bounds', async ({ page }) => {
  await page.goto('/');
  for (const book of scriptures) {
    await page.getByRole('button', { name: `${book.title} पढ़ें`, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'पिछला श्लोक' })).toBeDisabled();
    for (let i = 0; i < book.verses.length; i++) {
      await expect(dialog.locator('.reader-sanskrit')).toHaveText(book.verses[i].sanskrit);
      await expect(dialog.locator('.translation-block p')).toHaveText(book.verses[i].translation);
      await expect(dialog.getByRole('link', { name: 'मूल पाठ का स्रोत' })).toHaveAttribute('href', book.verses[i].sourceUrl);
      if (i < book.verses.length - 1) await dialog.getByRole('button', { name: 'अगला श्लोक' }).click();
    }
    await expect(dialog.getByRole('button', { name: 'अगला श्लोक' })).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }
});

test('bookmarks persist on reload, can be reopened and removed', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'शिव पुराण पढ़ें', exact: true }).click();
  await page.getByRole('button', { name: 'श्लोक सहेजें', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.reload();
  await page.getByRole('button', { name: 'सहेजे गए श्लोक (1)', exact: true }).click();
  await expect(page.locator('.saved-verse')).toHaveCount(1);
  await page.locator('.saved-verse-open').click();
  await expect(page.getByRole('dialog').locator('.reader-sanskrit')).toHaveText(scriptures[0].verses[0].sanskrit);
  await page.getByRole('button', { name: 'श्लोक संग्रह से हटाएँ', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'सहेजे गए श्लोक (0)', exact: true }).click();
  await expect(page.getByText('आपका संग्रह अभी खाली है')).toBeVisible();
});

test('reader keyboard focus stays inside the dialog and restores on Escape', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'शिव पुराण पढ़ें', exact: true });
  await trigger.click();
  await expect(page.getByRole('button', { name: 'बंद करें', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'अगला श्लोक', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'बंद करें', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

for (const quiz of quizzes) {
  test(`${quiz.id}: completes all five questions with feedback, scoring and restart`, async ({ page }) => {
    await page.goto('/');
    await page.locator('.quiz-card').filter({ hasText: quiz.title }).click();
    for (let i = 0; i < quiz.questions.length; i++) {
      await expect(page.locator('.quiz-question')).toHaveText(quiz.questions[i].question);
      const next = page.getByRole('button', { name: i === quiz.questions.length - 1 ? 'परिणाम देखें' : 'अगला प्रश्न', exact: true });
      await expect(next).toBeDisabled();
      // Deliberately miss the first question: verifies wrong feedback and non-perfect scoring.
      const answer = i === 0 ? (quiz.questions[i].answer + 1) % 4 : quiz.questions[i].answer;
      await page.locator('.quiz-option').nth(answer).click();
      await expect(page.locator('.answer-explanation')).toContainText(quiz.questions[i].explanation);
      await expect(page.locator('.quiz-option.correct')).toHaveCount(1);
      await next.click();
    }
    await expect(page.locator('.result-score')).toHaveText('४ / ५');
    await expect(page.locator('.result-review > div')).toHaveCount(5);
    await page.getByRole('button', { name: 'फिर से खेलें' }).click();
    await expect(page.locator('.quiz-question')).toHaveText(quiz.questions[0].question);
    await expect(page.locator('.answer-explanation')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'अगला प्रश्न', exact: true })).toBeDisabled();
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`responsive layout has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width <= 700) {
      const menu = page.getByRole('button', { name: 'मेन्यू खोलें' });
      await menu.click();
      await page.getByRole('navigation').getByRole('link', { name: 'प्रश्नोत्तरी', exact: true }).click();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
    }
    await page.getByRole('button', { name: 'शिव पुराण पढ़ें', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await page.getByRole('dialog').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  });
}

test('reader font controls and clipboard retain the Sanskrit, Hindi meaning and book attribution', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'शिव पुराण पढ़ें', exact: true }).click();
  const verse = page.locator('.reader-sanskrit');
  const originalSize = await verse.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  await page.getByRole('button', { name: 'अक्षर बड़े करें' }).click();
  expect(await verse.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(originalSize);
  await page.getByRole('button', { name: 'अक्षर छोटे करें' }).click();
  expect(await verse.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBe(originalSize);
  await page.getByRole('button', { name: 'श्लोक की प्रतिलिपि बनाएँ', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('श्लोक और हिंदी भावार्थ की प्रतिलिपि बन गई।');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain(scriptures[0].verses[0].sanskrit);
  expect(clipboard).toContain(scriptures[0].verses[0].translation);
  expect(clipboard).toContain('शिव पुराण');
  expect(clipboard).toContain('वैभव ठाकुर');
});
