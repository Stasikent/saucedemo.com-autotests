import { test, expect } from '@playwright/test';

const username = "standard_user";
const username_l = "locked_out_user";
const password = "secret_sauce";

test.describe('Логин', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    // await page.locator('[data-test="username"]').click();
    // await page.locator('[data-test="username"]').fill(username);
    // await page.locator('[data-test="password"]').click();
    // await page.locator('[data-test="password"]').fill(password);
    // await page.locator('[data-test="login-button"]').click();
  });

  test('test_success_login', async ({ page }) => {
    await page.locator('[data-test="username"]').click();
    await page.locator('[data-test="username"]').fill(username);
    await page.locator('[data-test="password"]').click();
    await page.locator('[data-test="password"]').fill(password);
    await page.locator('[data-test="login-button"]').click();
    await expect(page.locator('[data-test="product-sort-container"]')).toBeVisible();
    await page.locator('[data-test="product-sort-container"]').selectOption('hilo');
    await expect(page.locator('[data-test="product-sort-container"]')).toContainText('Price (high to low)');
    await expect(page.locator('[data-test="inventory-list"]')).toContainText('$49.99');
  });

  test('test_error_login', async ({ page }) => {
    await page.locator('[data-test="username"]').click();
    await page.locator('[data-test="username"]').fill(username_l);
    await page.locator('[data-test="password"]').click();
    await page.locator('[data-test="password"]').fill(password);
    await page.locator('[data-test="login-button"]').click();
    await expect(page.locator('[data-test="error"]')).toContainText('Epic sadface: Sorry, this user has been locked out.');
  });
});
// test('test_checkout', async ({ page }) => {
//   await page.getByText('Name (A to Z)Name (A to Z)').click();
//   await page.locator('[data-test="product-sort-container"]').selectOption('hilo');
//   await expect(page.locator('[data-test="product-sort-container"]')).toContainText('Price (high to low)');
//   await expect(page.locator('[data-test="inventory-list"]')).toContainText('$49.99');
//   await page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click();
//   await expect(page.locator('[data-test="remove-sauce-labs-fleece-jacket"]')).toContainText('Remove');
//   await expect(page.locator('[data-test="shopping-cart-badge"]')).toContainText('1');
//   await page.locator('[data-test="shopping-cart-link"]').click();
//   await expect(page.locator('[data-test="checkout"]')).toContainText('Checkout');
// });

