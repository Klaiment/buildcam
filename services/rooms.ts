import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { firestore } from "@/firebase/config";
import { NewRoomPayload, Room } from "@/types/room";

const roomsCollection = (projectId: string) =>
  collection(firestore, "projects", projectId, "rooms");

export const listenToRooms = (
  projectId: string,
  onRooms: (rooms: Room[]) => void,
  onError?: (e: Error) => void
) => {
  const q = query(roomsCollection(projectId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap) => {
      const rooms = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          projectId,
          ...data,
          hasPendingWrites: d.metadata.hasPendingWrites,
          fromCache: d.metadata.fromCache,
        } as Room;
      });
      onRooms(rooms);
    },
    (err) => onError?.(err)
  );
};

export const createRoom = async (payload: NewRoomPayload) => {
  const createdAt = payload.createdAt ?? Date.now();
  const docRef = await addDoc(roomsCollection(payload.projectId), {
    name: payload.name,
    description: payload.description ?? null,
    createdAt,
    updatedAt: createdAt,
  });
  await updateDoc(doc(firestore, "projects", payload.projectId), {
    updatedAt: Date.now(),
  });
  return { id: docRef.id, ...payload, createdAt, updatedAt: createdAt };
};
