// valid-auth.test.ts
import { test, expect } from '../fixtures/test-fixture';
import { users } from '../data/users';
import { handleUserChecks } from '../utils/checkHandlers';

const validUsers = users.filter((u) => u.type === 'valid');
const password = 'secret_sauce';

test.describe('Успешная авторизация', () => {
  for (const user of validUsers) {
    test(`${user.login} — ${user.description || 'Базовая проверка'}`, async ({ page, loginPage, inventoryPage }) => {
      await loginPage.goto();
      const start = Date.now();
      await loginPage.login(user.login, password);
      const duration = Date.now() - start;

      await inventoryPage.validateInventoryPageElements();
      await handleUserChecks(page, inventoryPage, user.login, user.check, duration);
    });
  }
});
