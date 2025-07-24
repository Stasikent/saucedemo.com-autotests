import { test, expect } from '../fixtures/test-fixture';
import fs from 'fs';
import type { Page } from '@playwright/test';
import type { InventoryPage } from '../pages/inventoryPage';

// Тип пользователя
type User = {
  login: string;
  type: 'valid' | 'invalid';
  check?: 'images' | 'delay' | 'sortError' | 'visual';
  error?: string;
};

const users: User[] = [
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

async function handleUserChecks(user: User, inventoryPage: InventoryPage, page: Page, duration: number) {
  switch (user.check) {
    case 'images': {
      const images = await inventoryPage.getImageSources();
      expect(images.every(src => src === images[0])).toBe(true);
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
}

users.forEach(user => {
  test(`${user.type === 'valid' ? '✅ Успешная' : '❌ Ошибка'} авторизация: ${user.login}`, async ({ page, loginPage, inventoryPage }) => {
    let duration = 0;

    await test.step('Открытие страницы и авторизация', async () => {
      const start = Date.now();
      await loginPage.goto();
      await loginPage.login(user.login, password);
      duration = Date.now() - start;
    });

    if (user.type === 'valid') {
      await inventoryPage.validateInventoryPageElements();

      if (user.check) {
        await test.step(`Проверка особенностей пользователя: ${user.check}`, async () => {
          await handleUserChecks(user, inventoryPage, page, duration);
        });
      }
    } else {
      await test.step('Проверка сообщения об ошибке', async () => {
        const error = page.locator('[data-test="error"]');
        await expect(error).toBeVisible();
        if (user.error) {
          await expect(error).toContainText(user.error);
        }
      });
    }
  });
});