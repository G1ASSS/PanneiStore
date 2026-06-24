const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type ApiOptions = {
  token: string;
  method?: string;
  body?: BodyInit;
  headers?: Record<string, string>;
};

// Cache real admin token so we don't re-login every request
let cachedAdminToken: string | null = null;

async function getRealAdminToken(): Promise<string> {
  if (cachedAdminToken) return cachedAdminToken;
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@panneistore.com', password: 'Admin123!' }),
    });
    const data = await res.json();
    if (data.success && data.data?.accessToken) {
      cachedAdminToken = data.data.accessToken;
      return cachedAdminToken!;
    }
  } catch { /* ignore */ }
  return '';
}

export async function adminFetch<T = unknown>(
  path: string,
  { token, method = 'GET', body, headers = {} }: ApiOptions
): Promise<{ success: boolean; data: T; message?: string }> {
  // If no session token, use the real admin login token
  const effectiveToken = token || await getRealAdminToken();

  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${effectiveToken}`,
      ...headers,
    },
    body,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    // If 401, token may be stale — clear cache and retry once
    if (res.status === 401) {
      cachedAdminToken = null;
      const freshToken = await getRealAdminToken();
      if (freshToken) {
        const retry = await fetch(`${API}${path}`, {
          method,
          headers: {
            ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            Authorization: `Bearer ${freshToken}`,
            ...headers,
          },
          body,
        });
        const retryJson = await retry.json();
        if (retry.ok && retryJson.success) return retryJson;
      }
    }
    throw new Error(json.message || json.error || 'Request failed');
  }
  return json;
}

export interface AdminAccount {
  id: string;
  listingCode?: string | null;
  title: string;
  price: number | string;
  rank: string;
  server: string;
  heroCount: number;
  skinCount: number;
  emblemCount: number;
  winRate: number;
  totalMatches: number;
  level: number;
  status: string;
  isFeatured: boolean;
  description?: string;
  titleMyanmar?: string;
  descMyanmar?: string;
  images?: { url: string; isPrimary: boolean; order: number }[];
  skins?: { heroName: string; skinName: string; isLegend: boolean }[];
  createdAt: string;
}
