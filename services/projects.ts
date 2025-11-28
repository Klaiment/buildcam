import {
  addDoc,
  collection,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
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
      return {
        id: snapshot.id,
        name: data.name,
        location: data.location || null,
        createdAt:
          typeof data.createdAt === "number"
            ? data.createdAt
            : Date.now(),
        userId: data.userId ?? null,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
      };
    },
  });

export const listenToProjects = (
  onProjects: (projects: Project[]) => void,
  onError?: (error: Error) => void
) => {
  const userId = auth.currentUser?.uid;
  const projectQuery = query(
    projectsCollection(),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    projectQuery,
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

      onProjects(projects);
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
  };

  const docRef = await addDoc(projectsCollection(), projectToSave);

  return {
    id: docRef.id,
    ...projectToSave,
    createdAt: Date.now(),
    hasPendingWrites: true,
  };
};
