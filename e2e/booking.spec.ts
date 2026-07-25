import { expect, test } from "@playwright/test";
import { PATIENT, login } from "./helpers";

function tomorrowISO(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

test.describe("appointment booking", () => {
  test("patient books a consultation and then cancels it", async ({
    page,
  }) => {
    await login(page, PATIENT);

    await page.goto("/book");
    await page.getByLabel("Centre").click();
    await page.getByRole("option", { name: /^Mumbai —/ }).click();
    await page.getByLabel("Date").fill(tomorrowISO());
    await page.getByRole("button", { name: "11:00" }).click();
    await page
      .getByLabel(/Notes for the practitioner/)
      .fill("Automated e2e booking");

    await expect(page.getByText(/Consultation at/)).toBeVisible();
    await page.getByRole("button", { name: "Confirm booking" }).click();

    await page.waitForURL(/\/account\?booked=1/);
    await expect(page.getByText("Appointment booked!")).toBeVisible();

    const bookedCard = page
      .locator('[data-slot="card"]', { hasText: "at 11:00" })
      .filter({ has: page.getByRole("button", { name: "Cancel" }) })
      .first();
    await expect(bookedCard).toBeVisible();
    await bookedCard.getByRole("button", { name: "Cancel" }).click();
    // After cancelling, the card re-renders without the Cancel button,
    // so look for an 11:00 card that now shows the Cancelled badge.
    await expect(
      page
        .locator('[data-slot="card"]', { hasText: "at 11:00" })
        .filter({ hasText: "Cancelled" })
        .first()
    ).toBeVisible();
  });
});
