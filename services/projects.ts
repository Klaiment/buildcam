import {
  addDoc,
  collection,
  doc,
  DocumentData,
  enableNetwork,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  waitForPendingWrites,
} from "firebase/firestore";

import { auth, firestore } from "@/firebase/config";
import { NewProjectPayload, Project } from "@/types/project";

const PROJECTS_COLLECTION = "projects";

const projectsCollection = () =>
  collection(firestore, PROJECTS_COLLECTION).withConverter({
    toFirestore(project: NewProjectPayload & { userId?: string | null }) {
      return {
        ...project,
        createdAt: Date.now(),
      };
    },
  fromFirestore(snapshot): Project {
    const data = snapshot.data() as DocumentData;
    const createdAt =
      typeof data.createdAt === "number" ? data.createdAt : Date.now();
    const updatedAt =
      typeof data.updatedAt === "number" ? data.updatedAt : createdAt;
    return {
      id: snapshot.id,
      name: data.name,
      location: data.location || null,
      createdAt,
      updatedAt,
      photoCount: typeof data.photoCount === "number" ? data.photoCount : 0,
      userId: data.userId ?? null,
      hasPendingWrites: snapshot.metadata.hasPendingWrites,
    };
  },
  });

const projectDoc = (id: string) => doc(firestore, PROJECTS_COLLECTION, id).withConverter(projectsCollection().converter);

type ProjectsSnapshot = {
  projects: Project[];
  fromCache: boolean;
  hasPendingWrites: boolean;
};

export const listenToProjects = (
  onProjects: (payload: ProjectsSnapshot) => void,
  onError?: (error: Error) => void
) => {
  const userId = auth.currentUser?.uid;
  const projectQuery = query(
    projectsCollection(),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(
    projectQuery,
    { includeMetadataChanges: true },
    (snapshot) => {
      const projects = snapshot.docs
        .map((docSnapshot) => {
          const project = docSnapshot.data();

          if (userId && project.userId && project.userId !== userId) {
            return null;
          }

          return project;
        })
        .filter(Boolean) as Project[];

      onProjects({
        projects,
        fromCache: snapshot.metadata.fromCache,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
      });
    },
    (error) => onError?.(error)
  );
};

export const createProject = async (
  payload: NewProjectPayload
): Promise<Project> => {
  const normalizedName = payload.name.trim();
  if (!normalizedName) {
    throw new Error("Le nom du chantier est requis.");
  }

  const projectToSave = {
    ...payload,
    name: normalizedName,
    userId: auth.currentUser?.uid ?? null,
    photoCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await addDoc(projectsCollection(), projectToSave);

  return {
    id: docRef.id,
    ...projectToSave,
    hasPendingWrites: true,
  };
};

export const forceSyncProjects = async () => {
  await enableNetwork(firestore);
  await waitForPendingWrites(firestore);
};

export const listenToProject = (
  id: string,
  onProject: (project: Project | null) => void,
  onError?: (error: Error) => void
) => {
  return onSnapshot(
    projectDoc(id),
    { includeMetadataChanges: true },
    (snapshot) => {
      if (!snapshot.exists()) {
        onProject(null);
        return;
      }
      onProject(snapshot.data());
    },
    (error) => onError?.(error)
  );
};

export const updateProject = async (
  id: string,
  data: Partial<Pick<Project, "name" | "location" | "photoCount">>
) => {
  const updates: Record<string, any> = {
    ...data,
    updatedAt: Date.now(),
  };

  if (typeof data.name === "string") {
    updates.name = data.name.trim();
  }

  await updateDoc(projectDoc(id), updates);
};
