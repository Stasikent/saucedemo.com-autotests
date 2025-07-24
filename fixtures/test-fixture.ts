// === test-fixture.ts ===
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { InventoryPage } from '../pages/inventoryPage';
// import { users } from '../data/users';
// import { handleUserChecks } from '../utils/checkHandlers';

export const test = base.extend<{
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  inventoryPage: async ({ page }, use) => {
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';