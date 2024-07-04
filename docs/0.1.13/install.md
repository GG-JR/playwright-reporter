# Install

```sh
npm i -D playwright-html@0.1.13 --save --save-exact
```

After installation, add the reporter to your configuration file `playwright.config.ts`.

```javascript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    ...
  reporter: [
    ['playwright-html']
  ],
  ...
}
``` 