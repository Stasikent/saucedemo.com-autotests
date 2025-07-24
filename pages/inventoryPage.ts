import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly sortDropdown: Locator;
  readonly errorBanner: Locator;
  readonly inventoryList: Locator;
  readonly itemTitles: Locator;
  readonly itemImages: Locator;
  readonly headerLogo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.errorBanner = page.locator('.error-message-container');
    this.inventoryList = page.locator('[data-test="inventory-list"]');
    this.itemTitles = page.locator('.inventory_item_name');
    this.itemImages = page.locator('.inventory_item_img img');
    this.headerLogo = page.locator('.app_logo');
  }

  async getImageSources(): Promise<string[]> {
    const count = await this.itemImages.count();
    const srcs: string[] = [];
    for (let i = 0; i < count; i++) {
      const src = await this.itemImages.nth(i).getAttribute('src');
      if (src) srcs.push(src);
    }
    return srcs;
  }

  async getItemPrices(): Promise<string[]> {
    const prices = this.page.locator('.inventory_item_price');
    const result: string[] = [];
    for (let i = 0; i < await prices.count(); i++) {
      result.push((await prices.nth(i).innerText()).trim());
    }
    return result;
  }

  async getFirstItemBox() {
    const first = this.page.locator('.inventory_item').first();
    return await first.boundingBox();
  }

  async validateInventoryPageElements() {
    await Promise.all([
      this.sortDropdown.waitFor({ state: 'visible' }),
      this.inventoryList.waitFor({ state: 'visible' }),
      this.headerLogo.waitFor({ state: 'visible' })
    ]);
  }

  async getItemTitles(): Promise<string[]> {
    const titles: string[] = [];
    const count = await this.itemTitles.count();
    for (let i = 0; i < count; i++) {
      titles.push(await this.itemTitles.nth(i).innerText());
    }
    return titles;
  }

  async addFirstItemToCart() {
    const firstAddButton = this.page.locator('.inventory_item .btn_inventory').first();
    await firstAddButton.click();
  }

  async addItemToCartByIndex(index: number) {
    const addButton = this.page.locator('.inventory_item .btn_inventory').nth(index);
    await addButton.click();
  }

  async removeItemFromCartByIndex(index: number) {
    const removeButton = this.page.locator('.inventory_item .btn_secondary, .inventory_item .btn_small').nth(index);
    await removeButton.click();
  }
}
