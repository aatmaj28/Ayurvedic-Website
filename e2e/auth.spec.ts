import { expect, test } from "@playwright/test";
import { PATIENT, expectLoggedInDashboard, login } from "./helpers";

test.describe("authentication", () => {
  test("existing patient can log in and reach the dashboard", async ({
    page,
  }) => {
    await login(page, PATIENT);
    await expectLoggedInDashboard(page);
  });

  test("new user can sign up and lands on the dashboard", async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    await page.goto("/signup");
    await page.getByLabel("Full name").fill("E2E Signup User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("test-password-1");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL(/\/account/);
    await expectLoggedInDashboard(page);
  });

  test("wrong password shows an error and stays on login", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(PATIENT.email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("patient cannot access the admin panel", async ({ page }) => {
    await login(page, PATIENT);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/account/);
  });
});
