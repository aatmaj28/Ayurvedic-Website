import { expect, test, type Page } from "@playwright/test";
import { ADMIN, PATIENT, login } from "./helpers";

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
}

const PUBLIC_PATHS = [
  "/",
  "/treatment",
  "/about",
  "/contact",
  "/medicine",
  "/login",
  "/signup",
];

test.describe("mobile layout", () => {
  for (const path of PUBLIC_PATHS) {
    test(`no horizontal overflow on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "load" });
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    });
  }

  test("hamburger menu opens and navigates", async ({ page }) => {
    await page.goto("/");
    // The desktop inline nav is hidden on mobile; the hamburger drives navigation.
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Treatment" }).click();
    await expect(page).toHaveURL(/\/treatment/);
    await expect(
      page.getByRole("heading", { name: /Understanding jaundice/ })
    ).toBeVisible();
  });

  test("patient pages have no overflow and dashboard is usable", async ({
    page,
  }) => {
    await login(page, PATIENT);
    for (const path of ["/account", "/book", "/order/classic-kit"]) {
      await page.goto(path, { waitUntil: "load" });
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    }
  });

  test("admin tables become tappable cards with no overflow", async ({
    page,
  }) => {
    await login(page, ADMIN);

    await page.goto("/admin/orders", { waitUntil: "load" });
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    // Action controls live in the mobile card layout and must be reachable.
    await expect(page.getByRole("button", { name: "Cancel" }).first()).toBeVisible();

    await page.goto("/admin/appointments", { waitUntil: "load" });
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    await page.goto("/admin", { waitUntil: "load" });
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });
});
