import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { auth, firestore, storage } from "@/firebase/config";
import { NewPhotoPayload, ProjectPhoto } from "@/types/photo";

const projectPhotosCollection = (projectId: string) =>
  collection(firestore, "projects", projectId, "photos");

export const listenToProjectPhotos = (
  projectId: string,
  onPhotos: (photos: ProjectPhoto[]) => void,
  onError?: (error: Error) => void
) => {
  const photosQuery = query(
    projectPhotosCollection(projectId),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(
    photosQuery,
    (snapshot) => {
      const photos = snapshot.docs.map((doc) => ({
        id: doc.id,
        projectId,
        ...(doc.data() as any),
      })) as ProjectPhoto[];
      onPhotos(photos);
    },
    (error) => onError?.(error)
  );
};

export const uploadProjectPhoto = async (
  payload: NewPhotoPayload
): Promise<ProjectPhoto> => {
  const { projectId, uri } = payload;
  const userId = auth.currentUser?.uid ?? null;
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storagePath = `projects/${projectId}/photos/${fileName}`;
  const storageRef = ref(storage, storagePath);

  const response = await fetch(uri);
  const blob = await response.blob();

  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);

  const createdAt = Date.now();

  const photoDoc = await addDoc(projectPhotosCollection(projectId), {
    url,
    path: storagePath,
    createdAt,
    createdBy: userId,
  });

  // update project counters & updatedAt
  const projectDocRef = doc(firestore, "projects", projectId);

  await updateDoc(projectDocRef, {
    photoCount: increment(1),
    updatedAt: Date.now(),
  });

  return {
    id: photoDoc.id,
    projectId,
    url,
    path: storagePath,
    createdAt,
    createdBy: userId,
  };
};
