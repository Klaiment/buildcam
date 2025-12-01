import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { auth, firestore, storage } from "@/firebase/config";
import { NewPhotoPayload, ProjectPhoto } from "@/types/photo";
import { enqueueUpload, startUploadQueueProcessor } from "./uploadQueue";

const projectPhotosCollection = (projectId: string) =>
  collection(firestore, "projects", projectId, "photos");

export const listenToProjectPhotos = (
  projectId: string,
  onPhotos: (photos: ProjectPhoto[]) => void,
  onError?: (error: Error) => void
) => {
  const photosQuery = query(
    projectPhotosCollection(projectId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    photosQuery,
    { includeMetadataChanges: true },
    (snapshot) => {
      const photos = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          projectId,
          ...data,
          uploadStatus: data?.uploadStatus ?? (data?.url ? "synced" : "pending"),
          uploadAttempts: data?.uploadAttempts ?? 0,
          uploadError: data?.uploadError ?? null,
          hasPendingWrites: docSnap.metadata.hasPendingWrites,
          fromCache: docSnap.metadata.fromCache,
        };
      }) as ProjectPhoto[];
      onPhotos(photos);
    },
    (error) => onError?.(error)
  );
};

export const listenToPhoto = (
  projectId: string,
  photoId: string,
  onPhoto: (photo: ProjectPhoto | null) => void,
  onError?: (error: Error) => void
) => {
  const photoRef = doc(firestore, "projects", projectId, "photos", photoId);
  return onSnapshot(
    photoRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (!snapshot.exists()) {
        onPhoto(null);
        return;
      }
      const data = snapshot.data() as any;
      onPhoto({
        id: snapshot.id,
        projectId,
        ...data,
        uploadStatus: data?.uploadStatus ?? (data?.url ? "synced" : "pending"),
        uploadAttempts: data?.uploadAttempts ?? 0,
        uploadError: data?.uploadError ?? null,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
        fromCache: snapshot.metadata.fromCache,
      } as ProjectPhoto);
    },
    (error) => onError?.(error)
  );
};

export const uploadProjectPhoto = async (
  payload: NewPhotoPayload
): Promise<ProjectPhoto> => {
  const { projectId, uri, note = null, location = null, createdAt: createdAtInput } =
    payload;
  const userId = auth.currentUser?.uid ?? null;
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storagePath = `projects/${projectId}/photos/${fileName}`;
  const storageRef = ref(storage, storagePath);

  const createdAt = createdAtInput ?? Date.now();

  const photoDoc = await addDoc(projectPhotosCollection(projectId), {
    url: "",
    path: storagePath,
    createdAt,
    createdBy: userId,
    note,
    location,
    uploadStatus: "pending",
    uploadAttempts: 0,
    uploadError: null,
  });

  const projectDocRef = doc(firestore, "projects", projectId);

  await updateDoc(projectDocRef, {
    photoCount: increment(1),
    updatedAt: Date.now(),
  });

  await enqueueUpload({
    id: photoDoc.id,
    projectId,
    uri,
    storagePath,
  });
  startUploadQueueProcessor();

  return {
    id: photoDoc.id,
    projectId,
    url: "",
    path: storagePath,
    createdAt,
    note,
    location,
    createdBy: userId,
    uploadStatus: "pending",
    uploadAttempts: 0,
  };
};
