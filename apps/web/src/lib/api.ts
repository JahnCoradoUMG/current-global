import { getTokenFromDocument } from "./auth";
import { apiFetch } from "./api-shared";

export { ApiError, apiFetch, getApiUrl } from "./api-shared";

export function clientApiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token: explicitToken, ...rest } = options;
  const token =
    explicitToken !== undefined ? explicitToken : getTokenFromDocument();
  return apiFetch<T>(path, { ...rest, token });
}
