import type { CreativeCategory, GenerationTask, OutputFile, TaskStatus } from "./types";

const BASE_URL = process.env.AIVIDEOAPI_BASE_URL ?? "https://api.aivideoapi.ai";

const ENDPOINTS: Record<CreativeCategory, string> = {
  video: "/v1/videos/generations",
  image: "/v1/images/generations",
  music: "/v1/music/generations",
};

function getApiKey(): string {
  const key = process.env.AIVIDEOAPI_API_KEY;
  if (!key) {
    throw new Error(
      "AIVIDEOAPI_API_KEY is not configured. Get your key at https://aivideoapi.ai/dashboard/api-keys",
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

interface ApiEnvelope<T> {
  code?: number;
  msg?: string;
  data?: T;
  error?: { code?: string; message?: string; type?: string };
}

interface TaskResponse {
  id: string;
  status: TaskStatus;
  progress?: number | null;
  output?: {
    urls?: string[];
    metadata?: {
      tracks?: Array<{
        title?: string;
        duration?: number;
        image_url?: string;
      }>;
    };
  };
  error?: { message?: string };
}

function mapOutputFiles(task: TaskResponse, category: CreativeCategory): OutputFile[] {
  const urls = task.output?.urls ?? [];
  const tracks = task.output?.metadata?.tracks ?? [];

  if (category === "music" && tracks.length > 0) {
    return tracks.map((track, index) => ({
      url: urls[index] ?? urls[0] ?? "",
      file_type: "audio",
      title: track.title,
      duration: track.duration,
      image_url: track.image_url,
    })).filter((f) => f.url);
  }

  const fileType =
    category === "video" ? "video" : category === "image" ? "image" : "audio";

  return urls.map((url) => ({ url, file_type: fileType }));
}

function normalizeTask(task: TaskResponse, category: CreativeCategory): GenerationTask {
  return {
    taskId: task.id,
    status: task.status,
    progress: task.progress ?? null,
    files: mapOutputFiles(task, category),
    errorMessage: task.error?.message ?? null,
  };
}

export function isAiVideoApiConfigured(): boolean {
  return Boolean(process.env.AIVIDEOAPI_API_KEY);
}

export async function submitGenerationTask(
  endpoint: CreativeCategory,
  apiModel: string,
  input: Record<string, unknown>,
): Promise<string> {
  const response = await fetch(`${BASE_URL}${ENDPOINTS[endpoint]}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ model: apiModel, input }),
  });

  const result = (await response.json()) as ApiEnvelope<{ taskId: string }>;

  if (!response.ok || result.code !== 200 || !result.data?.taskId) {
    const message =
      result.error?.message ??
      (typeof result.error === "string" ? result.error : "Failed to submit generation task");
    throw new Error(message);
  }

  return result.data.taskId;
}

export async function getTaskStatus(
  taskId: string,
  category: CreativeCategory,
): Promise<GenerationTask> {
  const response = await fetch(`${BASE_URL}/v1/tasks/${encodeURIComponent(taskId)}`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  const result = (await response.json()) as TaskResponse & ApiEnvelope<never>;

  if (!response.ok) {
    const message =
      (result as ApiEnvelope<never>).error?.message ?? "Failed to fetch task status";
    throw new Error(message);
  }

  return normalizeTask(result as TaskResponse, category);
}
