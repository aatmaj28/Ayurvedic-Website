import { expect, test } from "@playwright/test";
import { PATIENT, login } from "./helpers";

const fakeSubscription = (tag: string) => ({
  endpoint: `https://fcm.googleapis.com/fcm/send/e2e-fake-${tag}`,
  keys: {
    p256dh:
      "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XcjhZkjD8pTZzMkJDLK3d1w",
    auth: "tBHItJI5svbpez7KI4CCXg",
  },
});

test.describe("push notifications", () => {
  test("subscribe API requires authentication", async ({ request }) => {
    const res = await request.post("/api/push/subscribe", {
      data: fakeSubscription("anon"),
    });
    expect(res.status()).toBe(401);
  });

  test("patient can save and remove a subscription", async ({ page }) => {
    await login(page, PATIENT);
    const sub = fakeSubscription(String(Date.now()));

    const save = await page.request.post("/api/push/subscribe", { data: sub });
    expect(save.status()).toBe(200);

    const remove = await page.request.delete("/api/push/subscribe", {
      data: { endpoint: sub.endpoint },
    });
    expect(remove.status()).toBe(200);
  });

  test("dashboard shows the notifications card with a permission state", async ({
    page,
  }) => {
    await login(page, PATIENT);
    await expect(page.getByText("Push notifications")).toBeVisible();
    // The headless-shell browser always reports permission "denied", so the
    // card renders its blocked state here; in a real browser this is the
    // Enable button instead. Either way the card must render a state.
    await expect(
      page
        .getByRole("button", { name: "Enable" })
        .or(page.getByText("Notifications are blocked"))
        .first()
    ).toBeVisible();
  });

  test("a dead subscription never breaks the action that triggers it", async ({
    page,
  }) => {
    await login(page, PATIENT);
    // Register an unreachable endpoint, then place an order (which pushes).
    const sub = fakeSubscription(`dead-${Date.now()}`);
    await page.request.post("/api/push/subscribe", { data: sub });

    await page.goto("/medicine");
    await page.getByRole("link", { name: "Order this kit" }).first().click();
    await page.waitForURL(/\/order\/classic-kit/);
    await page.getByLabel("Address line 1").fill("1 Push Test Lane");
    await page.getByLabel("City").fill("Islampur");
    await page.getByLabel("PIN code").fill("415409");
    await page.getByRole("button", { name: "Continue to payment" }).click();
    await page.getByRole("button", { name: /^Pay .*₹/ }).click();

    // The push to the dead endpoint fails internally; the order must still land.
    await page.waitForURL(/\/account\/orders\/.+\?placed=1/);
    await expect(page.getByText("Order placed — thank you!")).toBeVisible();

    await page.request.delete("/api/push/subscribe", {
      data: { endpoint: sub.endpoint },
    });
  });
});
