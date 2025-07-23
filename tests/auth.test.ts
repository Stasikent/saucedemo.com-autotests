import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { InventoryPage } from '../pages/inventoryPage';

const users = [
  { login: 'standard_user', type: 'valid' },
  { login: 'problem_user', type: 'valid', check: 'images' },
  { login: 'performance_glitch_user', type: 'valid', check: 'delay' },
  { login: 'error_user', type: 'valid', check: 'sortError' },
  { login: 'visual_user', type: 'valid', check: 'visual' },
  { login: 'locked_out_user', type: 'invalid', error: 'Epic sadface: Sorry, this user has been locked out.' }
];

const password = 'secret_sauce';

users.forEach(user => {
  if (user.type === 'valid') {
    test(`Успешная авторизация: ${user.login}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);

      await loginPage.goto();
      const start = Date.now();
      await loginPage.login(user.login, password);
      const duration = Date.now() - start;
      await inventoryPage.validateInventoryPageElements();

      if (user.check === 'images') {
        const images = await inventoryPage.getImageSources();
        const first = images[0];
        for (const src of images) expect(src).toBe(first);
      }

      if (user.check === 'delay') {
        console.log(`⏱ Время входа: ${duration} мс`);
        expect(duration).toBeGreaterThan(3000);
      }

      if (user.check === 'sortError') {
        try {
          await inventoryPage.sortDropdown.selectOption('hilo');
        } catch (err) {
          console.error('❗ Ошибка при сортировке:', err);
        }
        if (await inventoryPage.errorBanner.isVisible()) {
          const text = await inventoryPage.errorBanner.textContent();
          console.log('⚠️ Ошибка на странице:', text);
        }
      }

      if (user.check === 'visual') {
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
        await page.screenshot({ path: `screenshots/${user.login}.png`, fullPage: true });
      }
    });
  } else {
    test(`Ошибка при авторизации: ${user.login}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(user.login, password);

      const error = page.locator('[data-test="error"]');
      await expect(error).toBeVisible();
if (user.error) {
  await expect(error).toContainText(user.error);
}
    });
  }
});
