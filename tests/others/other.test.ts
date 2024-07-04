import { test, expect } from "@playwright/test";

test("Open playwright website many times", async ({ page }) => {
	await page.goto("https://playwright.dev/");
	let title = page.locator(".navbar__inner .navbar__title");
	await expect(title).toHaveText("Playwright");

	await page.goto("https://playwright.dev/");
	title = page.locator(".navbar__inner .navbar__title");
	await expect(title).toHaveText("Playwright");

	await page.goto("https://playwright.dev/");
	title = page.locator(".navbar__inner .navbar__title");
	await expect(title).toHaveText("Playwright");

	await page.goto("https://playwright.dev/");
	title = page.locator(".navbar__inner .navbar__title");
	await expect(title).toHaveText("Playwright");

	await page.goto("https://playwright.dev/");
	title = page.locator(".navbar__inner .navbar__title");
	await expect(title).toHaveText("Playwright");

	await page.goto("https://playwright.dev/");
	title = page.locator(".navbar__inner .navbar__title");
	await expect(title).toHaveText("Playwright");

	await page.goto("https://playwright.dev/");
	title = page.locator(".navbar__inner .navbar__title");
	await expect(title).toHaveText("Playwright");
});

test("Wrong text validation ", async ({ page, browserName }) => {
	test.skip(browserName === "webkit");

	await page.goto("https://playwright.dev/");
	const title = page.locator(".navbar__inner .navbar__title");

	if (browserName === "firefox") {
		await expect(title).toHaveText("Playright");
	}
	await expect(title).toHaveText("Playwright");
	console.log("Test Msg - Test MSG");
});

test("Test with a big name to validate the layout and test with a big name to validate the layout and test with a big name to validate the layout and test with a big name to validate the layout and test with a big name to validate the layout", async ({ page }, testInfo) => {
	await page.goto("https://playwright.dev");
	const info = await page.screenshot();
	await testInfo.attach("info", { body: info, contentType: "image/png" });
});
