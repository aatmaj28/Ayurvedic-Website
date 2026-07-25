import { expect, test } from "@playwright/test";
import { PATIENT, login } from "./helpers";

test.describe("medicine order", () => {
  test("patient orders a kit through the mock checkout and sees tracking", async ({
    page,
  }) => {
    await login(page, PATIENT);

    await page.goto("/medicine");
    await page.getByRole("link", { name: "Order this kit" }).first().click();
    await page.waitForURL(/\/order\/classic-kit/);

    // Step 1: delivery details (name/phone/state are prefilled)
    await page
      .getByLabel("Address line 1")
      .fill("B-204, Shanti Heights, Test Lane");
    await page.getByLabel("City").fill("Navi Mumbai");
    await page.getByLabel("PIN code").fill("410210");
    await page.getByRole("button", { name: "Continue to payment" }).click();

    // Step 2: mock payment
    await expect(page.getByText("Demo payment")).toBeVisible();
    await expect(page.getByLabel("Card number")).toHaveValue(
      "4242 4242 4242 4242"
    );
    await page.getByRole("button", { name: /^Pay ₹/ }).click();

    await page.waitForURL(/\/account\/orders\/.+\?placed=1/);
    await expect(page.getByText("Order placed — thank you!")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^KC-\d{6}-\d{4}$/ })
    ).toBeVisible();
    const trackingCard = page.locator('[data-slot="card"]', {
      hasText: "Tracking",
    });
    await expect(trackingCard).toBeVisible();
    await expect(
      trackingCard.getByText("Order placed", { exact: true })
    ).toBeVisible();
  });
});
