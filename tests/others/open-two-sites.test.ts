import { test, expect } from "@playwright/test";
import path from "path";
import { exec } from "child_process";

test.beforeAll(async () => {
	exec(
		"node " + path.resolve(__dirname, "") + "/playgroundServer/testServer.mjs"
	);
});

test("Open two sites", async ({ context }) => {
	let page = await context.newPage();
	let title = page.locator("#title-label h1");
	let openPlaywrightButton = page.locator("#open-playwright");
	await page.goto("http://localhost:7777/");
	await expect(title).toHaveText("Test Playground");
	const pagePromise = context.waitForEvent("page");
	await openPlaywrightButton.click();
	const newPage = await pagePromise;
	await newPage.waitForLoadState();
	await expect(newPage).toHaveURL("https://playwright.dev/");
});
