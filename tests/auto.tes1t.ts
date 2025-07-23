// Документ для автотестов на https://www.saucedemo.com/

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage.ts';
import { InventoryPage } from '../pages/inventoryPage.ts';

test.describe('Успешная авторизация', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
  });

  test('Авторизация с логином standard_user', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(inventoryPage.sortDropdown).toBeVisible();
  });

  test('Авторизация с логином problem_user — все изображения товаров одинаковые', async ({ page }) => {
    await loginPage.login('problem_user', 'secret_sauce');
    const images = await inventoryPage.getImageSources();
    const first = images[0];
    for (const src of images) {
      expect(src).toBe(first);
    }
  });

  test('Авторизация с логином performance_glitch_user — увеличенное время загрузки', async ({ page }) => {
    const start = Date.now();
    await loginPage.login('performance_glitch_user', 'secret_sauce');
    const duration = Date.now() - start;
    console.log(`⏱ Время входа: ${duration} мс`);
    await expect(inventoryPage.sortDropdown).toBeVisible();
    expect(duration).toBeGreaterThan(3000);
  });

  test('Авторизация с логином error_user — ошибка при сортировке', async ({ page }) => {
    await loginPage.login('error_user', 'secret_sauce');
    try {
      await inventoryPage.sortDropdown.selectOption('hilo');
    } catch (err) {
      console.error('❗ Ошибка при сортировке:', err);
    }
    const error = inventoryPage.errorBanner;
    if (await error.isVisible()) {
      console.log('⚠️ Ошибка на странице:', await error.textContent());
    }
  });

  test('Авторизация с логином visual_user — рандомные цены и сломанный UI', async ({ page }) => {
    await loginPage.login('visual_user', 'secret_sauce');
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
    await page.screenshot({ path: 'screenshots/visual_user.png', fullPage: true });
  });
});

test.describe('Авторизация с ошибкой', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Ошибка при входе с логином locked_out_user', async ({ page }) => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    const error = page.locator('[data-test="error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Epic sadface: Sorry, this user has been locked out.');
  });
});
