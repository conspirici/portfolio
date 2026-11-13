import { auth } from "./firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** A non-2xx response from the API. `status` lets callers tell "not found" from "backend is down". */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  if (endpoint.startsWith("/admin") && auth) {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Ensure content type is application/json unless otherwise specified or using FormData
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "API request failed";
    try {
      const errorData = await response.json();
      if (typeof errorData.detail === "string") errorMessage = errorData.detail;
    } catch {
      // Ignore JSON parse error if response is not JSON
    }
    throw new ApiError(errorMessage, response.status);
  }

  // DELETE endpoints answer 204 with an empty body; parsing it as JSON would throw
  // and make a successful delete look like a failure.
  if (response.status === 204) return null;

  return response.json();
}
