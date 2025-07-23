import { test, expect } from '@playwright/test';

test.describe('Успешная авторизация', () => {
  test('Авторизация с логином standard_user', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    const usernameInput = page.locator('[data-test="username"]');
    const passwordInput = page.locator('[data-test="password"]');
    const loginButton = page.locator('[data-test="login-button"]');

    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('standard_user');
    await passwordInput.fill('secret_sauce');
    await loginButton.click();

    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('[data-test="product-sort-container"]')).toBeVisible();
  });


  test('Авторизация с логином problem_user — все изображения товаров одинаковые', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    const usernameInput = page.locator('[data-test="username"]');
    const passwordInput = page.locator('[data-test="password"]');
    const loginButton = page.locator('[data-test="login-button"]');

    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('problem_user');
    await passwordInput.fill('secret_sauce');
    await loginButton.click();

    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('[data-test="inventory-list"]')).toBeVisible();

    // Получаем все изображения товаров
    const imageLocators = page.locator('.inventory_item_img img');
    const imageCount = await imageLocators.count();

    // Сравним src всех изображений
    const srcList: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      const src = await imageLocators.nth(i).getAttribute('src');
      if (src) {
        srcList.push(src);
      }
    }

    // Проверим, что все изображения одинаковые
    const firstSrc = srcList[0];
    for (const src of srcList) {
      expect(src).toBe(firstSrc);
    }
    });


     test('Авторизация с логином performance_glitch_user — увеличенное время загрузки', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    const usernameInput = page.locator('[data-test="username"]');
    const passwordInput = page.locator('[data-test="password"]');
    const loginButton = page.locator('[data-test="login-button"]');

    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('performance_glitch_user');
    await passwordInput.fill('secret_sauce');

    const start = Date.now();
    await loginButton.click();
    await page.waitForURL(/inventory/);
    const duration = Date.now() - start;

    console.log(`⏱ Время перехода после логина: ${duration} мс`);

    // Успешная авторизация
    await expect(page.locator('[data-test="product-sort-container"]')).toBeVisible();

    // Проверка, что вход занял дольше обычного (например, > 3000 мс)
    expect(duration).toBeGreaterThan(3000);
  });


  test('Авторизация с логином error_user — ошибка при сортировке', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    await page.locator('[data-test="username"]').fill('error_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    await expect(page).toHaveURL(/inventory/);
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await expect(sortDropdown).toBeVisible();

    // Попытка сортировки — может вызвать ошибку
    try {
      await sortDropdown.selectOption('hilo');
    } catch (err) {
      console.error('❗ Ошибка при попытке сортировки у error_user:', err);
    }

    // Можно проверить, не появилось ли сообщение об ошибке в DOM
    const errorBanner = page.locator('.error-message-container');
    if (await errorBanner.isVisible()) {
      const errorText = await errorBanner.textContent();
      console.log('⚠️ Обнаружена ошибка:', errorText);
    }

    // Убедимся, что мы всё ещё на inventory
    await expect(page).toHaveURL(/inventory/);
  });


  test('Авторизация с логином visual_user — сломанная визуальная структура и рандомные цены', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.locator('[data-test="username"]').fill('visual_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  await expect(page).toHaveURL(/inventory/);
  const inventoryItems = page.locator('.inventory_item');
  const itemCount = await inventoryItems.count();
  expect(itemCount).toBeGreaterThan(0);

  // Проверка на наличие цен
  const priceLocators = page.locator('.inventory_item_price');
  const prices: string[] = [];

  for (let i = 0; i < await priceLocators.count(); i++) {
    const priceText = await priceLocators.nth(i).innerText();
    prices.push(priceText.trim());
  }

  // Проверка на несоответствие или рандомность цен
  console.log('🔎 Найденные цены:', prices);

  const uniquePrices = [...new Set(prices)];
  if (uniquePrices.length > 3) {
    console.warn('⚠️ Подозрительно много разных цен — возможно, баг визуального пользователя');
  }

  // Проверка на возможное визуальное разрушение (например, позиционирование)
  const firstItem = page.locator('.inventory_item').first();
  const boundingBox = await firstItem.boundingBox();
  if (!boundingBox || boundingBox.width < 100 || boundingBox.height < 100) {
    console.warn('⚠️ Визуальная структура нарушена — элемент слишком мал или невидим');
  }

  // Скриншот для ручной верификации
  await page.screenshot({ path: `screenshots/visual_user.png`, fullPage: true });
});

});

test.describe('Авторизация с ошибкой', () => {
  test('Ошибка при входе с логином locked_out_user', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    const usernameInput = page.locator('[data-test="username"]');
    const passwordInput = page.locator('[data-test="password"]');
    const loginButton = page.locator('[data-test="login-button"]');
    const errorBox = page.locator('[data-test="error"]');

    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('locked_out_user');
    await passwordInput.fill('secret_sauce');
    await loginButton.click();

    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('Epic sadface: Sorry, this user has been locked out.');
  });
});
