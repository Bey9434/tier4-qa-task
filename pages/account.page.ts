import type { Locator, Page } from "@playwright/test";
import { MY_ACCOUNT_HEADING } from "./locator";

export const pageHeading = (page: Readonly<Page>): Locator =>
  page.getByRole("heading", { name: MY_ACCOUNT_HEADING });
