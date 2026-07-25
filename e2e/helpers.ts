import { expect, type Page } from "@playwright/test";

export const PATIENT = {
  email: "patient@kavilcure.com",
  password: "patient123",
};

export const ADMIN = {
  email: "admin@kavilcure.com",
  password: "admin1234",
};

export async function login(
  page: Page,
  credentials: { email: string; password: string }
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/(account|admin)/);
}

export async function expectLoggedInDashboard(page: Page) {
  await expect(
    page.getByRole("heading", { name: /Namaste/ })
  ).toBeVisible();
}
