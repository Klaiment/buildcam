export type ProjectLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
};

export type Project = {
  id: string;
  name: string;
  location?: ProjectLocation | null;
  createdAt: number;
  updatedAt: number;
  photoCount: number;
  userId?: string | null;
  hasPendingWrites?: boolean;
  fromCache?: boolean;
};

export type NewProjectPayload = {
  name: string;
  location?: ProjectLocation | null;
};
