import { PlaywrightTestConfig, devices } from '@playwright/test';

function formattedDateTime() {
  const timeNow = Date.now();
  const today = new Date(timeNow);
  return today.getFullYear() + '_' + (today.getMonth()) + '_' + today.getDate() + '_' + today.getHours() + '_' + today.getMinutes() + '_' + today.getSeconds();
}

const config: PlaywrightTestConfig = {
  timeout: 10 * 1000,
	expect: {
		timeout: 10 * 1000,
	},
  workers: 20,
  reporter: [
  ['./src/index.ts', { 
    testFolder: 'tests',
    title: 'Playwright HTML Report',
    project: 'QA Tests',
    release: '9.87.6',
    testEnvironment: 'TEST',
    embedAssets: true,
    embedAttachments: true,
    outputFolder: `playwright-html-report/${formattedDateTime()}`,
    startServer: true,
    consoleLog: true,
    consoleError: true,
    consoleTestOutput: false,
    theme: 'light',
    //theme: 'theme/custom-theme.css',
  }]
],
  use: {
    video: {
			mode: "on",
      size: { width: 1920, height: 1080 },
		},
		screenshot: "on",
		trace: "on",
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
			name: "Google Chrome",
			use: {
				...devices["Desktop Chrome"],
				channel: "chrome",
				viewport: {
					width: 1920,
					height: 1080,
				},
			},
		},
    //{
    //  name: 'chromium',
    //  use: { ...devices['Desktop Chrome'] },
    //},
    //{
    //  name: 'firefox',
    //  use: { ...devices['Desktop Firefox'] },
    //},
    //{
    //  name: 'webkit',
    //  use: { ...devices['Desktop Safari'] },
    //},
    //  ///* Test against mobile viewports. */
    //{
    //  name: 'Mobile Chrome',
    //  use: { ...devices['Pixel 5'] },
    //},
    //{
    //  name: 'Mobile Safari',
    //  use: { ...devices['iPhone 12'] },
    //},
    //  ///* Test against branded browsers. */
    //{
    //  name: 'Google Chrome',
    //  use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    //},
    //{
    //  name: 'Google Chrome Beta',
    //  use: { ...devices['Desktop Chrome'], channel: 'chrome-beta' },
    //},
    //{
    //  name: 'Microsoft Edge',
    //  use: { ...devices['Desktop Edge'], channel: 'msedge' },
    //},
    //{
    //  name: 'Microsoft Edge Beta',
    //  use: { ...devices['Desktop Edge'], channel: 'msedge-beta' },
    //},
    //{
    //  name: 'Microsoft Edge Dev',
    //  use: { ...devices['Desktop Edge'], channel: 'msedge-dev' },
    //},
  ],
};
export default config;