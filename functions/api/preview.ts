import { extractMeta, HttpError, isBlockedHost } from "../../src/ogp";

export const onRequestGet: PagesFunction = async (context) => {
	const url = new URL(context.request.url);
	const target = url.searchParams.get("url");
	if (!target) {
		return Response.json({ error: "Missing 'url' query parameter" }, { status: 400 });
	}

	let parsedTarget: URL;
	try {
		parsedTarget = new URL(target);
	} catch {
		return Response.json({ error: "Invalid URL" }, { status: 400 });
	}
	if (parsedTarget.protocol !== "http:" && parsedTarget.protocol !== "https:") {
		return Response.json({ error: "Only http/https URLs are supported" }, { status: 400 });
	}
	if (isBlockedHost(parsedTarget.hostname)) {
		return Response.json({ error: "That host cannot be checked" }, { status: 400 });
	}

	try {
		const result = await extractMeta(parsedTarget.href);
		return Response.json(result);
	} catch (err) {
		if (err instanceof HttpError) {
			return Response.json({ error: err.message }, { status: err.status });
		}
		if (err instanceof Error && err.name === "TimeoutError") {
			return Response.json({ error: "Timed out fetching the target page" }, { status: 504 });
		}
		return Response.json({ error: "Failed to fetch the target page" }, { status: 502 });
	}
};
