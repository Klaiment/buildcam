export type Room = {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  createdAt: number;
  updatedAt: number;
  hasPendingWrites?: boolean;
  fromCache?: boolean;
};

export type NewRoomPayload = {
  projectId: string;
  name: string;
  description?: string | null;
  createdAt?: number;
};
