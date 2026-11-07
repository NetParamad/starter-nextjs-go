const DEFAULT_API_BASE_URL = "http://localhost:8080/api/v1";
const DEFAULT_REQUEST_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  status: number;
  requestId?: string;

  constructor(message: string, status: number, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId;
  }
}

export function generateRequestId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return Math.random().toString(36).substring(2, 18);
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    dispose: () => clearTimeout(timeoutId),
  };
}

async function parseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return payload?.error || `API request failed with status ${response.status}`;
}

export async function fetchJson<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const timeout = createTimeoutSignal(
    init?.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
  );

  const requestId = generateRequestId();

  try {
    const response = await fetch(buildApiUrl(path), {
      ...init,
      signal: init?.signal ?? timeout.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
        ...init?.headers,
      },
      next: init?.next ?? { revalidate: 30 },
    });

    if (!response.ok) {
      const responseRequestId =
        response.headers.get("X-Request-ID") || requestId;
      throw new ApiError(
        await parseError(response),
        response.status,
        responseRequestId,
      );
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("API request timed out");
    }
    throw error;
  } finally {
    timeout.dispose();
  }
}
