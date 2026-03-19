// frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

type RequestOptions = Omit<RequestInit, "body"> & {
    json?: unknown;
    body?: BodyInit | null;
};

export async function apiFetch(path: string, options: RequestOptions = {}) {
    const { json, headers, body, ...rest } = options;

    const finalHeaders = new Headers(headers);

    let finalBody: BodyInit | null | undefined = body;

    if (json !== undefined) {
        finalHeaders.set("Content-Type", "application/json");
        finalBody = JSON.stringify(json);
    }

    return fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: finalHeaders,
        credentials: "include",
        body: finalBody,
        cache: "no-store",
    });
}

export async function apiFetchJson<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const response = await apiFetch(path, options);

    if (!response.ok) {
        let message = "API request failed";

        try {
            const errorData = await response.json();
            if (typeof errorData?.message === "string" && errorData.message.trim()) {
                message = errorData.message;
            }
        } catch {
            try {
                const text = await response.text();
                if (text.trim()) {
                    message = text;
                }
            } catch {
                // ignorado
            }
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null as T;
    }

    return response.json() as Promise<T>;
}