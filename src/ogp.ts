const USER_AGENT = "Mozilla/5.0 (compatible; OGPChecker/1.0; +https://github.com/)";
const FETCH_TIMEOUT_MS = 10_000;
const MAX_BYTES = 2 * 1024 * 1024; // stop reading well before the whole body if <head> never closes

export interface PreviewResult {
	requestedUrl: string;
	finalUrl: string;
	title: string;
	description: string;
	image: string;
	siteName: string;
	favicon: string;
	twitterCard: string;
	twitterTitle: string;
	twitterDescription: string;
	twitterImage: string;
	raw: Record<string, string>;
}

export class HttpError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
	}
}

export function isBlockedHost(hostname: string): boolean {
	const h = hostname.toLowerCase();
	if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
	const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (ipv4) {
		const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
		if (a === 127 || a === 10 || a === 0) return true;
		if (a === 169 && b === 254) return true;
		if (a === 172 && b >= 16 && b <= 31) return true;
		if (a === 192 && b === 168) return true;
	}
	if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
	return false;
}

function resolveUrl(maybeRelative: string, base: string): string {
	try {
		return new URL(maybeRelative, base).href;
	} catch {
		return "";
	}
}

export async function extractMeta(targetUrl: string): Promise<PreviewResult> {
	const upstream = await fetch(targetUrl, {
		headers: {
			"user-agent": USER_AGENT,
			accept: "text/html,application/xhtml+xml",
		},
		redirect: "follow",
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	});

	if (!upstream.ok) {
		throw new HttpError(502, `Target page responded with ${upstream.status}`);
	}
	const contentType = upstream.headers.get("content-type") || "";
	if (!contentType.includes("html")) {
		throw new HttpError(422, `Target page is not HTML (content-type: ${contentType || "unknown"})`);
	}
	if (!upstream.body) {
		throw new HttpError(502, "Target page returned no body");
	}

	const meta: Record<string, string> = {};
	let title = "";
	let headEnded = false;

	const rewriter = new HTMLRewriter()
		.on("title", {
			text(chunk) {
				title += chunk.text;
			},
		})
		.on("meta", {
			element(el) {
				const key = (el.getAttribute("property") || el.getAttribute("name") || "").toLowerCase();
				const content = el.getAttribute("content");
				if (key && content != null) meta[key] = content;
			},
		})
		.on("link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']", {
			element(el) {
				const href = el.getAttribute("href");
				if (href && !meta.__favicon) meta.__favicon = href;
			},
		})
		.on("head", {
			element(el) {
				el.onEndTag(() => {
					headEnded = true;
				});
			},
		});

	const transformed = rewriter.transform(upstream);
	const reader = transformed.body!.getReader();
	let bytesRead = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (value) bytesRead += value.byteLength;
		if (done || headEnded || bytesRead > MAX_BYTES) break;
	}
	await reader.cancel().catch(() => {});

	const finalUrl = upstream.url || targetUrl;
	const rawImage = meta["og:image:secure_url"] || meta["og:image"] || meta["twitter:image"] || meta["twitter:image:src"] || "";

	return {
		requestedUrl: targetUrl,
		finalUrl,
		title: (meta["og:title"] || title || meta["twitter:title"] || "").trim(),
		description: (meta["og:description"] || meta["description"] || meta["twitter:description"] || "").trim(),
		image: rawImage ? resolveUrl(rawImage, finalUrl) : "",
		siteName: meta["og:site_name"] || new URL(finalUrl).hostname,
		favicon: meta.__favicon ? resolveUrl(meta.__favicon, finalUrl) : resolveUrl("/favicon.ico", finalUrl),
		twitterCard: meta["twitter:card"] || "",
		twitterTitle: (meta["twitter:title"] || meta["og:title"] || title || "").trim(),
		twitterDescription: (meta["twitter:description"] || meta["og:description"] || meta["description"] || "").trim(),
		twitterImage: meta["twitter:image"] || meta["twitter:image:src"] || rawImage ? resolveUrl(meta["twitter:image"] || meta["twitter:image:src"] || rawImage, finalUrl) : "",
		raw: Object.fromEntries(Object.entries(meta).filter(([k]) => !k.startsWith("__"))),
	};
}
