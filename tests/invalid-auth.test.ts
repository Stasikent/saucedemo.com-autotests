// invalid-auth.test.ts
import { test, expect } from '../fixtures/test-fixture';
import { users } from '../data/users';

const invalidUsers = users.filter((u) => u.type === 'invalid');
const password = 'secret_sauce';

test.describe('Ошибки авторизации', () => {
  for (const user of invalidUsers) {
    test(`${user.login} — ${user.description || 'Ошибка авторизации'}`, async ({ page, loginPage }) => {
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
