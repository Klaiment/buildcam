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
import { NewTaskPayload, Task } from "@/types/task";

const tasksCollection = (projectId: string, roomId: string) =>
  collection(firestore, "projects", projectId, "rooms", roomId, "tasks");

export const listenToTasks = (
  projectId: string,
  roomId: string,
  onTasks: (tasks: Task[]) => void,
  onError?: (e: Error) => void
) => {
  const q = query(tasksCollection(projectId, roomId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap) => {
      const tasks = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          projectId,
          roomId,
          ...data,
          hasPendingWrites: d.metadata.hasPendingWrites,
          fromCache: d.metadata.fromCache,
        } as Task;
      });
      onTasks(tasks);
    },
    (err) => onError?.(err)
  );
};

export const createTask = async (payload: NewTaskPayload) => {
  const createdAt = payload.createdAt ?? Date.now();
  const status = payload.status ?? "todo";
  const docRef = await addDoc(tasksCollection(payload.projectId, payload.roomId), {
    title: payload.title,
    description: payload.description ?? null,
    status,
    createdAt,
    updatedAt: createdAt,
  });
  await updateDoc(doc(firestore, "projects", payload.projectId), {
    updatedAt: Date.now(),
  });
  return { id: docRef.id, ...payload, status, createdAt, updatedAt: createdAt };
};
