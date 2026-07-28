import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("home page shows hero, pricing, and stats", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Gentle, time-tested Ayurvedic care for jaundice",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Our centres & pricing" })
    ).toBeVisible();
    await expect(
      page.getByText("Islampur (HQ)", { exact: true })
    ).toBeVisible();
    await expect(page.getByText("25 lakh+")).toBeVisible();
  });

  test("treatment page shows medical red-flags warning", async ({ page }) => {
    await page.goto("/treatment");
    await expect(
      page.getByText("When to go to a hospital instead")
    ).toBeVisible();
  });

  test("medicine page lists the kit with per-centre prices", async ({
    page,
  }) => {
    await page.goto("/medicine");
    await expect(page.getByText("Kavil-Cure Classic Kit")).toBeVisible();
    // The extended kit is retired from the storefront.
    await expect(page.getByText("Kavil-Cure Extended Kit")).toHaveCount(0);
    // Per-centre kit prices.
    await expect(page.getByText("₹50")).toBeVisible();
    await expect(page.getByText("₹200")).toBeVisible();
    await expect(page.getByText("₹300")).toBeVisible();
  });

  test("contact form submits and confirms", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Name").fill("E2E Tester");
    await page.getByLabel("Email").fill("e2e@example.com");
    await page
      .getByLabel("Message")
      .fill("This is an automated end-to-end test message.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Message sent")).toBeVisible();
  });

  test("protected routes redirect anonymous users to login", async ({
    page,
  }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
  });
});
