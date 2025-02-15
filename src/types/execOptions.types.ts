export interface ExecOptions {
    testFolder: string,
    title: string,
    testEnvironment: string,
    project: string,
    release: string,
    embedAssets: boolean,
    embedAttachments: boolean,
    outputFolder: string,
    startServer: boolean,
    consoleLog: boolean,
    consoleError: boolean,
    consoleTestOutput: boolean,
    theme: string,
  }