// === checkHandlers.ts ===
import { expect, Page } from '@playwright/test';
import fs from 'fs';
import { InventoryPage } from '../pages/inventoryPage';
import { CartPage } from '../pages/cartPage';

export async function handleUserChecks(
  page: Page,
  inventoryPage: InventoryPage,
  login: string,
  check?: 'images' | 'delay' | 'sortError' | 'visual' | 'cart',
  duration?: number
) {
  switch (check) {
    case 'images': {
      const images = await inventoryPage.getImageSources();
      const first = images[0];
      for (const src of images) expect(src).toBe(first);
      break;
    }
    case 'delay': {
      console.log(`⏱ Время входа: ${duration} мс`);
      expect(duration).toBeGreaterThan(3000);
      break;
    }
    case 'sortError': {
      try {
        await inventoryPage.sortDropdown.selectOption('hilo');
      } catch (err) {
        console.error('❗ Ошибка при сортировке:', err);
      }
      if (await inventoryPage.errorBanner.isVisible()) {
        const text = await inventoryPage.errorBanner.textContent();
        console.log('⚠️ Ошибка на странице:', text);
      }
      break;
    }
    case 'visual': {
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
      ensureScreenshotDir();
      await page.screenshot({ path: `screenshots/${login}.png`, fullPage: true });
      break;
    }
    case 'cart': {
      const cartPage = new CartPage(page);

      await inventoryPage.addFirstItemToCart();
      await cartPage.openCart();
      await cartPage.proceedToCheckout();
      await cartPage.fillCheckoutInfo('Test', 'User', '12345');
      await cartPage.finishCheckout();
      await cartPage.verifySuccessMessage();
      break;
    }
  }
}

function ensureScreenshotDir() {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots', { recursive: true });
  }
}