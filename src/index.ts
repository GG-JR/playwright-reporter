import {
	Reporter,
	FullConfig,
	Suite,
	TestCase,
	TestResult,
} from "@playwright/test/reporter";
import fs from "fs";
import path from "path";
import { ExecOptions } from "./types/execOptions.types";
import Help from "./help";
import { TestReport } from "./types/testReport.types";
import { ExecInfo } from "./types/execInfo.types";
import { blue, bold, green, red, yellow, magenta, gray } from "picocolors";
import { round } from "lodash";
import { exec } from "child_process";
import util from "node:util";
import { exit } from "process";

class OdhinPlaywrightReporter implements Reporter {
	private execOptions: ExecOptions;
	private execInfo: ExecInfo;
	private totalDuration: number;
	private help: Help;
	private testCases: TestReport[];

	// HTML Files
	private base!: string;
	private runInfo!: string;
	private chart!: string;
	private chartInfo!: string;
	private chartStatus!: string;
	private chartFile!: string;
	private chartBrowser!: string;
	private chartJs!: string;
	private content!: string;
	private summary!: string;
	private summaryRow!: string;
	private testCaseTemplate!: string;
	private testCaseDetailsTemplate!: string;

	// CSS Files
	private cssTheme!: string;
	private cssColors!: string;
	private css!: string;
	private jqueryDataTablesCss!: string;
	private bootstrapCss!: string;
	private prismCss!: string;
	private imgComparisonSliderCss!: string;

	// JS Files
	private jQuery!: string;
	private js!: string;
	private chartJsLibrary!: string;
	private jqueryDataTablesJs!: string;
	private dataTables!: string;
	private bootstrapJs!: string;
	private prismJs!: string;
	private imgComparisonSliderJs!: string;

	// Const Variables
	private OUTPUT_FOLDER = "playwright-html-report";
	private TITLE = "Playwright HTML Report";
	private TEST_FOLDER = "tests";
	private INDEX_FILE = "index.html";

	constructor(execOptions: ExecOptions) {
		this.execOptions = execOptions;
		this.totalDuration = 0;
		this.help = new Help(this.execOptions);
		this.testCases = [];
		this.execInfo = {
			browserName: "",
			totalPassed: 0,
			totalFailed: 0,
			totalTimedOut: 0,
			totalSkipped: 0,
			totalInterrupted: 0,
			totalTests: 0,
			startTime: "",
			endTime: "",
			execFiles: [],
			execBrowsers: [],
		};

		this.execOptions.testFolder =
			this.execOptions.testFolder !== undefined
				? this.execOptions.testFolder
				: this.TEST_FOLDER;
		this.execOptions.title =
			this.execOptions.title !== undefined
				? this.execOptions.title
				: this.TITLE;
		this.execOptions.testEnvironment =
			this.execOptions.testEnvironment !== undefined
				? this.execOptions.testEnvironment
				: "";
		this.execOptions.project =
			this.execOptions.project !== undefined ? this.execOptions.project : "";
		this.execOptions.release =
			this.execOptions.release !== undefined ? this.execOptions.release : "";
		this.execOptions.embedAssets =
			this.execOptions.embedAssets !== undefined
				? this.execOptions.embedAssets
				: true;
		this.execOptions.embedAttachments =
			this.execOptions.embedAttachments !== undefined
				? this.execOptions.embedAttachments
				: true;
		this.execOptions.outputFolder =
			this.execOptions.outputFolder !== undefined
				? this.execOptions.outputFolder
				: this.OUTPUT_FOLDER;
		this.execOptions.startServer =
			this.execOptions.startServer !== undefined
				? this.execOptions.startServer
				: true;
		this.execOptions.consoleLog =
			this.execOptions.consoleLog !== undefined
				? this.execOptions.consoleLog
				: true;
		this.execOptions.consoleError =
			this.execOptions.consoleError !== undefined
				? this.execOptions.consoleError
				: true;
		this.execOptions.consoleTestOutput =
			this.execOptions.consoleTestOutput !== undefined
				? this.execOptions.consoleTestOutput
				: false;
		this.execOptions.theme =
			this.execOptions.theme !== undefined ? this.execOptions.theme : "light";

		this.help.showError = this.execOptions.consoleError;

		// Remove output folder if exists
		fs.rmSync(this.execOptions.outputFolder, { recursive: true, force: true });

		try {
			// Load HTML Files
			fs.readFile(
				path.resolve(__dirname, "html/base.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.base = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/runInfo.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.runInfo = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/chart.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.chart = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/chartInfo.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.chartInfo = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/chartStatus.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.chartStatus = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/chartFile.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.chartFile = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/chartBrowser.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.chartBrowser = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/chartJs.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.chartJs = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/content.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.content = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/summary.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.summary = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/summaryRow.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.summaryRow = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/testCase.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.testCaseTemplate = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/testCaseDetails.html"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.testCaseDetailsTemplate = data;
				}
			);

			// Load CSS Files
			if (fs.existsSync(this.execOptions.theme)) {
				fs.readFile(this.execOptions.theme, "utf-8", (err, data) => {
					if (err) throw err;
					this.cssTheme = data;
				});
			} else {
				switch (this.execOptions.theme) {
					case "light":
						fs.readFile(
							path.resolve(__dirname, "html/assets/css/light-theme.min.css"),
							"utf-8",
							(err, data) => {
								if (err) throw err;
								this.cssTheme = data;
							}
						);
						break;
					case "dark":
						fs.readFile(
							path.resolve(__dirname, "html/assets/css/dark-theme.min.css"),
							"utf-8",
							(err, data) => {
								if (err) throw err;
								this.cssTheme = data;
							}
						);
						break;

					default:
						fs.readFile(
							path.resolve(__dirname, "html/assets/css/light-theme.min.css"),
							"utf-8",
							(err, data) => {
								if (err) throw err;
								this.cssTheme = data;
							}
						);
						break;
				}
			}
			fs.readFile(
				path.resolve(__dirname, "html/assets/css/style-colors.min.css"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.cssColors = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/css/style.min.css"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.css = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/css/jquery.dataTables.min.css"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.jqueryDataTablesCss = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/css/bootstrap.min.css"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.bootstrapCss = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/css/prism.min.css"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.prismCss = data;
				}
			);
			fs.readFile(
				path.resolve(
					__dirname,
					"html/assets/css/img-comparison-slider.min.css"
				),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.imgComparisonSliderCss = data;
				}
			);

			// Load JS Files
			fs.readFile(
				path.resolve(__dirname, "html/assets/js/jquery-3.5.1.min.js"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.jQuery = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/js/script.min.js"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.js = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/js/chart.min.js"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.chartJsLibrary = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/js/jquery.dataTables.min.js"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.jqueryDataTablesJs = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/js/dataTables.min.js"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.dataTables = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/js/bootstrap.min.js"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.bootstrapJs = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/js/prism.min.js"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.prismJs = data;
				}
			);
			fs.readFile(
				path.resolve(__dirname, "html/assets/js/img-comparison-slider.min.js"),
				"utf-8",
				(err, data) => {
					if (err) throw err;
					this.imgComparisonSliderJs = data;
				}
			);
		} catch (error) {
			if (this.execOptions.consoleError === true) {
				console.error(error);
			}
		}

		if (this.execOptions.consoleLog === true) {
			console.log(`${bold(blue(`-------------------------------------`))}`);
			console.log(`${bold(blue(` `))}`);
		}
	}

	onBegin(config: FullConfig, suite: Suite) {
		this.execInfo.startTime = new Date().toUTCString();

		config.projects.forEach((p, index) => {
			this.execInfo.browserName += index > 0 ? ", " : "";
			this.execInfo.browserName +=
				p.name.charAt(0).toUpperCase() + p.name.slice(1);
		});

		if (suite.allTests().length >= 1) {
			if (this.execOptions.consoleLog === true) {
				if (suite.allTests().length === 1) {
					console.log(
						`${bold(yellow(`⏺  `))}${bold(
							blue(`Starting the run with ${suite.allTests().length} test`)
						)}`
					);
				} else {
					console.log(
						`${bold(yellow(`⏺  `))}${bold(
							blue(`Starting the run with ${suite.allTests().length} tests`)
						)}`
					);
				}
				console.log(`${bold(blue(` `))}`);
			}
		} else {
			if (this.execOptions.consoleLog === true) {
				console.log(`${bold(red(`❌  No tests found`))}`);
				console.log(`${bold(blue(` `))}`);
				console.log(`${bold(blue(`-------------------------------------`))}`);
			}
			exit(1);
		}
	}

	/*
	onTestBegin(test: TestCase) {
		console.log(`Starting test ${test.title}`);
	}
 */

	onTestEnd(testCase: TestCase, result: TestResult) {
		this.execInfo.endTime = new Date().toUTCString();

		this.testCases.push({
			testCase: testCase,
			result: result,
		});
		this.totalDuration = this.totalDuration + result.duration;

		let browser = "";
		let tst: any = testCase;
		if (tst._projectId !== undefined) {
			browser = tst._projectId;
			browser = browser.charAt(0).toUpperCase() + browser.slice(1) + " | ";
		}

		if (
			result.status.toString() === "passed" ||
			result.retry === testCase.parent["_entries"][0].retries
		) {
			// Update Files
			let fileUpdate = false;
			this.execInfo.execFiles.forEach((f, index) => {
				if (
					f.filename ===
					this.help.getShortFilePath(
						testCase["_requireFile"],
						this.execOptions.testFolder
					)
				) {
					this.execInfo.execFiles[index].totalTests++;
					this.execInfo.execFiles[index].totalDuration =
						this.execInfo.execFiles[index].totalDuration + result.duration;
					(this.execInfo.execFiles[index].totalPassed =
						result.status.toString() == "passed"
							? this.execInfo.execFiles[index].totalPassed + 1
							: this.execInfo.execFiles[index].totalPassed),
						(this.execInfo.execFiles[index].totalFailed =
							result.status.toString() == "failed"
								? this.execInfo.execFiles[index].totalFailed + 1
								: this.execInfo.execFiles[index].totalFailed),
						(this.execInfo.execFiles[index].totalTimedOut =
							result.status.toString() == "timedOut"
								? this.execInfo.execFiles[index].totalTimedOut + 1
								: this.execInfo.execFiles[index].totalTimedOut),
						(this.execInfo.execFiles[index].totalSkipped =
							result.status.toString() == "skipped"
								? this.execInfo.execFiles[index].totalSkipped + 1
								: this.execInfo.execFiles[index].totalSkipped),
						(this.execInfo.execFiles[index].totalInterrupted =
							result.status.toString() == "interrupted"
								? this.execInfo.execFiles[index].totalInterrupted + 1
								: this.execInfo.execFiles[index].totalInterrupted),
						(this.execInfo.execFiles[index].endTime = new Date().toUTCString());
					fileUpdate = true;
				}
			});
			if (!fileUpdate) {
				this.execInfo.execFiles.push({
					filename: this.help.getShortFilePath(
						testCase["_requireFile"],
						this.execOptions.testFolder
					),
					color: this.help.getRandomColor(),
					totalPassed: result.status.toString() == "passed" ? 1 : 0,
					totalFailed: result.status.toString() == "failed" ? 1 : 0,
					totalTimedOut: result.status.toString() == "timedOut" ? 1 : 0,
					totalSkipped: result.status.toString() == "skipped" ? 1 : 0,
					totalInterrupted: result.status.toString() == "interrupted" ? 1 : 0,
					totalTests: 1,
					totalDuration: result.duration,
					startTime: new Date(
						new Date().getTime() - result.duration
					).toUTCString(),
					endTime: new Date().toUTCString(),
				});
			}

			// Update Browsers
			let browserUpdate = false;
			this.execInfo.execBrowsers.forEach((b, index) => {
				if (b.browser === testCase["_projectId"]) {
					this.execInfo.execBrowsers[index].totalTests++;
					this.execInfo.execBrowsers[index].totalDuration =
						this.execInfo.execBrowsers[index].totalDuration + result.duration;
					(this.execInfo.execBrowsers[index].totalPassed =
						result.status.toString() == "passed"
							? this.execInfo.execBrowsers[index].totalPassed + 1
							: this.execInfo.execBrowsers[index].totalPassed),
						(this.execInfo.execBrowsers[index].totalFailed =
							result.status.toString() == "failed"
								? this.execInfo.execBrowsers[index].totalFailed + 1
								: this.execInfo.execBrowsers[index].totalFailed),
						(this.execInfo.execBrowsers[index].totalTimedOut =
							result.status.toString() == "timedOut"
								? this.execInfo.execBrowsers[index].totalTimedOut + 1
								: this.execInfo.execBrowsers[index].totalTimedOut),
						(this.execInfo.execBrowsers[index].totalSkipped =
							result.status.toString() == "skipped"
								? this.execInfo.execBrowsers[index].totalSkipped + 1
								: this.execInfo.execBrowsers[index].totalSkipped),
						(this.execInfo.execBrowsers[index].totalInterrupted =
							result.status.toString() == "interrupted"
								? this.execInfo.execBrowsers[index].totalInterrupted + 1
								: this.execInfo.execBrowsers[index].totalInterrupted),
						(this.execInfo.execBrowsers[index].endTime =
							new Date().toUTCString());
					browserUpdate = true;
				}
			});
			if (!browserUpdate && testCase.parent.parent !== undefined) {
				this.execInfo.execBrowsers.push({
					browser: testCase["_projectId"],
					color: this.help.getRandomColor(),
					totalPassed: result.status.toString() == "passed" ? 1 : 0,
					totalFailed: result.status.toString() == "failed" ? 1 : 0,
					totalTimedOut: result.status.toString() == "timedOut" ? 1 : 0,
					totalSkipped: result.status.toString() == "skipped" ? 1 : 0,
					totalInterrupted: result.status.toString() == "interrupted" ? 1 : 0,
					totalTests: 1,
					totalDuration: result.duration,
					startTime: new Date(
						new Date().getTime() - result.duration
					).toUTCString(),
					endTime: new Date().toUTCString(),
				});
			}

			switch (result.status.toString()) {
				case "passed":
					this.execInfo.totalPassed++;
					if (this.execOptions.consoleLog === true) {
						console.log(`${bold(green(`✅ ${browser}${testCase.title}`))}`);
					}
					break;
				case "failed":
					this.execInfo.totalFailed++;
					if (this.execOptions.consoleLog === true) {
						console.log(`${bold(red(`⛔ ${browser}${testCase.title}`))}`);
					}
					break;
				case "timedOut":
					this.execInfo.totalTimedOut++;
					if (this.execOptions.consoleLog === true) {
						console.log(`${bold(magenta(`⛔ ${browser}${testCase.title}`))}`);
					}
					break;
				case "skipped":
					this.execInfo.totalSkipped++;
					if (this.execOptions.consoleLog === true) {
						console.log(`${bold(yellow(`🚫 ${browser}${testCase.title}`))}`);
					}
					break;
				case "interrupted":
					this.execInfo.totalInterrupted++;
					if (this.execOptions.consoleLog === true) {
						console.log(`${bold(gray(`🚫 ${browser}${testCase.title}`))}`);
					}
					break;
			}
			this.execInfo.totalTests++;
		}
	}

	async onEnd() {
		// Edit Chart Status
		this.chartStatus = this.chartStatus.replace("{{.ChartId}}", "chart-status");
		this.chartStatus = this.chartStatus.replace(
			"{{.TotalTests}}",
			this.execInfo.totalTests.toString()
		);
		this.chartStatus = this.chartStatus.replaceAll(
			"{{.TestPassedValue}}",
			this.execInfo.totalPassed.toString()
		);
		this.chartStatus = this.chartStatus.replaceAll(
			"{{.TestFailedValue}}",
			this.execInfo.totalFailed.toString()
		);
		this.chartStatus = this.chartStatus.replaceAll(
			"{{.TestTimedOutValue}}",
			this.execInfo.totalTimedOut.toString()
		);
		this.chartStatus = this.chartStatus.replaceAll(
			"{{.TestSkippedValue}}",
			this.execInfo.totalSkipped.toString()
		);
		this.chartStatus = this.chartStatus.replaceAll(
			"{{.TestInterruptedValue}}",
			this.execInfo.totalInterrupted.toString()
		);
		this.chartStatus = this.chartStatus.replaceAll(
			"{{.TestPassedPercentage}}",
			round(
				(this.execInfo.totalPassed / this.execInfo.totalTests) * 100,
				2
			).toString()
		);
		this.chartStatus = this.chartStatus.replaceAll(
			"{{.TestFailedPercentage}}",
			round(
				(this.execInfo.totalFailed / this.execInfo.totalTests) * 100,
				2
			).toString()
		);
		this.chartStatus = this.chartStatus.replaceAll(
			"{{.TestTimedOutPercentage}}",
			round(
				(this.execInfo.totalTimedOut / this.execInfo.totalTests) * 100,
				2
			).toString()
		);
		this.chartStatus = this.chartStatus.replaceAll(
			"{{.TestSkippedPercentage}}",
			round(
				(this.execInfo.totalSkipped / this.execInfo.totalTests) * 100,
				2
			).toString()
		);
		this.chartStatus = this.chartStatus.replaceAll(
			"{{.TestInterruptedPercentage}}",
			round(
				(this.execInfo.totalInterrupted / this.execInfo.totalTests) * 100,
				2
			).toString()
		);
		this.chartJs = this.chartJs.replaceAll(
			"{{.PassedStatusChart}}",
			this.execInfo.totalPassed.toString()
		);
		this.chartJs = this.chartJs.replaceAll(
			"{{.FailedStatusChart}}",
			this.execInfo.totalFailed.toString()
		);
		this.chartJs = this.chartJs.replaceAll(
			"{{.TimedOutStatusChart}}",
			this.execInfo.totalTimedOut.toString()
		);
		this.chartJs = this.chartJs.replaceAll(
			"{{.SkippedStatusChart}}",
			this.execInfo.totalSkipped.toString()
		);
		this.chartJs = this.chartJs.replaceAll(
			"{{.InterruptedStatusChart}}",
			this.execInfo.totalInterrupted.toString()
		);

		// Edit Chart File
		let chartFileDetail = this.chart;
		let chartJsFileLabels = "";
		let chartJsFileData = "";
		let chartJsFileDataColor = "";
		let chartFileRows = "";
		chartFileDetail = chartFileDetail.replace("{{.ChartId}}", "chart-file");
		chartFileDetail = chartFileDetail.replace(
			"{{.TotalTests}}",
			this.execInfo.totalTests.toString()
		);
		chartFileDetail = chartFileDetail.replace(
			"{{.RowSpan}}",
			this.execInfo.execFiles.length.toString()
		);
		this.execInfo.execFiles.forEach((file, index) => {
			let chartRow = this.chartInfo;
			if (index == 0) {
				chartRow = chartRow.replace("{{.Label}}", file.filename);
				chartRow = chartRow.replace("{{.Value}}", file.totalTests.toString());
				chartRow = chartRow.replace(
					"{{.Percentage}}",
					round(
						(file.totalTests / this.execInfo.totalTests) * 100,
						2
					).toString()
				);
				chartJsFileLabels +=
					"'" + file.filename + " (" + file.totalTests.toString() + ")" + "'";
				chartJsFileData += file.totalTests.toString();
				chartJsFileDataColor += "'" + file.color + "'";
			} else {
				chartRow = chartRow.replace("{{.Label}}", file.filename);
				chartRow = chartRow.replace("{{.Value}}", file.totalTests.toString());
				chartRow = chartRow.replace(
					"{{.Percentage}}",
					round(
						(file.totalTests / this.execInfo.totalTests) * 100,
						2
					).toString()
				);
				chartJsFileLabels +=
					",'" + file.filename + " (" + file.totalTests.toString() + ")" + "'";
				chartJsFileData += "," + file.totalTests.toString();
				chartJsFileDataColor += ",'" + file.color + "'";
			}
			chartRow = chartRow.replaceAll("{{.Color}}", file.color);

			chartFileRows += chartRow;
		});
		this.chartFile = this.chartFile.replace("{{.Chart}}", chartFileDetail);
		this.chartFile = this.chartFile.replaceAll("{{.ChartFile}}", chartFileRows);
		this.chartJs = this.chartJs.replaceAll(
			"{{.FilesChartLabels}}",
			chartJsFileLabels
		);
		this.chartJs = this.chartJs.replaceAll(
			"{{.FilesChartData}}",
			chartJsFileData
		);
		this.chartJs = this.chartJs.replaceAll(
			"{{.FilesChartDataColor}}",
			chartJsFileDataColor
		);

		// Edit Chart Browser
		let chartBrowserDetail = this.chart;
		let chartJsBrowserLabels = "";
		let chartJsBrowserData = "";
		let chartJsBrowserDataColor = "";
		let chartBrowserRows = "";
		chartBrowserDetail = chartBrowserDetail.replace(
			"{{.ChartId}}",
			"chart-browser"
		);
		chartBrowserDetail = chartBrowserDetail.replace(
			"{{.TotalTests}}",
			this.execInfo.totalTests.toString()
		);
		chartBrowserDetail = chartBrowserDetail.replace(
			"{{.RowSpan}}",
			this.execInfo.execFiles.length.toString()
		);
		this.execInfo.execBrowsers.forEach((browser, index) => {
			let chartRow = this.chartInfo;
			if (index == 0) {
				chartRow = chartRow.replace("{{.Label}}", browser.browser);
				chartRow = chartRow.replace(
					"{{.Value}}",
					browser.totalTests.toString()
				);
				chartRow = chartRow.replace(
					"{{.Percentage}}",
					round(
						(browser.totalTests / this.execInfo.totalTests) * 100,
						2
					).toString()
				);
				chartJsBrowserLabels +=
					"'" +
					browser.browser +
					" (" +
					browser.totalTests.toString() +
					")" +
					"'";
				chartJsBrowserData += browser.totalTests.toString();
				chartJsBrowserDataColor += "'" + browser.color + "'";
			} else {
				chartRow = chartRow.replace("{{.Label}}", browser.browser);
				chartRow = chartRow.replace(
					"{{.Value}}",
					browser.totalTests.toString()
				);
				chartRow = chartRow.replace(
					"{{.Percentage}}",
					round(
						(browser.totalTests / this.execInfo.totalTests) * 100,
						2
					).toString()
				);
				chartJsBrowserLabels +=
					",'" +
					browser.browser +
					" (" +
					browser.totalTests.toString() +
					")" +
					"'";
				chartJsBrowserData += "," + browser.totalTests.toString();
				chartJsBrowserDataColor += ",'" + browser.color + "'";
			}
			chartRow = chartRow.replaceAll("{{.Color}}", browser.color);
			chartBrowserRows += chartRow;
		});
		this.chartBrowser = this.chartBrowser.replace(
			"{{.Chart}}",
			chartBrowserDetail
		);
		this.chartBrowser = this.chartBrowser.replaceAll(
			"{{.ChartBrowser}}",
			chartBrowserRows
		);
		this.chartJs = this.chartJs.replaceAll(
			"{{.BrowsersChartLabels}}",
			chartJsBrowserLabels
		);
		this.chartJs = this.chartJs.replaceAll(
			"{{.BrowsersChartData}}",
			chartJsBrowserData
		);
		this.chartJs = this.chartJs.replaceAll(
			"{{.BrowsersChartDataColor}}",
			chartJsBrowserDataColor
		);

		// Edit Summary Files
		let summaryFiles = this.summary;
		summaryFiles = summaryFiles.replace(
			"{{.SummaryTitleName}}",
			"Status by test file"
		);
		summaryFiles = summaryFiles.replace("{{.SummaryColumnName}}", "Filename");
		let filesSummaryRows = "";
		this.execInfo.execFiles.forEach((file) => {
			let filesSummaryRow = this.summaryRow;
			filesSummaryRow = filesSummaryRow.replace("{{.Name}}", file.filename);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.TotalTests}}",
				file.totalTests.toString()
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.TotalExecutionTime}}",
				this.help.convertMsToTime(
					new Date(file.endTime).getTime() - new Date(file.startTime).getTime()
				)
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.PassedValue}}",
				file.totalPassed.toString()
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.PassedPercentage}}",
				round((file.totalPassed / file.totalTests) * 100, 2).toString()
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.FailedValue}}",
				file.totalFailed.toString()
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.FailedPercentage}}",
				round((file.totalFailed / file.totalTests) * 100, 2).toString()
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.TimedOutValue}}",
				file.totalTimedOut.toString()
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.TimedOutPercentage}}",
				round((file.totalTimedOut / file.totalTests) * 100, 2).toString()
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.SkippedValue}}",
				file.totalSkipped.toString()
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.SkippedPercentage}}",
				round((file.totalSkipped / file.totalTests) * 100, 2).toString()
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.InterruptedValue}}",
				file.totalInterrupted.toString()
			);
			filesSummaryRow = filesSummaryRow.replace(
				"{{.InterruptedPercentage}}",
				round((file.totalInterrupted / file.totalTests) * 100, 2).toString()
			);
			filesSummaryRows += filesSummaryRow;
		});
		summaryFiles = summaryFiles.replace("{{.Data}}", filesSummaryRows);

		// Edit Summary Browsers
		let summaryBrowsers = this.summary;
		summaryBrowsers = summaryBrowsers.replace(
			"{{.SummaryTitleName}}",
			"Status by browser"
		);
		summaryBrowsers = summaryBrowsers.replace(
			"{{.SummaryColumnName}}",
			"Browser"
		);
		let browsersSummaryRows = "";
		this.execInfo.execBrowsers.forEach((browser) => {
			let browserSummaryRow = this.summaryRow;
			browserSummaryRow = browserSummaryRow.replace(
				"{{.Name}}",
				browser.browser
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.TotalTests}}",
				browser.totalTests.toString()
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.TotalExecutionTime}}",
				this.help.convertMsToTime(
					new Date(browser.endTime).getTime() -
						new Date(browser.startTime).getTime()
				)
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.PassedValue}}",
				browser.totalPassed.toString()
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.PassedPercentage}}",
				round((browser.totalPassed / browser.totalTests) * 100, 2).toString()
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.FailedValue}}",
				browser.totalFailed.toString()
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.FailedPercentage}}",
				round((browser.totalFailed / browser.totalTests) * 100, 2).toString()
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.TimedOutValue}}",
				browser.totalTimedOut.toString()
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.TimedOutPercentage}}",
				round((browser.totalTimedOut / browser.totalTests) * 100, 2).toString()
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.SkippedValue}}",
				browser.totalSkipped.toString()
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.SkippedPercentage}}",
				round((browser.totalSkipped / browser.totalTests) * 100, 2).toString()
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.InterruptedValue}}",
				browser.totalInterrupted.toString()
			);
			browserSummaryRow = browserSummaryRow.replace(
				"{{.InterruptedPercentage}}",
				round(
					(browser.totalInterrupted / browser.totalTests) * 100,
					2
				).toString()
			);
			browsersSummaryRows += browserSummaryRow;
		});
		summaryBrowsers = summaryBrowsers.replace("{{.Data}}", browsersSummaryRows);

		// Edit RunInfo
		this.runInfo = this.runInfo.replaceAll(
			"{{.Project}}",
			this.execOptions.project
		);
		this.runInfo = this.runInfo.replaceAll(
			"{{.Release}}",
			this.execOptions.release
		);
		this.runInfo = this.runInfo.replaceAll(
			"{{.TestEnvironment}}",
			this.execOptions.testEnvironment
		);
		this.runInfo = this.runInfo.replaceAll(
			"{{.StartTime}}",
			this.execInfo.startTime
		);
		this.runInfo = this.runInfo.replaceAll(
			"{{.EndTime}}",
			this.execInfo.endTime
		);
		this.runInfo = this.runInfo.replaceAll(
			"{{.TotalExecutionTime}}",
			this.help.convertMsToTime(
				new Date(this.execInfo.endTime).getTime() -
					new Date(this.execInfo.startTime).getTime()
			)
		);

		// Prepara test data
		let testCases = "";
		let testCasesDetails = "";
		let showRetries = false;

		for (const tc of this.testCases) {
			if (tc.testCase.retries > 0) {
				showRetries = true;
				break;
			}
		}

		this.testCases.forEach((testCase) => {
			let testCaseId = testCase.testCase.id + "-" + testCase.result.retry;
			let testCaseHtml = this.testCaseTemplate;

			testCaseHtml = testCaseHtml.replaceAll("{{.ModalID}}", testCaseId);

			if (showRetries === true) {
				testCaseHtml = testCaseHtml.replaceAll(
					"{{.Retry}}",
					'<td class="{{.TDClassesCss}}">' +
						(testCase.result.retry > 0
							? testCase.result.retry.toString()
							: "") +
						"</td>"
				);
			} else {
				testCaseHtml = testCaseHtml.replaceAll("{{.Retry}}", "");
			}
			testCaseHtml = testCaseHtml.replaceAll(
				"{{.TRClassesCss}}",
				"result-status-" + testCase.result.status
			);
			testCaseHtml = testCaseHtml.replaceAll(
				"{{.TDClassesCss}}",
				"result-status-" + testCase.result.status
			);
			testCaseHtml = testCaseHtml.replaceAll(
				"{{.Title}}",
				testCase.testCase.title
			);
			testCaseHtml = testCaseHtml.replaceAll(
				"{{.Status}}",
				testCase.result.status
			);
			testCaseHtml = testCaseHtml.replaceAll(
				"{{.File}}",
				this.help.getShortFilePath(
					testCase.testCase["_requireFile"],
					this.execOptions.testFolder
				)
			);
			testCaseHtml = testCaseHtml.replaceAll(
				"{{.Browser}}",
				testCase.testCase["_projectId"]
			);
			testCaseHtml = testCaseHtml.replaceAll(
				"{{.Duration}}",
				this.help.convertMsToTime(testCase.result.duration)
			);

			testCases += testCaseHtml;

			let testCaseDetailsHtml = this.testCaseDetailsTemplate;

			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.ModalID}}",
				testCaseId
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.ModalHeaderClassesCss}}",
				"label-status-" + testCase.result.status
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.ModalHeaderStatus}}",
				testCase.result.status
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.Title}}",
				testCase.testCase.title
			);

			// Add run info
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.InfoFilename}}",
				this.help.getShortFilePath(
					testCase.testCase["_requireFile"],
					this.execOptions.testFolder
				)
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.InfoBrowser}}",
				testCase.testCase["_projectId"]
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.InfoStartTime}}",
				testCase.result.startTime.toUTCString()
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.InfoTotalExecutionTime}}",
				this.help.convertMsToTime(testCase.result.duration)
			);
			if (showRetries === true) {
				testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
					"{{.InfoRetry}}",
					'<tr><th class="odhin-text">Retry</th><td class="text-secondary-emphasis fst-italic">' +
						testCase.result.retry.toString() +
						"</td></tr>"
				);
			} else {
				testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
					"{{.InfoRetry}}",
					""
				);
			}

			// Add errors
			let errors = "";
			let errorFile = "";
			if (
				testCase.result.status === "failed" ||
				testCase.result.status === "timedOut" ||
				testCase.result.status === "interrupted"
			) {
				if (testCase.result.errors !== undefined) {
					testCase.result.errors.forEach((err) => {
						if (err.stack !== undefined && err.stack !== "") {
							errors += err.stack + "\n\n";
							let lastLine = err.stack.match(/(.+)([^\s])/g) || "";
							errorFile = lastLine[lastLine.length - 1].split(" at ")[1];
						} else {
							errors += err.message + "\n\n";
						}
					});
				}
				testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
					"{{.ErrorsTabButton}}",
					this.help.printErrorsTabButton(testCaseId)
				);
				testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
					"{{.Errors}}",
					this.help.printErrors(
						errors,
						errorFile !== undefined
							? errorFile.length > 1
								? this.help.printErrorCode(errorFile)
								: ""
							: "",
						testCaseId
					)
				);
			} else {
				testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
					"{{.ErrorsTabButton}}",
					""
				);
				testCaseDetailsHtml = testCaseDetailsHtml.replaceAll("{{.Errors}}", "");
			}

			// Add steps
			let steps = "";
			testCase.result.steps.forEach((step, index) => {
				steps += this.help.printStep(testCaseId, index, step, 10);
			});
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.Steps}}",
				`<div class="row m-0 p-0"><div class="col m-0 p-0">` +
					steps +
					`</div></div>`
			);

			// Add Attachments
			let screenshots = "";
			let screenshotsComparison = "";
			let screenshotExpected: any;
			let screenshotActual: any;
			let screenshotDiff: any;
			let videos = "";
			let trace = "";

			testCase.result.attachments.forEach(async (attachment) => {
				if (attachment.contentType.startsWith("image/")) {
					if (attachment.name !== "screenshot") {
						if (attachment.name.includes("-expected.")) {
							screenshotExpected = attachment;
						} else if (attachment.name.includes("-actual.")) {
							screenshotActual = attachment;
						} else if (attachment.name.includes("-diff.")) {
							screenshotDiff = attachment;
						} else {
							screenshots +=
								attachment.path !== undefined
									? this.help.printScreenshot(testCaseId, attachment)
									: attachment.body !== undefined
									? this.help.printImage(testCaseId, attachment)
									: "";
						}
					} else {
						screenshots +=
							attachment.path !== undefined
								? this.help.printScreenshot(testCaseId, attachment)
								: attachment.body !== undefined
								? this.help.printImage(testCaseId, attachment)
								: "";
					}
				} else if (attachment.contentType.startsWith("video/")) {
					videos +=
						attachment.path !== undefined
							? this.help.printVideo(testCaseId, attachment)
							: "";
				} else if (
					attachment.contentType.startsWith("application/") &&
					attachment.name === "trace"
				) {
					trace =
						attachment.path !== undefined
							? this.help.printTrace(testCaseId, attachment)
							: "";
				}
			});

			if (
				screenshotExpected !== undefined &&
				screenshotActual !== undefined &&
				screenshotDiff !== undefined
			) {
				screenshotsComparison += this.help.printScreenshotComparison(
					testCaseId,
					screenshotExpected,
					screenshotActual,
					screenshotDiff
				);
			}

			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.ScreenshotsTabButton}}",
				screenshotsComparison !== "" || screenshots !== ""
					? this.help.printScreenshotsTabButton(testCaseId)
					: ""
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.Screenshots}}",
				screenshotsComparison !== "" || screenshots !== ""
					? this.help.printScreenshots(
							screenshotsComparison + screenshots,
							testCaseId
					  )
					: ""
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.VideosTabButton}}",
				videos !== "" ? this.help.printVideosTabButton(testCaseId) : ""
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.Videos}}",
				videos !== "" ? this.help.printVideos(videos, testCaseId) : ""
			);

			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.TraceTabButton}}",
				trace !== "" ? this.help.printTraceTabButton(testCaseId) : ""
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll("{{.Trace}}", trace);

			let stdout = testCase.result.stdout.toString();
			//stdout = "";
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.StdoutTabButton}}",
				stdout !== "" ? this.help.printStdoutTabButton(testCaseId) : ""
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.Stdout}}",
				stdout !== "" ? this.help.printStdout(testCaseId, stdout) : ""
			);

			let stderr = testCase.result.stderr.toString();
			//stderr = "";
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.StderrTabButton}}",
				stderr !== "" ? this.help.printStderrTabButton(testCaseId) : ""
			);
			testCaseDetailsHtml = testCaseDetailsHtml.replaceAll(
				"{{.Stderr}}",
				stderr !== "" ? this.help.printStderr(testCaseId, stderr) : ""
			);

			testCasesDetails += testCaseDetailsHtml;
		});

		this.content = this.content.replace("{{.TestCases}}", testCases);
		this.content = this.content.replaceAll(
			"{{.TestCasesDetails}}",
			testCasesDetails
		);

		if (showRetries === true) {
			this.content = this.content.replaceAll(
				"{{.RetryColumn}}",
				"<th>Retry</th>"
			);
		} else {
			this.content = this.content.replaceAll("{{.RetryColumn}}", "");
		}

		// Add Information to the base HTML file
		this.base = this.help.updateHtml(
			this.base,
			"{{.BootstrapCss}}",
			this.bootstrapCss,
			"css",
			"bootstrap.css"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.JQueryDataTablesCss}}",
			this.jqueryDataTablesCss,
			"css",
			"jquery-datatable.css"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.PrismCss}}",
			this.prismCss,
			"css",
			"prism.css"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.CssTheme}}",
			this.cssTheme,
			"css",
			"theme.css"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.CssColors}}",
			this.cssColors,
			"css",
			"style-colors.css"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.Css}}",
			this.css,
			"css",
			"style.css"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.ImgComparisonSliderCss}}",
			this.imgComparisonSliderCss,
			"css",
			"img-comparison-slider.css"
		);

		this.base = this.help.updateHtml(
			this.base,
			"{{.ImgComparisonSliderJs}}",
			this.imgComparisonSliderJs,
			"js",
			"img-comparison-slider.js"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.jQuery}}",
			this.jQuery,
			"js",
			"jquery.js"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.JQueryDataTablesJs}}",
			this.jqueryDataTablesJs,
			"js",
			"jquery-datatable.js"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.DataTables}}",
			this.dataTables,
			"js",
			"datatable.js"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.ChartJsLibrary}}",
			this.chartJsLibrary,
			"js",
			"chartjs-library.js"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.ChartJs}}",
			this.chartJs,
			"js",
			"chartjs.js"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.Js}}",
			this.js,
			"js",
			"script.js"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.BootstrapJs}}",
			this.bootstrapJs,
			"js",
			"bootstrap.js"
		);
		this.base = this.help.updateHtml(
			this.base,
			"{{.PrismJs}}",
			this.prismJs,
			"js",
			"prism.js"
		);

		this.base = this.base.replaceAll("{{.Title}}", this.execOptions.title);
		this.base = this.base.replace("{{.RunInfo}}", this.runInfo);
		this.base = this.base.replace("{{.ChartStatus}}", this.chartStatus);
		this.base = this.base.replace("{{.ChartFile}}", this.chartFile);
		this.base = this.base.replace("{{.ChartBrowser}}", this.chartBrowser);
		this.base = this.base.replace("{{.SummaryFiles}}", summaryFiles);
		this.base = this.base.replace("{{.SummaryBrowsers}}", summaryBrowsers);
		this.base = this.base.replace("{{.Content}}", this.content);

		// Create the final HTML report file
		this.help.createFile(
			this.execOptions.outputFolder + "/" + this.INDEX_FILE,
			this.base
		);

		if (this.execOptions.consoleLog === true) {
			console.log(`${bold(blue(` `))}`);
			console.log(`${bold(blue(`-------------------------------------`))}`);
		}

		if (this.execOptions.startServer === true) {
			let port = await this.help.getPortFree();
			const execPromise = util.promisify(exec);
			try {
				if (this.execOptions.consoleLog === true) {
					console.log(`${bold(blue(` `))}`);
					console.log(
						`${bold(
							blue(
								`Serving HTML report at http://localhost:${port}. Press Ctrl+C to quit.`
							)
						)}`
					);
					console.log(`${bold(blue(` `))}`);
				}
				const cmd =
					"node " +
					path.resolve(__dirname, "") +
					"/server.mjs " +
					port +
					" " +
					this.execOptions.outputFolder +
					" " +
					this.INDEX_FILE;
				const { stdout, stderr } = await execPromise(cmd);
				if (this.execOptions.consoleLog === true) {
					console.log(stdout);
				}
				if (this.execOptions.consoleError === true) {
					console.error(stderr);
				}
			} catch (error) {
				if (this.execOptions.consoleError === true) {
					console.error(error);
				}
			}
		}
	}

	async onStdOut(chunk: string) {
		if (this.execOptions.consoleTestOutput === true) {
			console.log(chunk.toString());
		}
	}

	async onStdErr(chunk: string) {
		if (this.execOptions.consoleTestOutput === true) {
			console.log(chunk.toString());
		}
	}
}

export default OdhinPlaywrightReporter;
