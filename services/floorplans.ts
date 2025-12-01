import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { firestore, storage } from "@/firebase/config";
import { FloorPlan, NewFloorPlanPayload } from "@/types/floorplan";

const floorPlanCollection = (projectId: string, roomId?: string | null) =>
  roomId
    ? collection(firestore, "projects", projectId, "rooms", roomId, "floorplans")
    : collection(firestore, "projects", projectId, "floorplans");

export const listenToFloorPlans = (
  projectId: string,
  roomId: string | null,
  onPlans: (plans: FloorPlan[]) => void,
  onError?: (e: Error) => void
) => {
  const q = query(floorPlanCollection(projectId, roomId || undefined), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap) => {
      const plans = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          projectId,
          roomId,
          ...data,
          hasPendingWrites: d.metadata.hasPendingWrites,
          fromCache: d.metadata.fromCache,
        } as FloorPlan;
      });
      onPlans(plans);
    },
    (err) => onError?.(err)
  );
};

export const uploadFloorPlan = async (payload: NewFloorPlanPayload) => {
  const createdAt = payload.createdAt ?? Date.now();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
  const storagePath = payload.roomId
    ? `projects/${payload.projectId}/rooms/${payload.roomId}/plans/${fileName}`
    : `projects/${payload.projectId}/plans/${fileName}`;
  const storageRef = ref(storage, storagePath);

  const response = await fetch(payload.uri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);

  const docRef = await addDoc(floorPlanCollection(payload.projectId, payload.roomId), {
    name: payload.name,
    note: payload.note ?? null,
    createdAt,
    path: storagePath,
    url,
  });

  await updateDoc(doc(firestore, "projects", payload.projectId), {
    updatedAt: Date.now(),
  });

  return {
    id: docRef.id,
    projectId: payload.projectId,
    roomId: payload.roomId ?? null,
    name: payload.name,
    note: payload.note ?? null,
    createdAt,
    path: storagePath,
    url,
  };
};
