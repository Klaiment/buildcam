export type ProjectPhoto = {
  id: string;
  projectId: string;
  url: string;
  createdAt: number;
  createdBy?: string | null;
  path: string;
};

export type NewPhotoPayload = {
  projectId: string;
  uri: string;
};
