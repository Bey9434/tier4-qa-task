import type { Locator, Page } from "@playwright/test";

export const addToCartButton = (page: Readonly<Page>): Locator =>
  page.getByRole("button", { name: "Add to cart" });
