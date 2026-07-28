import { expect, test } from "@playwright/test";
import { PATIENT, login } from "./helpers";

test.describe("internationalization", () => {
  test("switching to Marathi translates the page and sets html lang", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("menuitem", { name: "मराठी" }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "mr");
    await expect(
      page.getByRole("heading", { name: /कावीळीसाठी/ })
    ).toBeVisible();
    // Nav is translated too (scope to the header nav; the footer repeats it).
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "उपचार" })
    ).toBeVisible();
  });

  test("switching to Hindi translates the page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("menuitem", { name: "हिन्दी" }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
    await expect(page.getByText("1965 से भारत की सेवा में")).toBeVisible();
  });

  test("locale persists across navigation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("menuitem", { name: "मराठी" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "mr");

    await page.goto("/treatment");
    await expect(page.locator("html")).toHaveAttribute("lang", "mr");
    await expect(
      page.getByRole("heading", { name: /कावीळ समजून घ्या/ })
    ).toBeVisible();
  });

  test("the logged-in dashboard is translated too", async ({ page }) => {
    // Log in while the UI is English, then switch language on the dashboard.
    await login(page, PATIENT);
    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("menuitem", { name: "मराठी" }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "mr");
    await expect(page.getByRole("heading", { name: /नमस्कार/ })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "माझे अपॉइंटमेंट" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "माझे ऑर्डर" })
    ).toBeVisible();
  });

  test("defaults to English with no locale cookie", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("heading", {
        name: "Gentle, time-tested Ayurvedic care for jaundice",
      })
    ).toBeVisible();
  });
});
