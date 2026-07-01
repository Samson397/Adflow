export type CreativeCategory = "video" | "image" | "music";

export type TaskStatus = "pending" | "processing" | "completed" | "failed";

export interface OutputFile {
  url: string;
  file_type?: string;
  title?: string;
  duration?: number;
  image_url?: string;
}

export interface CreativeModel {
  id: string;
  label: string;
  category: CreativeCategory;
  description: string;
}

export interface GenerationJob {
  taskId: string;
  modelId: string;
  modelLabel: string;
  category: CreativeCategory;
  prompt: string;
  status: TaskStatus;
  files: OutputFile[];
  errorMessage?: string | null;
  createdAt: string;
}

export interface GenerationTask {
  taskId: string;
  status: TaskStatus;
  progress?: number | null;
  files: OutputFile[];
  errorMessage?: string | null;
}
