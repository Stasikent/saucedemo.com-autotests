// === auth.test.ts ===
import { test, expect } from '../fixtures/test-fixture';
import { users } from '../data/users';
import { handleUserChecks } from '../utils/checkHandlers';

const password = 'secret_sauce';

users.forEach(user => {
  if (user.type === 'valid') {
    test(`✅ Успешная авторизация: ${user.login} — ${user.description}`, async ({ page, loginPage, inventoryPage }) => {
      await loginPage.goto();
      const start = Date.now();
      await loginPage.login(user.login, password);
      const duration = Date.now() - start;
      await inventoryPage.validateInventoryPageElements();
      await handleUserChecks(user.check, page, inventoryPage, user.login, duration);
    });
  } else {
    test(`❌ Ошибка при авторизации: ${user.login} — ${user.description}`, async ({ page, loginPage }) => {
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