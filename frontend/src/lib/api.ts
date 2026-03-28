const API_BASE_URL = process.env.REACT_APP_API_URL;

type ApiRequestInit = RequestInit & {
	skipAuth?: boolean;
};

function buildHeaders(initHeaders: HeadersInit | undefined, skipAuth: boolean): Headers {
	const headers = new Headers(initHeaders);

	if (!headers.has("Content-Type") && !headers.has("content-type")) {
		headers.set("Content-Type", "application/json");
	}

	if (!skipAuth) {
		const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		}
	}

	return headers;
}

export async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
	const { skipAuth = false, headers: initHeaders, ...rest } = init;
	const requestUrl = `${API_BASE_URL}${path}`;
	const method = (rest.method || "GET").toUpperCase();
	const headers = buildHeaders(initHeaders, skipAuth);

	if ((method === "GET" || method === "HEAD") && !rest.body) {
		headers.delete("Content-Type");
	}

	const response = await fetch(requestUrl, {
		...rest,
		headers,
	});

	if (!response.ok) {
		const fallbackError = `Request failed with status ${response.status}`;
		const contentType = response.headers.get("content-type") || "";
		let message = fallbackError;

		if (response.status === 401 && !skipAuth) {
			localStorage.removeItem("token");
			localStorage.removeItem("admin_token");
			localStorage.removeItem("role");
			localStorage.removeItem("email");
		}

		try {
			if (contentType.includes("application/json")) {
				const payload = await response.json();
				message = payload?.message || payload?.msg || fallbackError;
			} else {
				const rawText = await response.text();
				if (rawText?.trim()) {
					message = rawText.trim();
				}
			}
		} catch {
			message = fallbackError;
		}

		if (response.status === 401 && !skipAuth && typeof window !== "undefined" && window.location.pathname !== "/login") {
			window.location.assign("/login");
		}

		throw new Error(message);
	}

	if (response.status === 204 || response.status === 205) {
		return undefined as T;
	}

	const contentType = response.headers.get("content-type") || "";
	if (!contentType.includes("application/json")) {
		const rawText = await response.text();
		if (!rawText.trim()) {
			return undefined as T;
		}
		throw new Error(`Expected JSON response but received a different content type for ${requestUrl}. Check REACT_APP_API_URL and backend server port.`);
	}

	try {
		return (await response.json()) as T;
	} catch {
		throw new Error(`Expected JSON response but received a different content type for ${requestUrl}. Check REACT_APP_API_URL and backend server port.`);
	}
}
