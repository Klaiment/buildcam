export type ProjectPhoto = {
  id: string;
  projectId: string;
  url: string;
  createdAt: number;
  note?: string | null;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  createdBy?: string | null;
  path: string;
  hasPendingWrites?: boolean;
  fromCache?: boolean;
};

export type NewPhotoPayload = {
  projectId: string;
  uri: string;
  note?: string | null;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  createdAt?: number;
};
