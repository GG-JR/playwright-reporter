import { test, expect } from "@playwright/test";

test.describe(() => {
	test.describe.configure({ retries: 7 });

	test("Simple test 5", async ({ page }, testInfo) => {
		await page.goto("https://playwright.dev/");

		let title = page.locator("");
    if(testInfo.retry === 5) {
      title = page.locator(".navbar__inner .navbar__title");
    } else {
      title = page.locator(".navbar__inner .navbar__title 2");
    }
		await expect(title).toHaveText("Playwright");
	});
});
