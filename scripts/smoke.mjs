#!/usr/bin/env node
// Post-deploy smoke test: hits a live deployment and fails loudly if the
// things that matter are broken. Catches production-only failures that CI
// (which runs against `next start` with test env vars) cannot see — e.g. a
// malformed BETTER_AUTH_URL that 500s every page.
//
// Usage:
//   node scripts/smoke.mjs [baseUrl]
//   SMOKE_URL=https://example.com node scripts/smoke.mjs

const BASE = (
  process.argv[2] ||
  process.env.SMOKE_URL ||
  "https://kavilcure.me"
).replace(/\/$/, "");

const TIMEOUT_MS = 15_000;

async function fetchPath(path, { redirect = "follow" } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${BASE}${path}`, {
      redirect,
      signal: controller.signal,
      headers: { "user-agent": "kavil-cure-smoke" },
    });
  } finally {
    clearTimeout(timer);
  }
}

const checks = [];
const check = (name, fn) => checks.push({ name, fn });

// Public pages must render (each one renders the header, which reads the
// session — the exact path that 500'd on the bad auth base URL).
for (const path of [
  "/",
  "/treatment",
  "/medicine",
  "/about",
  "/contact",
  "/login",
  "/signup",
]) {
  check(`GET ${path} → 200`, async () => {
    const res = await fetchPath(path);
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
  });
}

// Auth layer is healthy (side-effect free): a bad base URL 500s this too.
check("GET /api/auth/get-session → 200", async () => {
  const res = await fetchPath("/api/auth/get-session");
  if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
});

// Protected route gates anonymous users to /login.
check("GET /account → redirect to /login", async () => {
  const res = await fetchPath("/account", { redirect: "manual" });
  if (![301, 302, 307, 308].includes(res.status)) {
    throw new Error(`expected a redirect, got ${res.status}`);
  }
  const location = res.headers.get("location") ?? "";
  if (!location.includes("/login")) {
    throw new Error(`expected redirect to /login, got "${location}"`);
  }
});

// Home actually renders real content (not an error shell).
check("home renders hero copy", async () => {
  const res = await fetchPath("/");
  const html = await res.text();
  if (!/Ayurvedic care for jaundice/i.test(html)) {
    throw new Error("expected hero copy in the HTML");
  }
});

const run = async () => {
  console.log(`Smoke testing ${BASE}\n`);
  let failed = 0;
  for (const { name, fn } of checks) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
    } catch (error) {
      failed += 1;
      console.log(`  ✗ ${name} — ${error.message}`);
    }
  }
  console.log(
    `\n${checks.length - failed}/${checks.length} checks passed.`
  );
  if (failed > 0) {
    console.error(`\nSmoke test FAILED (${failed} failing).`);
    process.exit(1);
  }
  console.log("\nSmoke test passed.");
};

run().catch((error) => {
  console.error(`Smoke test crashed: ${error.message}`);
  process.exit(1);
});
