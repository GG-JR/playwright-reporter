import ansi2html from "ansi-to-html";
import { TestStep } from "@playwright/test/reporter";
import path from "path";
import fs from "fs";
import fse from "fs-extra";
import { ExecOptions } from "./types/execOptions.types";
import portfinder from "portfinder";

class Help {
	private execOptions: ExecOptions;
	private ansiRegex = new RegExp(
		"[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
		"g"
	);
	private ansiColors = {
		0: "#000",
		1: "#d85a51",
		2: "#0C0",
		3: "#d68043",
		4: "#00C",
		5: "#C0C",
		6: "#0CC",
		7: "#CCC",
		8: "#555",
		9: "#F55",
		10: "#5F5",
		11: "#FF5",
		12: "#55F",
		13: "#F5F",
		14: "#5FF",
		15: "#FFF",
	};
	private errorCodeLinesToPrint = 4;
	private stepCodeLinesToPrint = 1;
	private freePort = 0;
	public showError = true;

	constructor(execOptions: ExecOptions) {
		this.execOptions = execOptions;
	}

	convertMsToTime(duration: number) {
		let milliseconds = duration;
		let seconds = Math.floor(milliseconds / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);

		milliseconds = milliseconds % 1000;
		seconds = seconds % 60;
		minutes = minutes % 60;
		hours = hours % 24;

		let out = "";

		out += hours.toString() + "h ";
		out += minutes.toString() + "m ";
		out += seconds.toString() + "s ";
		out += milliseconds.toString() + "ms ";

		return out;
	}

	htmlEncode(input) {
		return input
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}

	getRandomColor() {
		var length = 6;
		var chars = "0123456789ABCDEF";
		var hex = "#";
		while (length--) hex += chars[(Math.random() * 16) | 0];
		return hex;
	}

	stripAnsi(str: string): string {
		return str.replace(this.ansiRegex, "");
	}

	escapeHTML(text: string): string {
		return text.replace(
			/[&"<>]/g,
			(c) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" }[c]!)
		);
	}

	ansi2htmlMarkup(text: string) {
		const config: any = {
			//bg: "var(--vscode-panel-background)",
			//fg: "var(--vscode-foreground)",
			colors: this.ansiColors,
		};
		return new ansi2html(config).toHtml(this.escapeHTML(text));
	}

	printStep(
		id: string,
		count: number,
		testStep: TestStep,
		space: number
	): string {
		let icon = "";
		let statusClass = "";
		let title = "";
		let body = "";
		if (testStep.error !== undefined) {
			icon = `<span class="material-icons step-error">clear</span>`;
			statusClass = "step-error-hover";
		} else {
			icon = `<span class="material-icons step-ok">check</span>`;
			statusClass = "step-ok-hover";
		}

		if (testStep.location !== undefined) {
			title = `<p class="stepLine" style="padding-left: ${space}px">${
				icon +
				" " +
				testStep.title +
				" | <span class='fst-italic'>" +
				testStep.location.file.replace(path.resolve("./") + "/", "") +
				":" +
				testStep.location.line
			}</span><label class="stepLineDuration">${this.convertMsToTime(
				testStep.duration
			)}</label></p>`;

			let code = this.printCode(
				testStep.location.file,
				testStep.location.line,
				this.stepCodeLinesToPrint
			);

			let startLine =
				testStep.location.line - this.stepCodeLinesToPrint <= 0
					? 1
					: testStep.location.line - this.stepCodeLinesToPrint;
			body += `<pre style="margin-left: ${
				space + 20
			}px;" class="line-numbers" data-start="${startLine}" >${code}</pre>`;
		} else {
			title = `<p class="stepLine" style="padding-left: ${space}px">${
				icon + " " + testStep.title
			}<label class="stepLineDuration">${this.convertMsToTime(
				testStep.duration
			)}</label></p>`;
		}

		if (testStep.steps !== undefined) {
			testStep.steps.forEach((step, index) => {
				body += this.printStep(id, count + 10000 + index, step, space + 40);
			});
		}

		if (body !== "") {
			return `<div class="accordion accordion-flush " id="${id}-${count}-accordionFlush">
						<div class="accordion-item">
							<h2 class="accordion-header ${statusClass}">
								<button class="accordion-button accordion-steps collapsed ${statusClass}" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse-${id}-${count}" aria-expanded="false" aria-controls="flush-collapse-${id}-${count}">
								${title}
								</button>
							</h2>
							<div id="flush-collapse-${id}-${count}" class="accordion-collapse collapse" data-bs-parent="#${id}-${count}-accordionFlush">			
								<div class="accordion-body accordion-body-steps">
								${body}
								</div>
							</div>
						</div>
					</div>`;
		} else {
			return `<div class="accordion accordion-flush " id="${id}-${count}-accordionFlush">
						<div class="accordion-item">
							<h2 class="accordion-header ${statusClass}">
								<button class="accordion-steps-no-link ${statusClass}" type="button" >
								${title}
								</button>
							</h2>
						</div>
					</div>`;
		}
	}

	processLineByLine(
		filename: string,
		lineNumber: number,
		lines: number
	): string {
		let result = "";
		try {
			let codeLines = fs.readFileSync(filename, "utf-8").split(/\r?\n/);
			codeLines.forEach(async (line, index) => {
					let indx = index + 1;
					if (indx >= lineNumber - lines && indx <= lineNumber + lines) {
						result += line + "\n";
					}
				});
			return result;
		} catch (error) {
			return "";
		}
	}

	printErrorsTabButton(modalId: string): string {
		return `<button class="result-tablinks-${modalId}" onclick="openResultTab(event, 'TabErrors-${modalId}', '${modalId}')">Errors</button>`;
	}

	printErrors(errors: string, errorCode: string, modalId: string): string {
		return `<div id="TabErrors-${modalId}" style="display: none" class="result-tabcontent result-tabcontent-${modalId}">
		<pre class="container-fluid text-left pre">${this.ansi2htmlMarkup(errors)}</pre>
		${errorCode}
		</div>`;
	}

	printErrorCode(errorFile: string): string {
		let delimiter = ':';
		let start = -2;
		let errorFileLine = errorFile.split(delimiter).slice(start)[0];
		let errorFilename = errorFile.split(delimiter).slice(0,start).join(delimiter);
		let startLine =
			Number(errorFileLine) - this.errorCodeLinesToPrint <= 0
				? 1
				: Number(errorFileLine) - this.errorCodeLinesToPrint;
		return `<pre class="line-numbers" data-start="${startLine}" >${this.printCode(
			errorFilename,
			Number(errorFileLine),
			this.errorCodeLinesToPrint
		)}</pre>`;
	}

	printCode(filename: string, fileLine: number, lines: number): string {
		return (
			`<code class="language-typescript">` +
			this.ansi2htmlMarkup(this.processLineByLine(filename, fileLine, lines)) +
			`</code>`
		);
	}

	printScreenshotComparison(
		id: string,
		attachmentExpected: any,
		attachmentActual: any,
		attachmentDiff: any
	): string {
		let output = "";
		let base64ExpectedImage = this.convertBase64(attachmentExpected.path);
		let base64ActualImage = this.convertBase64(attachmentActual.path);
		let base64DiffImage = this.convertBase64(attachmentDiff.path);		
		let expectedFileType = attachmentExpected.contentType?.split("/").pop();		
		let actualFileType = attachmentActual.contentType?.split("/").pop();		
		let diffFileType = attachmentDiff.contentType?.split("/").pop();
		
		attachmentExpected.name = (attachmentExpected.name.slice(-4) === "."+expectedFileType ? attachmentExpected.name.slice(0,-4) : attachmentExpected.name);
		attachmentActual.name = (attachmentActual.name.slice(-4) === "."+actualFileType ? attachmentActual.name.slice(0,-4) : attachmentActual.name);
		attachmentDiff.name = (attachmentDiff.name.slice(-4) === "."+diffFileType ? attachmentDiff.name.slice(0,-4) : attachmentDiff.name);

		if (
			base64ExpectedImage !== "" &&
			base64ActualImage !== "" &&
			base64DiffImage !== ""
		) {
			if (this.execOptions.embedAttachments === true) {
				output = `
					<div class="row ms-3 me-3"><div class="col text-center">			 
					<img-comparison-slider tabindex="0" class="rendered odhin-border coloured-slider">
					<figure slot="first" class="before">
					<img src="data:${attachmentExpected.contentType};base64,${base64ExpectedImage}" class="control-attachment-size">
					<figcaption>Expected</figcaption>
					</figure>
					<figure slot="second" class="after">
					<img src="data:${attachmentActual.contentType};base64,${base64ActualImage}" class="control-attachment-size">
					<figcaption>Actual</figcaption>
					</figure>
					</img-comparison-slider>	 
					</div></div>

					<div class="row ms-3 me-3">					
					<div class="col text-end odhin-attachments-label">${attachmentExpected.name+"."+expectedFileType}</div>
					<div class="col text-start odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${attachmentExpected.name+"."+expectedFileType}" href="data:${attachmentExpected.contentType};base64,${base64ExpectedImage}">Download Expected <span class="material-icons">file_download</span></a></div>
					</div>
					
					<div class="row ms-3 me-3">	
					<div class="col text-end odhin-attachments-label">${attachmentActual.name+"."+actualFileType}</div>
					<div class="col text-start odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${attachmentActual.name+"."+actualFileType}" href="data:${attachmentActual.contentType};base64,${base64ActualImage}">Download Actual <span 	class="material-icons">file_download</span></a></div>
					</div>
					
					<div class="row ms-3 me-3 mb-5 odhin-thin-border-bottom">	
					<div class="col text-end odhin-attachments-label">${attachmentDiff.name+"."+actualFileType}</div>
					<div class="col text-start odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${attachmentDiff.name+"."+actualFileType}" href="data:${attachmentDiff.contentType};base64,${base64DiffImage}">Download Diff <span 	class="material-icons">file_download</span></a></div>
					</div>`;
			} else {
				let finalExpectedFilename = this.base64ToFile(
					base64ExpectedImage,
					this.execOptions.outputFolder +
						"/screenshots/" +
						id +
						"/" +
						attachmentExpected.name +
						"." +
						expectedFileType
				);
				let finalActualFilename = this.base64ToFile(
					base64ActualImage,
					this.execOptions.outputFolder +
						"/screenshots/" +
						id +
						"/" +
						attachmentActual.name +
						"." +
						actualFileType
				);
				let finalDiffFilename = this.base64ToFile(
					base64DiffImage,
					this.execOptions.outputFolder +
						"/screenshots/" +
						id +
						"/" +
						attachmentDiff.name +
						"." +
						diffFileType
				);
				output = `
					<div class="row ms-3 me-3"><div class="col text-center">			 
					<img-comparison-slider tabindex="0" class="rendered odhin-thin-border coloured-slider">
					<figure slot="first" class="before">
					<img src="screenshots/${id + "/" + finalExpectedFilename}" class="control-attachment-size">
					<figcaption>Expected</figcaption>
					</figure>
					<figure slot="second" class="after">
					<img src="screenshots/${id + "/" + finalActualFilename}" class="control-attachment-size">
					<figcaption>Actual</figcaption>
					</figure>
					</img-comparison-slider>	 
					</div></div>

					<div class="row ms-3 me-3">					
					<div class="col text-end odhin-attachments-label">${finalExpectedFilename}</div>
					<div class="col text-start odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${finalExpectedFilename}" href="screenshots/${
						id + "/" + finalExpectedFilename
					}">Download Expected <span 	class="material-icons">file_download</span></a></div>
					</div>
					
					<div class="row ms-3 me-3">	
					<div class="col text-end odhin-attachments-label">${finalActualFilename}</div>
					<div class="col text-start odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${finalActualFilename}" href="screenshots/${
						id + "/" + finalActualFilename
					}">Download Actual <span 	class="material-icons">file_download</span></a></div>
					</div>
					
					<div class="row ms-3 me-3 mb-5 odhin-thin-border-bottom">	
					<div class="col text-end odhin-attachments-label">${finalDiffFilename}</div>
					<div class="col text-start odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${finalDiffFilename}" href="screenshots/${
						id + "/" + finalDiffFilename
					}">Download Diff <span 	class="material-icons">file_download</span></a></div>
					</div>`;
			}
		}

		return output;
	}

	printScreenshot(id: string, attachment: any): string {
		let output = "";
		let base64Image = this.convertBase64(attachment.path);
		let screenshotFilename = attachment.path.replace("\\", "/").split("/").pop()

		if (base64Image !== "") {
			if (this.execOptions.embedAttachments === true) {
				output = `
					<div class="row ms-3 me-3"><div class="col text-center"><img src="data:${attachment.contentType};base64,${base64Image}" class="img-fluid mt-3 odhin-thin-border control-attachment-size" alt="Screenshot"></div></div><div class="row ms-3 me-3 mb-5 odhin-thin-border-bottom"><div class="col text-end odhin-attachments-label">${screenshotFilename}</div><div class="col text-left odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${attachment.name}" href="data:${attachment.contentType};base64,${base64Image}">Download <span class="material-icons">file_download</span></a></div></div>`;
			} else {
				let finalFilename = this.base64ToFile(
					base64Image,
					this.execOptions.outputFolder +
						"/screenshots/" +
						id +
						"/" +
						screenshotFilename
				);
				output = `
				<div class="row ms-3 me-3"><div class="col text-center"><img src="screenshots/${
					id + "/" + finalFilename
				}" class="img-fluid mt-3 odhin-thin-border control-attachment-size" alt="Screenshot"></div></div>
				<div class="row ms-3 me-3 mb-5 odhin-thin-border-bottom"><div class="col text-end odhin-attachments-label">${screenshotFilename}</div>
				<div class="col text-left odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${
					finalFilename
				}" href="screenshots/${
					id + "/" + finalFilename
				}">Download <span class="material-icons">file_download</span></a></div></div>`;
			}
		}

		return output;
	}

	printImage(id: string, attachment: any): string {
		let output = "";
		let base64Image = Buffer.from(attachment.body).toString("base64");
		let fileType = attachment.contentType?.split("/").pop();
		if (base64Image !== "") {
			if (this.execOptions.embedAttachments === true) {
				output = `
					<div class="row ms-3 me-3"><div class="col text-center"><img src="data:${
						attachment.contentType
					};base64,${base64Image}" class="img-fluid mt-3 odhin-thin-border control-attachment-size" alt="Screenshot"></div></div>
					<div class="row ms-3 me-3 mb-5 odhin-thin-border-bottom"><div class="col text-end odhin-attachments-label">${attachment.name+"."+fileType}</div><div class="col text-left odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${
					attachment.name + "." + fileType
				}" href="data:${
					attachment.contentType
				};base64,${base64Image}">Download <span class="material-icons">file_download</span></a></div></div>`;
			} else {
				let finalFilename = this.base64ToFile(
					base64Image,
					this.execOptions.outputFolder +
						"/screenshots/" +
						id +
						"/" +
						attachment.name +
						"." +
						fileType
				);
				output = `
				<div class="row ms-3 me-3"><div class="col text-center"><img src="screenshots/${
					id + "/" + finalFilename
				}" class="img-fluid mt-3 odhin-thin-border control-attachment-size" alt="Screenshot"></div></div>
				<div class="row ms-3 me-3 mb-5 odhin-thin-border-bottom"><div class="col text-end odhin-attachments-label">${attachment.name+"."+fileType}</div>
				<div class="col text-left odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${
					finalFilename
				}" href="screenshots/${
					id + "/" + finalFilename
				}">Download <span class="material-icons">file_download</span></a></div></div>`;
			}
		}
		return output;
	}

	printScreenshotsTabButton(modalId: string): string {
		return `<button class="result-tablinks-${modalId}" onclick="openResultTab(event, 'TabScreenshots-${modalId}', '${modalId}')">Screenshots</button>`;
	}

	printScreenshots(screenshots: string, modalId: string): string {
		return `<div id="TabScreenshots-${modalId}" style="display: none" class="result-tabcontent result-tabcontent-${modalId}">${screenshots}</div>`;
	}

	printVideo(id: string, attachment: any): string {
		let output = "";
		let base64Video = this.convertBase64(attachment.path);
		let videoFilename = attachment.path.replace("\\", "/").split("/").pop()
		if (base64Video !== "") {
			if (this.execOptions.embedAttachments === true) {
				output = `
					<div class="row ms-3 me-3"><div class="col text-center"><video controls playsinline autoplay muted loop src="data:${
						attachment.contentType
					};base64,${base64Video}" class="object-fit-contain mt-3 odhin-thin-border control-attachment-size" autoplay></video></div></div>
					<div class="row ms-3 me-3 mb-5 odhin-thin-border-bottom"><div class="col text-end odhin-attachments-label">${videoFilename}</div>
					<div class="col text-left odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${
						videoFilename
				}" href="data:${
					attachment.contentType
				};base64,${base64Video}">Download <span class="material-icons">file_download</span></a></div></div>`;
			} else {
				let finalFilename = this.base64ToFile(
					base64Video,
					this.execOptions.outputFolder +
						"/videos/" +
						id +
						"/" +
						videoFilename
				);
				output = `
					<div class="row ms-3 me-3"><div class="col text-center"><video controls playsinline autoplay muted loop src="videos/${
						id + "/" + finalFilename
					}" class="object-fit-contain mt-3 odhin-thin-border control-attachment-size" autoplay></video></div></div>
					<div class="row ms-3 me-3 mb-5 odhin-thin-border-bottom"><div class="col text-end odhin-attachments-label">${videoFilename}</div>
					<div class="col text-left odhin-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${
					finalFilename
				}" href="videos/${
					id + "/" + finalFilename
				}">Download <span class="material-icons">file_download</span></a></div></div>`;
			}
		}

		return output;
	}

	printVideosTabButton(modalId: string): string {
		return `<button class="result-tablinks-${modalId}" onclick="openResultTab(event, 'TabVideos-${modalId}', '${modalId}')">Videos</button>`;
	}

	printVideos(videos: string, modalId: string): string {
		return `<div id="TabVideos-${modalId}" style="display: none" class="result-tabcontent result-tabcontent-${modalId}">${videos}</div>`;
	}

	printStdoutTabButton(modalId: string): string {
		return `<button class="result-tablinks-${modalId}" onclick="openResultTab(event, 'TabStdout-${modalId}', '${modalId}')">Stdout</button>`;
	}

	printStdout(id: string, stdout: string): string {
		return `<div id="TabStdout-${id}" style="display: none" class="result-tabcontent result-tabcontent-${id}">
		<div class="row ps-3 pe-3"><div class="col"><pre class="pre"><code>${this.htmlEncode(
			stdout.replaceAll('"', "'").replaceAll('\n,', "\n")
		)}</code></pre></div></div><div class="row ms-3 me-3"><div class="col text-center odhin-attachments-buttons-card-no-bottom"><a class="download-btn" target="_Blank" download="stdout.txt" href="data:text/html,${this.htmlEncode(
			stdout.replaceAll('"', "'").replaceAll('\n,', "\n")
		)}">Download Stdout <span class="material-icons">file_download</span></a></div>
		</div></div>`;
	}

	printStderrTabButton(modalId: string): string {
		return `<button class="result-tablinks-${modalId}" onclick="openResultTab(event, 'TabStderr-${modalId}', '${modalId}')">Stderr</button>`;
	}

	printStderr(id: string, stderr: string): string {
		return `<div id="TabStderr-${id}" style="display: none" class="result-tabcontent result-tabcontent-${id}">
		<div class="row ps-3 pe-3"><div class="col"><pre class="pre"><code>${this.htmlEncode(
			stderr.replaceAll('"', "'").replaceAll('\n,', "\n")
		)}</code></pre></div></div><div class="row ms-3 me-3"><div class="col text-center odhin-attachments-buttons-card-no-bottom"><a class="download-btn" target="_Blank" download="stderr.txt" href="data:text/html,${this.htmlEncode(
			stderr.replaceAll('"', "'").replaceAll('\n,', "\n")
		)}">Download Stderr <span class="material-icons">file_download</span></a></div>
		</div></div>`;
	}

	printTraceTabButton(modalId: string): string {
		return `<button class="result-tablinks-${modalId}" onclick="openResultTab(event, 'TabTrace-${modalId}', '${modalId}')">Trace</button>`;
	}

	printTrace(id: string, attachment: any): string {
		let output = "";
		let base64trace = this.convertBase64(attachment.path);
		let fileType = attachment.contentType?.split("/").pop();

		if (base64trace !== "") {
			if (this.execOptions.embedAttachments === true) {
				output = `
					<div class="row ms-3 me-3 mb-5"><div class="col text-center odhin-attachments-buttons-card-no-bottom"><a class="download-btn" target="_Blank" download="${attachment.name}" href="data:${attachment.contentType};base64,${base64trace}">Download Trace <span class="material-icons">file_download</span></a></div></div>`;
			} else {
				let finalFilename = this.base64ToFile(
					base64trace,
					this.execOptions.outputFolder +
						"/traces/" +
						id +
						"/" +
						attachment.name +
						"." +
						fileType
				);
				output = `
					<div class="row ms-3 me-3 mb-1"><div class="col text-center odhin-attachments-buttons-card-no-bottom"><a class="download-btn" target="_Blank" download="${finalFilename}" href="traces/${
					id + "/" + finalFilename
				}">Download Trace <span class="material-icons">file_download</span></a></div></div>`;
			}
		}

		return `<div id="TabTrace-${id}" style="display: none" class="result-tabcontent result-tabcontent-${id}">${output}</div>`;
	}

	convertBase64(fileToConvert: string): string {
		try {
			return fs.readFileSync(fileToConvert, { encoding: "base64" });
		} catch (err) {
			return "";
		}
	}

	getShortFilePath(filepath: string, testFolder: string): string {
		if (filepath.includes("/" + testFolder + "/")) {
			return filepath.split("/" + testFolder + "/")[1];
		} else if (filepath.includes("\\" + testFolder + "\\")) {
			return filepath.split("\\" + testFolder + "\\")[1];
		} else {
			return filepath;
		}
	}

	createFile(filepath: string, content: string) {
		try {
			fse.outputFileSync(filepath, content);
		} catch (err) {
			if(this.showError === true){
				console.error("Error creating file: " + filepath);
			}
		}
	}

	updateHtml(
		html: string,
		tag: string,
		content: string,
		contentType: string,
		filename: string,
	): string {
		let output = "";
		if (this.execOptions.embedAssets === true) {
			if (contentType === "css") {
				output = html.replace(tag, "<style>" + content + "</style>");
			} else if (contentType === "js") {
				output = html.replace(
					tag,
					"<script type='text/javascript'>" + content + "</script>"
				);
			}
		} else {
			if (contentType === "css") {
				this.createFile(
					this.execOptions.outputFolder + "/css/" + filename,
					content
				);
				output = html.replace(
					tag,
					"<link rel='stylesheet' href='css/" + filename + "' >"
				);
			} else if (contentType === "js") {
				this.createFile(
					this.execOptions.outputFolder + "/js/" + filename,
					content
				);
				output = html.replace(
					tag,
					"<script type='text/javascript' src='js/" + filename + "' ></script>"
				);
			}
		}

		return output;
	}

	base64ToFile(base64data: string, filePath: string, index?: number) {
		if (fs.existsSync(filePath)) {
			let newIndex = index !== undefined && index > 0 ? index + 1 : 1;
			let filename: any = filePath.split("/").pop();
			let splitName = filename.split(".");
			let newFilePath = filePath.replaceAll(
				filename,
				splitName[0] + "_" + newIndex + "." + splitName[1]
			);

			return this.base64ToFile(base64data, newFilePath, newIndex);
		} else {
			let buf = Buffer.from(base64data, "base64");
			fse.outputFileSync(filePath, buf);
			return filePath.split("/").pop()?.toString();
		}
	}

	async getPortFree() {
		await portfinder
			.getPortPromise()
			.then((port) => {
				this.freePort = port;
			})
			.catch((err) => {
				throw err;
			});
		return this.freePort.toString();
	}
}

export default Help;
