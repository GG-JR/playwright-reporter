# Usage

There are many options to generate your HTML report. Is it possible to embed assets and attachments and it's also possible to start a server for your report at the end of the execution.

Edit the `playwright.config.ts` file with the options that you need.

```javascript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  ...
  reporter: [
    ['playwright-html', { 
      testFolder: 'tests',
      title: 'Playwright HTML Report',
      project: 'QA Tests',
      release: '9.87.6',
      testEnvironment: 'DEV',
      embedAssets: true,
      embedAttachments: true,
      outputFolder: 'playwright-html-report',
      minifyAssets: true,
      startServer: true,
      consoleLog: true,
      consoleError: true,
    }]
    ...
  ],
}
``` 

### Options
| Name | Default Value | Mandatory | Description |
|---|---|---|---|
| testFolder | tests | no | Folder of the test files |
| title | Playwright HTML Report | no | Title of the report that will be shown at the top of the page |
| project || no | Project name |
| release || no | Release version |
| testEnvironment || no | Test environment of the execution |
| embedAssets | true | no | Embed or not the assets to the HTML report file |
| embedAttachments | true | no | Embed or not the attachments to the HTML report file |
| outputFolder | playwright-html-report | no | Output folder where the HTML will be saved |
| minifyAssets | true | no | Minify or not the assets |
| startServer | true | no | Start or not the server to serve the HTML report |
| consoleLog | true | no | Shows the execution log on the console |
| consoleError | true | no | Shows report execution errors on the console |

`If you embed assets and attachments, only one HTML file will be generated with everything inside.`