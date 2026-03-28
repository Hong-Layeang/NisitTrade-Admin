const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4001";

type ApiRequestInit = RequestInit & {
	skipAuth?: boolean;
};

function buildHeaders(initHeaders: HeadersInit | undefined, skipAuth: boolean): Headers {
	const headers = new Headers(initHeaders);

	if (!headers.has("Content-Type")) {
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

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...rest,
		headers: buildHeaders(initHeaders, skipAuth),
	});

	if (!response.ok) {
		const fallbackError = `Request failed with status ${response.status}`;

		try {
			const payload = await response.json();
			throw new Error(payload?.message || payload?.msg || fallbackError);
		} catch {
			throw new Error(fallbackError);
		}
	}

	return (await response.json()) as T;
}
