const form = document.getElementById("check-form");
const input = document.getElementById("url-input");
const button = document.getElementById("check-button");
const errorEl = document.getElementById("error");
const loadingEl = document.getElementById("loading");
const resultsEl = document.getElementById("results");
const cardsEl = document.getElementById("cards");
const rawTableBody = document.querySelector("#raw-table tbody");
const appTitleEl = document.getElementById("app-title");
const appDescriptionEl = document.getElementById("app-description");
const rawTagsHeadingEl = document.getElementById("raw-tags-heading");
const langSwitchEl = document.getElementById("lang-switch");
const themeToggleEl = document.getElementById("theme-toggle");

const tabUrlBtn = document.getElementById("tab-url");
const tabManualBtn = document.getElementById("tab-manual");
const panelUrl = document.getElementById("panel-url");
const panelManual = document.getElementById("panel-manual");
const manualForm = document.getElementById("manual-form");
const manualTitle = document.getElementById("manual-title");
const manualDesc = document.getElementById("manual-desc");
const manualSite = document.getElementById("manual-site");
const manualImageUrl = document.getElementById("manual-image-url");
const manualImageFile = document.getElementById("manual-image-file");
const manualButton = document.getElementById("manual-button");
const fileChooseButton = document.getElementById("file-choose-button");
const fileNameDisplay = document.getElementById("file-name-display");

const THEME_STORAGE_KEY = "ogp-theme";
let lastData = null;

// Add an entry here to support another platform — no other code changes needed.
const PLATFORMS = [
	{ id: "facebook", label: "Facebook", color: "#1877F2", style: "large", source: "og", titleLimit: 60, descLimit: 155 },
	{ id: "linkedin", label: "LinkedIn", color: "#0A66C2", style: "large", source: "og", titleLimit: 70, descLimit: 150 },
	{ id: "line", label: "LINE", color: "#00C300", style: "large", source: "og", titleLimit: 60, descLimit: 112 },
	{ id: "x", label: "X (Twitter)", color: "#000000", style: "rounded", source: "twitter", titleLimit: 70, descLimit: 200 },
	{ id: "whatsapp", label: "WhatsApp", color: "#25D366", style: "compact-left", source: "og", titleLimit: 65, descLimit: 65 },
	{ id: "wechat", label: "WeChat", color: "#07C160", style: "compact-right", source: "og", titleLimit: 40, descLimit: 0 },
	{ id: "slack", label: "Slack", color: "#4A154B", style: "chat", theme: "light", source: "og", titleLimit: 100, descLimit: 300 },
	{ id: "discord", label: "Discord", color: "#5865F2", style: "chat", theme: "dark", source: "og", titleLimit: 256, descLimit: 350 },
];

function normalizeInputUrl(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return "";
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

function truncate(text, limit) {
	if (!limit || !text || text.length <= limit) {
		return { display: text, truncated: false };
	}
	return { display: `${text.slice(0, limit).trimEnd()}…`, truncated: true, over: text.length - limit };
}

function resolveContent(data, platform, hostname) {
	const useTwitter = platform.source === "twitter";
	const title = (useTwitter ? data.twitterTitle : data.title) || data.title || "";
	const description = (useTwitter ? data.twitterDescription : data.description) || data.description || "";
	const image = (useTwitter ? data.twitterImage : data.image) || data.image || "";
	return {
		title,
		description,
		image,
		site: data.siteName || hostname,
	};
}

function el(tag, className, text) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text != null) node.textContent = text;
	return node;
}

function buildImage(url, className) {
	const img = document.createElement("img");
	img.className = className;
	img.alt = "";
	if (url) img.src = url;
	else img.hidden = true;
	return img;
}

function buildLargeCard(content) {
	const card = el("div", "mock large-card");
	const imgWrap = el("div", "large-image-wrap");
	imgWrap.appendChild(buildImage(content.image, "large-image"));
	if (!content.image) imgWrap.hidden = true;
	card.appendChild(imgWrap);
	const body = el("div", "large-body");
	body.appendChild(el("div", "mock-site", (content.site || "").toUpperCase()));
	body.appendChild(el("div", "mock-title", content.titleText));
	if (content.descText) body.appendChild(el("div", "mock-desc", content.descText));
	card.appendChild(body);
	return card;
}

function buildRoundedCard(content) {
	const card = el("div", "mock rounded-card");
	const imgWrap = el("div", "rounded-image-wrap");
	imgWrap.appendChild(buildImage(content.image, "rounded-image"));
	if (!content.image) imgWrap.hidden = true;
	card.appendChild(imgWrap);
	const body = el("div", "rounded-body");
	body.appendChild(el("div", "mock-title", content.titleText));
	if (content.descText) body.appendChild(el("div", "mock-desc", content.descText));
	body.appendChild(el("div", "mock-site", content.site));
	card.appendChild(body);
	return card;
}

function buildCompactCard(content, side) {
	const card = el("div", `mock compact-card compact-${side}`);
	const text = el("div", "compact-body");
	text.appendChild(el("div", "mock-title compact-title", content.titleText));
	if (content.descText) text.appendChild(el("div", "mock-desc", content.descText));
	text.appendChild(el("div", "mock-site", content.site));
	const thumb = el("div", "compact-thumb");
	thumb.appendChild(buildImage(content.image, "compact-image"));
	if (!content.image) thumb.hidden = true;
	if (side === "left") {
		card.append(thumb, text);
	} else {
		card.append(text, thumb);
	}
	return card;
}

function buildChatCard(content, platform) {
	const card = el("div", `mock chat-card chat-theme-${platform.theme}`);
	const accent = el("div", "chat-accent");
	accent.style.background = platform.color;
	card.appendChild(accent);
	const body = el("div", "chat-body");
	body.appendChild(el("div", "mock-site", content.site));
	const title = el("div", "mock-title chat-title", content.titleText);
	title.style.color = platform.theme === "dark" ? "#00aff4" : platform.color;
	body.appendChild(title);
	if (content.descText) body.appendChild(el("div", "mock-desc", content.descText));
	if (content.image) {
		const img = buildImage(content.image, "chat-image");
		body.appendChild(img);
	}
	card.appendChild(body);
	return card;
}

function buildCard(platform, data, hostname) {
	const raw = resolveContent(data, platform, hostname);
	const titleResult = truncate(raw.title || I18N.t("noTitleFound"), platform.titleLimit);
	const descResult = platform.descLimit ? truncate(raw.description, platform.descLimit) : { display: "", truncated: false };

	const content = {
		site: raw.site,
		image: raw.image,
		titleText: titleResult.display,
		descText: platform.descLimit ? descResult.display : "",
	};

	const wrapper = el("div", "card-group platform-card");
	const header = el("div", "platform-header");
	const dot = el("span", "platform-dot");
	dot.style.background = platform.color;
	header.append(dot, el("span", "platform-label", platform.label));
	wrapper.appendChild(header);

	let mock;
	switch (platform.style) {
		case "large":
			mock = buildLargeCard(content);
			break;
		case "rounded":
			mock = buildRoundedCard(content);
			break;
		case "compact-left":
			mock = buildCompactCard(content, "left");
			break;
		case "compact-right":
			mock = buildCompactCard(content, "right");
			break;
		case "chat":
			mock = buildChatCard(content, platform);
			break;
		default:
			mock = el("div");
	}
	wrapper.appendChild(mock);

	const warnings = [];
	if (raw.title && titleResult.truncated) {
		warnings.push(I18N.t("titleWarning")(platform.label, raw.title.length, platform.titleLimit, titleResult.over));
	}
	if (platform.descLimit && raw.description && descResult.truncated) {
		warnings.push(I18N.t("descWarning")(platform.label, raw.description.length, platform.descLimit, descResult.over));
	}
	if (warnings.length) {
		const list = el("ul", "warnings");
		for (const w of warnings) list.appendChild(el("li", null, w));
		wrapper.appendChild(list);
	}

	return wrapper;
}

function renderResult(data) {
	lastData = data;
	const hostname = (() => {
		try {
			return new URL(data.finalUrl).hostname;
		} catch {
			return data.siteName || "";
		}
	})();

	cardsEl.innerHTML = "";
	for (const platform of PLATFORMS) {
		cardsEl.appendChild(buildCard(platform, data, hostname));
	}

	rawTableBody.innerHTML = "";
	const rawEntries = Object.entries(data.raw || {}).sort(([a], [b]) => a.localeCompare(b));
	if (rawEntries.length === 0) {
		const row = document.createElement("tr");
		const cell = document.createElement("td");
		cell.colSpan = 2;
		cell.className = "empty-hint";
		cell.textContent = I18N.t("emptyRawHint");
		row.appendChild(cell);
		rawTableBody.appendChild(row);
	} else {
		for (const [key, value] of rawEntries) {
			const row = document.createElement("tr");
			const keyCell = document.createElement("td");
			keyCell.textContent = key;
			const valueCell = document.createElement("td");
			valueCell.textContent = value;
			row.append(keyCell, valueCell);
			rawTableBody.appendChild(row);
		}
	}

	resultsEl.hidden = false;
}

async function checkUrl(rawUrl) {
	const target = normalizeInputUrl(rawUrl);
	if (!target) return;

	errorEl.hidden = true;
	resultsEl.hidden = true;
	loadingEl.hidden = false;
	button.disabled = true;

	try {
		const res = await fetch(`/api/preview?url=${encodeURIComponent(target)}`);
		const data = await res.json();
		if (!res.ok) {
			throw new Error(data.error ? I18N.translateError(data.error) : `Request failed (${res.status})`);
		}
		renderResult(data);
	} catch (err) {
		errorEl.textContent = err instanceof Error ? err.message : I18N.t("errors").generic;
		errorEl.hidden = false;
	} finally {
		loadingEl.hidden = true;
		button.disabled = false;
	}
}

form.addEventListener("submit", (event) => {
	event.preventDefault();
	checkUrl(input.value);
});

function applyStaticText() {
	document.documentElement.lang = I18N.lang;
	appTitleEl.textContent = I18N.t("title");
	document.title = I18N.t("title");
	appDescriptionEl.textContent = I18N.t("description");
	input.placeholder = I18N.t("inputPlaceholder");
	button.textContent = I18N.t("checkButton");
	loadingEl.textContent = I18N.t("loading");
	rawTagsHeadingEl.textContent = I18N.t("rawTagsHeading");
	for (const btn of langSwitchEl.querySelectorAll("button")) {
		btn.classList.toggle("active", btn.dataset.lang === I18N.lang);
	}
	tabUrlBtn.textContent = I18N.t("tabUrl");
	tabManualBtn.textContent = I18N.t("tabManual");
	document.getElementById("manual-title-label").textContent = I18N.t("manualTitleLabel");
	document.getElementById("manual-desc-label").textContent = I18N.t("manualDescLabel");
	document.getElementById("manual-site-label").textContent = I18N.t("manualSiteLabel");
	document.getElementById("manual-image-url-label").textContent = I18N.t("manualImageUrlLabel");
	document.getElementById("manual-image-file-label").textContent = I18N.t("manualImageFileLabel");
	manualButton.textContent = I18N.t("manualButton");
	fileChooseButton.textContent = I18N.t("chooseFileButton");
	fileNameDisplay.textContent = manualImageFile.files[0] ? manualImageFile.files[0].name : I18N.t("noFileChosen");
	if (lastData) renderResult(lastData);
}

manualImageFile.addEventListener("change", () => {
	fileNameDisplay.textContent = manualImageFile.files[0] ? manualImageFile.files[0].name : I18N.t("noFileChosen");
});

function setActiveTab(tab) {
	const isUrl = tab === "url";
	tabUrlBtn.classList.toggle("active", isUrl);
	tabManualBtn.classList.toggle("active", !isUrl);
	tabUrlBtn.setAttribute("aria-selected", String(isUrl));
	tabManualBtn.setAttribute("aria-selected", String(!isUrl));
	panelUrl.hidden = !isUrl;
	panelManual.hidden = isUrl;
}

tabUrlBtn.addEventListener("click", () => setActiveTab("url"));
tabManualBtn.addEventListener("click", () => setActiveTab("manual"));

function readImageFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

manualForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const title = manualTitle.value.trim();
	const description = manualDesc.value.trim();
	const siteInput = manualSite.value.trim();
	const file = manualImageFile.files[0];

	let image = manualImageUrl.value.trim();
	if (file) {
		try {
			image = await readImageFile(file);
		} catch {
			/* fall back to the URL field if the file can't be read */
		}
	}

	const site = siteInput || "example.com";
	const raw = {};
	if (title) raw["og:title"] = title;
	if (description) raw["og:description"] = description;
	if (image) raw["og:image"] = image;
	if (siteInput) raw["og:site_name"] = siteInput;

	renderResult({
		requestedUrl: "",
		finalUrl: /^https?:\/\//i.test(site) ? site : `https://${site}`,
		title,
		description,
		image,
		siteName: siteInput,
		favicon: "",
		twitterCard: "",
		twitterTitle: "",
		twitterDescription: "",
		twitterImage: "",
		raw,
	});
});

function setLang(lang) {
	I18N.setLang(lang);
	applyStaticText();
}

langSwitchEl.addEventListener("click", (event) => {
	const btn = event.target.closest("button[data-lang]");
	if (btn) setLang(btn.dataset.lang);
});

function getInitialTheme() {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		if (stored === "light" || stored === "dark") return stored;
	} catch (e) {
		/* localStorage unavailable */
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch (e) {
		/* localStorage unavailable */
	}
	themeToggleEl.textContent = theme === "dark" ? "☀️" : "🌙";
	themeToggleEl.setAttribute("aria-label", theme === "dark" ? I18N.t("themeToggleToLight") : I18N.t("themeToggleToDark"));
}

themeToggleEl.addEventListener("click", () => {
	const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
	applyTheme(next);
});

applyTheme(getInitialTheme());
applyStaticText();
