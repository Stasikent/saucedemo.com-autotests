// === test file (e.g., auth.test.ts) ===
import { test, expect } from '../fixtures/test-fixture';
import fs from 'fs';

const users: {
  login: string;
  type: 'valid' | 'invalid';
  check?: 'images' | 'delay' | 'sortError' | 'visual';
  error?: string;
}[] = [
  { login: 'standard_user', type: 'valid' },
  { login: 'problem_user', type: 'valid', check: 'images' },
  { login: 'performance_glitch_user', type: 'valid', check: 'delay' },
  { login: 'error_user', type: 'valid', check: 'sortError' },
  { login: 'visual_user', type: 'valid', check: 'visual' },
  {
    login: 'locked_out_user',
    type: 'invalid',
    error: 'Epic sadface: Sorry, this user has been locked out.'
  }
];

const password = 'secret_sauce';

function ensureScreenshotDir() {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots', { recursive: true });
  }
}

users.forEach(user => {
  if (user.type === 'valid') {
    test(`Успешная авторизация: ${user.login}`, async ({ page, loginPage, inventoryPage }) => {
      await loginPage.goto();
      const start = Date.now();
      await loginPage.login(user.login, password);
      const duration = Date.now() - start;
      await inventoryPage.validateInventoryPageElements();

      switch (user.check) {
        case 'images': {
          const images = await inventoryPage.getImageSources();
          const first = images[0];
          for (const src of images) expect(src).toBe(first);
          break;
        }
        case 'delay': {
          console.log(`⏱ Время входа: ${duration} мс`);
          expect(duration).toBeGreaterThan(3000);
          break;
        }
        case 'sortError': {
          try {
            await inventoryPage.sortDropdown.selectOption('hilo');
          } catch (err) {
            console.error('❗ Ошибка при сортировке:', err);
          }
          if (await inventoryPage.errorBanner.isVisible()) {
            const text = await inventoryPage.errorBanner.textContent();
            console.log('⚠️ Ошибка на странице:', text);
          }
          break;
        }
        case 'visual': {
          const prices = await inventoryPage.getItemPrices();
          const unique = [...new Set(prices)];
          console.log('🔍 Цены:', prices);
          if (unique.length > 3) {
            console.warn('⚠️ Слишком много уникальных цен');
          }
          const box = await inventoryPage.getFirstItemBox();
          if (!box || box.height < 100) {
            console.warn('⚠️ Возможный визуальный баг');
          }
          ensureScreenshotDir();
          await page.screenshot({ path: `screenshots/${user.login}.png`, fullPage: true });
          break;
        }
      }
    });
  } else {
    test(`Ошибка при авторизации: ${user.login}`, async ({ page, loginPage }) => {
      await loginPage.goto();
      await loginPage.login(user.login, password);
      const error = page.locator('[data-test="error"]');
      await expect(error).toBeVisible();
      if (typeof user.error === 'string') {
        await expect(error).toContainText(user.error);
      }
    });
  }
});