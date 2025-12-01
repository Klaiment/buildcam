export type Task = {
  id: string;
  projectId: string;
  roomId: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "done";
  createdAt: number;
  updatedAt: number;
  hasPendingWrites?: boolean;
  fromCache?: boolean;
};

export type NewTaskPayload = {
  projectId: string;
  roomId: string;
  title: string;
  description?: string | null;
  status?: Task["status"];
  createdAt?: number;
};
