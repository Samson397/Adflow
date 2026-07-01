export type CreativeCategory = "video" | "image" | "music";

export type TaskStatus = "not_started" | "running" | "finished" | "failed";

export interface PoyoFile {
  file_url?: string;
  file_type?: string;
  audio_url?: string;
  image_url?: string;
  title?: string;
  duration?: number;
}

export interface PoyoTaskData {
  task_id: string;
  status: TaskStatus;
  progress?: number;
  files?: PoyoFile[];
  error_message?: string | null;
  created_time?: string;
}

export interface CreativeModel {
  id: string;
  label: string;
  category: CreativeCategory;
  apiModel: string;
  description: string;
  /** Music-only: Suno model version */
  musicVersion?: "V5" | "V5_5";
}

export interface SubmitGenerationRequest {
  modelId: string;
  prompt: string;
  useProductImage?: boolean;
  imageUrl?: string;
}

export interface GenerationJob {
  taskId: string;
  modelId: string;
  modelLabel: string;
  category: CreativeCategory;
  prompt: string;
  status: TaskStatus;
  files: PoyoFile[];
  errorMessage?: string | null;
  createdAt: string;
}
