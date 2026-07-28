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
    await page.getByRole("option", { name: "Mumbai", exact: true }).click();
    await page.getByLabel("Date").fill(tomorrowISO());

    // Pick the first slot that's actually free (the shared test DB accumulates
    // bookings across runs, so a hard-coded slot would eventually be taken).
    const freeSlot = page
      .locator("button:not([disabled])")
      .filter({ hasText: /^\d{2}:\d{2}$/ })
      .first();
    await expect(freeSlot).toBeVisible();
    const slot = (await freeSlot.textContent())!.trim();
    await freeSlot.click();

    await page
      .getByLabel(/Notes for the practitioner/)
      .fill("Automated e2e booking");
    await expect(page.getByText(/Consultation at/)).toBeVisible();
    await page.getByRole("button", { name: "Confirm booking" }).click();

    await page.waitForURL(/\/account\?booked=1/);
    await expect(page.getByText("Appointment booked!")).toBeVisible();

    const bookedCard = page
      .locator('[data-slot="card"]', { hasText: `· ${slot}` })
      .filter({ has: page.getByRole("button", { name: "Cancel" }) })
      .first();
    await expect(bookedCard).toBeVisible();
    await bookedCard.getByRole("button", { name: "Cancel" }).click();
    // After cancelling, that card re-renders with the Cancelled badge.
    await expect(
      page
        .locator('[data-slot="card"]', { hasText: `· ${slot}` })
        .filter({ hasText: "Cancelled" })
        .first()
    ).toBeVisible();
  });
});
