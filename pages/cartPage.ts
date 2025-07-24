import { Page, expect } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  async openCart() {
    await this.page.locator('.shopping_cart_link').click();
  }

  async proceedToCheckout() {
    await this.page.locator('[data-test="checkout"]').click();
  }

  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string) {
    await this.page.locator('[data-test="firstName"]').fill(firstName);
    await this.page.locator('[data-test="lastName"]').fill(lastName);
    await this.page.locator('[data-test="postalCode"]').fill(postalCode);
    await this.page.locator('[data-test="continue"]').click();
  }

  async finishCheckout() {
    await this.page.locator('[data-test="finish"]').click();
  }

  async verifySuccessMessage() {
    await expect(this.page.locator('.complete-header')).toHaveText('Thank you for your order!');
  }

  async removeItemFromCartByIndex(index: number) {
    const removeButtons = this.page.locator('[data-test^="remove-"]');
    await removeButtons.nth(index).click();
  }
}
