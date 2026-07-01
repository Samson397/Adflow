import type { CreativeCategory, OutputFile, TaskStatus } from "@/lib/aivideoapi/types";

export async function pollTaskUntilDone(
  taskId: string,
  category: CreativeCategory,
  modelId: string,
  onUpdate?: (status: TaskStatus, files: OutputFile[]) => void,
): Promise<{ status: TaskStatus; files: OutputFile[]; errorMessage?: string | null }> {
  const terminal = new Set<TaskStatus>(["completed", "failed"]);

  while (true) {
    const response = await fetch(
      `/api/generate/status/${taskId}?category=${category}&modelId=${modelId}`,
    );
    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        status: "failed",
        files: [],
        errorMessage: result.error ?? "Status check failed",
      };
    }

    const { status, files, errorMessage } = result.data;
    onUpdate?.(status, files ?? []);

    if (terminal.has(status)) {
      return { status, files: files ?? [], errorMessage };
    }

    await new Promise((r) => setTimeout(r, 3000));
  }
}

export async function submitGeneration(params: {
  modelId: string;
  prompt: string;
  imageUrl?: string;
  audioUrl?: string;
  instrumental?: boolean;
}): Promise<string> {
  const response = await fetch("/api/generate/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Failed to submit generation");
  }

  return result.data.taskId as string;
}
