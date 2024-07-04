import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

test.beforeAll(async () => {
	exec(
		"node " + path.resolve(__dirname, "") + "/playgroundServer/testServer.mjs"
	);
});

test("Image download validation", async ({ page }, testInfo) => {
	await page.goto("http://localhost:7777/");
	const [download] = await Promise.all([
		page.waitForEvent("download"),
		page.locator("#odhin-image").click(),
	]);

	expect(download.suggestedFilename()).toBe("odhin.png");
	expect(
		(await fs.promises.stat((await download.path()) as string)).size
	).toBeGreaterThan(350);

	const path = await download.path();
	await testInfo.attach("odhin", {
		contentType: "image/png",
		path: path!,
	});
});
