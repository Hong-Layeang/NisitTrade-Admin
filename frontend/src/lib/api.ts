const rawApiBaseUrl = String(process.env.REACT_APP_API_URL || "").trim();

function normalizeApiBaseUrl(value: string) {
  if (!value) return "http://localhost:3000";

  if (/^https?:\/\//i.test(value)) {
    return value.replace(/\/+$/, "");
  }

  if (/^\d+$/.test(value)) {
    return `http://localhost:${value}`;
  }

  return `http://${value}`.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl);

const TOKEN_STORAGE_KEY = "admin_token";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

function parseJsonSafely<T>(value: string): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function firstString(values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token ?? localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const rawBody = await response.text();
  const isJson = contentType.includes("application/json");
  const payload = isJson ? parseJsonSafely<Record<string, unknown>>(rawBody) : null;

  if (!response.ok) {
    const fallbackMessage = rawBody?.trim()
      ? `${response.status} ${response.statusText}: ${rawBody.trim()}`
      : `Request failed (${response.status} ${response.statusText})`;
    const message = firstString([
      payload?.msg,
      payload?.message,
      payload?.error,
      fallbackMessage,
    ]) || fallbackMessage;
    throw new Error(message);
  }

  return payload as T;
}

export type AdminLoginResponse = {
  valid: boolean;
  token: string;
  user: {
    id: number;
    role: string;
    email: string;
    full_name?: string;
  };
};

export type ApiCategory = {
  id: number;
  name: string;
};

export type ApiProduct = {
  id: number;
  title: string;
  price: number | string;
  status: "available" | "reserved" | "sold" | "hidden";
  created_at?: string;
  createdAt?: string;
  Category?: {
    id: number;
    name: string;
  };
};

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getAdminToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function adminLogin(email: string, password: string) {
  const data = await request<AdminLoginResponse>("/api/auth/admin/login", {
    method: "POST",
    body: { email, password },
  });

  if (data?.token) {
    setAdminToken(data.token);
  }

  return data;
}

export async function adminLogout() {
  try {
    await request<{ success: boolean; msg: string }>("/api/auth/logout", {
      method: "POST",
    });
  } finally {
    clearAdminToken();
  }
}

export function fetchCategories() {
  return request<ApiCategory[]>("/api/categories");
}

export function fetchProducts(params?: { search?: string; status?: string; category_id?: number }) {
  const query = new URLSearchParams();

  if (params?.search) query.set("search", params.search);
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.category_id) query.set("category_id", String(params.category_id));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<ApiProduct[]>(`/api/products${suffix}`);
}

export function createProduct(payload: {
  title: string;
  description?: string;
  category_id: number;
  price: number;
}) {
  return request<ApiProduct>("/api/products", {
    method: "POST",
    body: payload,
  });
}
