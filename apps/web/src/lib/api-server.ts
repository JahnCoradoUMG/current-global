import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "./auth";
import { ApiError, apiFetch } from "./api-shared";

export async function serverApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value ?? null;
  if (!token) {
    throw new ApiError(401, "Not authenticated");
  }
  return apiFetch<T>(path, { ...options, token });
}
