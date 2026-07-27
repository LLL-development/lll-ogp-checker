const STRINGS = {
	en: {
		title: "OGP Checker",
		description:
			"Preview how a page link will look when shared on Facebook, LinkedIn, LINE, X, WhatsApp, WeChat, Slack, and Discord.",
		inputPlaceholder: "https://example.com/page",
		checkButton: "Check",
		loading: "Fetching page…",
		rawTagsHeading: "Raw tags",
		noTitleFound: "(no title found)",
		emptyRawHint: "No og:/twitter: meta tags found on this page.",
		themeToggleToDark: "Switch to dark theme",
		themeToggleToLight: "Switch to light theme",
		titleWarning: (platform, len, limit, over) =>
			`Title is ${len} characters — ${platform} will likely cut it off after ~${limit}. Consider shortening by ${over}.`,
		descWarning: (platform, len, limit, over) =>
			`Description is ${len} characters — ${platform} will likely cut it off after ~${limit}. Consider shortening by ${over}.`,
		errors: {
			missingUrl: "Missing 'url' query parameter",
			invalidUrl: "Invalid URL",
			protocolNotSupported: "Only http/https URLs are supported",
			blockedHost: "That host cannot be checked",
			timeout: "Timed out fetching the target page",
			fetchFailed: "Failed to fetch the target page",
			generic: "Something went wrong",
		},
	},
	ja: {
		title: "OGP チェッカー",
		description:
			"Facebook、LinkedIn、LINE、X、WhatsApp、WeChat、Slack、Discord でシェアしたときにページのリンクがどう表示されるかをプレビューします。",
		inputPlaceholder: "https://example.com/page",
		checkButton: "チェック",
		loading: "ページを取得中…",
		rawTagsHeading: "タグ一覧",
		noTitleFound: "（タイトルが見つかりません）",
		emptyRawHint: "og: / twitter: のメタタグが見つかりませんでした。",
		themeToggleToDark: "ダークテーマに切り替え",
		themeToggleToLight: "ライトテーマに切り替え",
		titleWarning: (platform, len, limit, over) =>
			`タイトルが${len}文字あります。${platform}では約${limit}文字で切り捨てられる可能性があります。${over}文字ほど短くすることをおすすめします。`,
		descWarning: (platform, len, limit, over) =>
			`説明文が${len}文字あります。${platform}では約${limit}文字で切り捨てられる可能性があります。${over}文字ほど短くすることをおすすめします。`,
		errors: {
			missingUrl: "'url' パラメータが指定されていません",
			invalidUrl: "URL が正しくありません",
			protocolNotSupported: "http または https の URL のみ利用できます",
			blockedHost: "このホストはチェックできません",
			timeout: "ページの取得がタイムアウトしました",
			fetchFailed: "ページの取得に失敗しました",
			generic: "エラーが発生しました",
		},
	},
	zh: {
		title: "OGP 检查器",
		description: "预览页面链接分享到 Facebook、LinkedIn、LINE、X、WhatsApp、微信、Slack 和 Discord 时的显示效果。",
		inputPlaceholder: "https://example.com/page",
		checkButton: "检查",
		loading: "正在获取页面…",
		rawTagsHeading: "原始标签",
		noTitleFound: "（未找到标题）",
		emptyRawHint: "未在此页面上找到 og: / twitter: 元标签。",
		themeToggleToDark: "切换到深色主题",
		themeToggleToLight: "切换到浅色主题",
		titleWarning: (platform, len, limit, over) =>
			`标题共 ${len} 个字符 — ${platform} 大约在 ${limit} 个字符后可能会被截断。建议缩短约 ${over} 个字符。`,
		descWarning: (platform, len, limit, over) =>
			`描述共 ${len} 个字符 — ${platform} 大约在 ${limit} 个字符后可能会被截断。建议缩短约 ${over} 个字符。`,
		errors: {
			missingUrl: "缺少 'url' 参数",
			invalidUrl: "URL 无效",
			protocolNotSupported: "仅支持 http/https 链接",
			blockedHost: "无法检查该主机",
			timeout: "获取目标页面超时",
			fetchFailed: "获取目标页面失败",
			generic: "出现错误",
		},
	},
};

const ERROR_KEY_MAP = {
	"Missing 'url' query parameter": "missingUrl",
	"Invalid URL": "invalidUrl",
	"Only http/https URLs are supported": "protocolNotSupported",
	"That host cannot be checked": "blockedHost",
	"Timed out fetching the target page": "timeout",
	"Failed to fetch the target page": "fetchFailed",
};

const SUPPORTED_LANGS = Object.keys(STRINGS);
const LANG_STORAGE_KEY = "ogp-lang";

function detectInitialLang() {
	try {
		const stored = localStorage.getItem(LANG_STORAGE_KEY);
		if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
	} catch (e) {
		/* localStorage unavailable */
	}
	const nav = (navigator.language || "en").toLowerCase();
	if (nav.startsWith("ja")) return "ja";
	if (nav.startsWith("zh")) return "zh";
	return "en";
}

const I18N = {
	lang: detectInitialLang(),
	setLang(lang) {
		if (!SUPPORTED_LANGS.includes(lang)) return;
		this.lang = lang;
		try {
			localStorage.setItem(LANG_STORAGE_KEY, lang);
		} catch (e) {
			/* localStorage unavailable */
		}
	},
	t(key) {
		return STRINGS[this.lang][key];
	},
	translateError(message) {
		const key = ERROR_KEY_MAP[message];
		return key ? STRINGS[this.lang].errors[key] : message;
	},
};
