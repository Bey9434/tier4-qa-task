import type { Locator, Page } from "@playwright/test";

export const pageHeading = (page: Readonly<Page>): Locator =>
  page.getByRole("heading", { name: "My account" });
