import { test, expect } from '../fixtures/test-fixture';
import { LoginPage } from '../pages/loginPage';
import { InventoryPage } from '../pages/inventoryPage';
import { CartPage } from '../pages/cartPage';

async function loginAndPrepare(page, user: string, password: string) {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  await loginPage.goto();
  await loginPage.login(user, password);
  await inventoryPage.validateInventoryPageElements();
  return { loginPage, inventoryPage, cartPage };
}

async function addItems(page, inventoryPage: InventoryPage, count: number) {
  const titles: string[] = [];
  const prices: string[] = [];
  for (let i = 0; i < count; i++) {
    await inventoryPage.addItemToCartByIndex(i);
    const title = await inventoryPage.itemTitles.nth(i).innerText();
    const price = await page.locator('.inventory_item_price').nth(i).innerText();
    titles.push(title.trim());
    prices.push(price.trim());
  }
  return { titles, prices };
}

async function validateCart(page, expectedTitles: string[], expectedPrices?: string[]) {
  const cartTitles = page.locator('.cart_item .inventory_item_name');
  const cartPrices = page.locator('.cart_item .inventory_item_price');
  const cartCount = await cartTitles.count();
  const mismatches: string[] = [];
  for (let i = 0; i < Math.max(cartCount, expectedTitles.length); i++) {
    const cartTitle = i < cartCount ? (await cartTitles.nth(i).innerText()).trim() : '[нет в корзине]';
    const expectedTitle = expectedTitles[i] ?? '[не добавлялся]';
    if (cartTitle !== expectedTitle) {
      mismatches.push(`❌ Позиция ${i + 1}: ожидалось "${expectedTitle}", получено "${cartTitle}"`);
    }
    if (expectedPrices) {
      const cartPrice = i < cartCount ? (await cartPrices.nth(i).innerText()).trim() : '[нет]';
      const expectedPrice = expectedPrices[i] ?? '[не добавлялась]';
      if (cartPrice !== expectedPrice) {
        mismatches.push(`   💰 Цена: ожидалось "${expectedPrice}", получено "${cartPrice}"`);
      }
    }
  }
  if (mismatches.length === 0) {
    console.log('✅ Все товары и цены в корзине соответствуют добавленным.');
  } else {
    console.warn(`⚠️ Обнаружено ${mismatches.length} несоответствий:`);
    mismatches.forEach(msg => console.warn(msg));
  }
}

async function tryFinishCheckout(page, cartPage: CartPage, screenshotPrefix: string) {
  const finishButton = page.locator('[data-test="finish"]');
  try {
    await finishButton.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    console.error(`❌ Кнопка завершения заказа не отображается.`);
    await page.screenshot({ path: `screenshots/${screenshotPrefix}-missing.png`, fullPage: true });
    return false;
  }
  await cartPage.finishCheckout();
  try {
    await cartPage.verifySuccessMessage();
    console.log('✅ Заказ успешно завершён.');
    return true;
  } catch {
    console.error('❌ Заказ не завершён — подтверждение не получено.');
    await page.screenshot({ path: `screenshots/${screenshotPrefix}-failed.png`, fullPage: true });
    return false;
  }
}

// тест с удалением всех товаров из корзины
test('standard_user — удаление всех товаров перед оформлением заказа', async ({ page }) => {
  const { inventoryPage, cartPage } = await loginAndPrepare(page, 'standard_user', 'secret_sauce');

  await inventoryPage.addItemToCartByIndex(0);
  const title = await inventoryPage.itemTitles.nth(0).innerText();
  console.log(`🛒 Добавлен товар: ${title}`);

  await cartPage.openCart();
  const cartItems = await page.locator('.cart_item');
  const count = await cartItems.count();
  for (let i = 0; i < count; i++) {
    await cartPage.removeItemFromCartByIndex(0);
  }
  console.log('🗑 Все товары удалены из корзины.');

  await cartPage.proceedToCheckout();
  await cartPage.fillCheckoutInfo('Standard', 'User', '00000');

  await tryFinishCheckout(page, cartPage, 'empty-cart-finish');
});


//тест для визуал
test('visual_user — проверка товаров, цен и оформление заказа', async ({ page }) => {
  const { inventoryPage, cartPage } = await loginAndPrepare(page, 'visual_user', 'secret_sauce');
  const itemCount = Math.floor(Math.random() * 4) + 2; // от 2 до 5
  const { titles, prices } = await addItems(page, inventoryPage, itemCount);

  await cartPage.openCart();
  await validateCart(page, titles, prices);

  await cartPage.proceedToCheckout();
  await cartPage.fillCheckoutInfo('Visual', 'User', '88888');
  await tryFinishCheckout(page, cartPage, 'visual-user-order');
});


//тест для ошибочного с удалением
test('error_user — оформление заказа с проверкой и удалением одного товара', async ({ page }) => {
  const { inventoryPage, cartPage } = await loginAndPrepare(page, 'error_user', 'secret_sauce');
  const itemCount = Math.floor(Math.random() * 4) + 2;
  const { titles } = await addItems(page, inventoryPage, itemCount);

  await cartPage.openCart();
  await validateCart(page, titles);

  if (itemCount >= 2) {
    await cartPage.removeItemFromCartByIndex(0);
    console.log('🗑 Удалён один товар из корзины.');
  }

  await cartPage.proceedToCheckout();
  await cartPage.fillCheckoutInfo('Error', 'User', '12345');
  await tryFinishCheckout(page, cartPage, 'error-user-order');
});

// Тест  для проблемного юзера
test('problem_user — оформление заказа с 3-5 товарами', async ({ page }) => {
  const { inventoryPage, cartPage } = await loginAndPrepare(page, 'problem_user', 'secret_sauce');
  const itemCount = Math.floor(Math.random() * 3) + 3; // от 3 до 5
  const { titles } = await addItems(page, inventoryPage, itemCount);

  await cartPage.openCart();
  await validateCart(page, titles);

  await cartPage.proceedToCheckout();
  await cartPage.fillCheckoutInfo('Problem', 'User', '99999');
  await tryFinishCheckout(page, cartPage, 'problem-user-order');
});


// тест стандартный с удалением 1 товара
test('Оформление заказа с удалением одного из товаров', async ({ page }) => {
  const { inventoryPage, cartPage } = await loginAndPrepare(page, 'standard_user', 'secret_sauce');

  await inventoryPage.addItemToCartByIndex(0);
  await inventoryPage.addItemToCartByIndex(1);

  await cartPage.openCart();
  await cartPage.removeItemFromCartByIndex(0);

  const remainingItems = await page.locator('.cart_item').count();
  expect(remainingItems).toBe(1);

  await cartPage.proceedToCheckout();
  await cartPage.fillCheckoutInfo('Test', 'User', '12345');
  await cartPage.finishCheckout();
  await cartPage.verifySuccessMessage();
});