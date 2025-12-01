export type FloorPlan = {
  id: string;
  projectId: string;
  roomId?: string | null;
  name: string;
  url: string;
  path: string;
  createdAt: number;
  note?: string | null;
  hasPendingWrites?: boolean;
  fromCache?: boolean;
};

export type NewFloorPlanPayload = {
  projectId: string;
  roomId?: string | null;
  name: string;
  uri: string;
  note?: string | null;
  createdAt?: number;
};
