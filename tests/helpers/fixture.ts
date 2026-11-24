/**
 * Shared helpers for specs that use the fixture API (tests/fixture-api.mjs).
 * `withFixtureApi()` resets the scenario around every test and fails a test whose browser
 * contacts the production API.
 */
import { test, expect, type APIRequestContext } from "@playwright/test";

export const FIXTURE_API = "http://localhost:3190";
export const PRODUCTION_API = "https://api.farhanzulkarnainhrp.com";

export type Scenario = {
  scenario?: "normal" | "empty" | "fail" | "extreme" | "worst";
  fail?: string[];
  empty?: string[];
  /** worst only: one document without `size` (the API layer rejects the collection). */
  nosize?: boolean;
};

export async function setScenario(request: APIRequestContext, body: Scenario) {
  const response = await request.post(`${FIXTURE_API}/__scenario`, {
    data: body,
  });
  expect(response.ok()).toBe(true);
}

export function withFixtureApi() {
  let productionHits: string[] = [];
  test.beforeEach(async ({ context, request }) => {
    await setScenario(request, { scenario: "normal" });
    productionHits = [];
    await context.route(`${PRODUCTION_API}/**`, (route) => {
      productionHits.push(route.request().url());
      return route.abort();
    });
  });
  test.afterEach(async ({ request }) => {
    expect(productionHits, "browser must not call the production API").toEqual(
      [],
    );
    await setScenario(request, { scenario: "normal" });
  });
}

/** Initial server HTML (no JavaScript). */
export async function initialHtml(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  expect(response.status()).toBeLessThan(500);
  return response.text();
}
