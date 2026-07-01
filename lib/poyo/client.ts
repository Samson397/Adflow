import type { CreativeModel, PoyoTaskData } from "./types";

const BASE_URL = process.env.POYO_BASE_URL ?? "https://api.poyo.ai";

function getApiKey(): string {
  const key = process.env.POYO_API_KEY;
  if (!key) {
    throw new Error(
      "POYO_API_KEY is not configured. Add it to .env.local or Vercel environment variables.",
    );
  }
  return key;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

interface PoyoResponse<T> {
  code: number;
  data?: T;
  error?: { message?: string; type?: string };
}

export async function submitGenerationTask(
  model: CreativeModel,
  input: Record<string, unknown>,
): Promise<PoyoTaskData> {
  const response = await fetch(`${BASE_URL}/api/generate/submit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      model: model.apiModel,
      input,
    }),
  });

  const result = (await response.json()) as PoyoResponse<PoyoTaskData>;

  if (!response.ok || result.code !== 200 || !result.data?.task_id) {
    const message =
      result.error?.message ??
      (typeof result === "object" && "error" in result
        ? String((result as { error?: string }).error)
        : "Failed to submit generation task");
    throw new Error(message);
  }

  return result.data;
}

export async function getMediaTaskStatus(taskId: string): Promise<PoyoTaskData> {
  const response = await fetch(
    `${BASE_URL}/api/generate/status/${encodeURIComponent(taskId)}`,
    { headers: authHeaders(), cache: "no-store" },
  );

  const result = (await response.json()) as PoyoResponse<PoyoTaskData>;

  if (!response.ok || result.code !== 200 || !result.data) {
    throw new Error(result.error?.message ?? "Failed to fetch task status");
  }

  return result.data;
}

export async function getMusicTaskStatus(taskId: string): Promise<PoyoTaskData> {
  const url = new URL(`${BASE_URL}/api/generate/detail/music`);
  url.searchParams.set("task_id", taskId);

  const response = await fetch(url.toString(), {
    headers: authHeaders(),
    cache: "no-store",
  });

  const result = (await response.json()) as PoyoResponse<PoyoTaskData>;

  if (!response.ok || result.code !== 200 || !result.data) {
    throw new Error(result.error?.message ?? "Failed to fetch music task status");
  }

  return result.data;
}

export function isPoyoConfigured(): boolean {
  return Boolean(process.env.POYO_API_KEY);
}
