// valid-auth.test.ts
import { test, expect } from '../fixtures/test-fixture';
import { users } from '../data/users';

const validUsers = users.filter((u) => u.type === 'valid');
const password = 'secret_sauce';

test.describe('Успешная авторизация', () => {
  for (const user of validUsers) {
    test(`${user.login} — ${user.description || 'Базовая проверка'}`, async ({ page, loginPage}) => {
      await loginPage.goto();
      const start = Date.now();
      await loginPage.login(user.login, password);
      const duration = Date.now() - start;
      console.log(`⏱ Авторизация ${user.login} прошла за ${duration} мс.`);
    });
  }
});
