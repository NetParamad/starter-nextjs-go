import type { paths } from "@/generated/openapi";
import { buildApiUrl, generateRequestId } from "@/lib/api";
import type {
  AuthResponse,
  AuthSession,
  AuthUser,
  LoginInput,
  LogoutInput,
  RefreshInput,
  RefreshResponse,
  RegisterResponse,
  RegisterInput,
} from "@/types/auth";

type MeResponse =
  paths["/api/v1/auth/me"]["get"]["responses"][200]["content"]["application/json"];

function toSession(response: AuthResponse): AuthSession {
  return {
    accessToken: response.access_token,
    expiresAt: response.expires_at,
    refreshToken: response.refresh_token,
    user: response.user,
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T | { error?: string };
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? payload.error
        : undefined;
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return payload as T;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await fetch(buildApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": generateRequestId(),
    },
    body: JSON.stringify(input),
  });

  return toSession(await parseJson<AuthResponse>(response));
}

export async function register(
  input: RegisterInput,
): Promise<RegisterResponse> {
  const response = await fetch(buildApiUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": generateRequestId(),
    },
    body: JSON.stringify(input),
  });

  return parseJson<RegisterResponse>(response);
}

export async function refreshSession(
  input: RefreshInput,
): Promise<AuthSession> {
  const response = await fetch(buildApiUrl("/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": generateRequestId(),
    },
    body: JSON.stringify(input),
  });

  return toSession(await parseJson<RefreshResponse>(response));
}

export async function logout(input: LogoutInput): Promise<void> {
  const response = await fetch(buildApiUrl("/auth/logout"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": generateRequestId(),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok && response.status !== 404) {
    await parseJson<unknown>(response).catch(() => null);
    throw new Error(`Request failed with status ${response.status}`);
  }
}

export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  const response = await fetch(buildApiUrl("/auth/me"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Request-ID": generateRequestId(),
    },
    cache: "no-store",
  });

  const payload = await parseJson<MeResponse>(response);
  return payload.data;
}
