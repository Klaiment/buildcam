import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

import { firestore, storage } from "@/firebase/config";

type QueueItem = {
  id: string;
  projectId: string;
  uri: string;
  storagePath: string;
  attempts: number;
};

const STORAGE_KEY = "@buildcam/upload-queue";
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 15000;
const HEARTBEAT_MS = 30000;
const markError = async (item: QueueItem, message: string) => {
  try {
    const photoRef = doc(firestore, "projects", item.projectId, "photos", item.id);
    await updateDoc(photoRef, {
      uploadStatus: "error",
      uploadAttempts: item.attempts,
      uploadError: message,
    });
  } catch {
    // swallow errors to avoid crashing the queue
  }
};

let queue: QueueItem[] = [];
let loaded = false;
let processing = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let appStateSubscribed = false;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

const saveQueue = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // ignore persistence errors silently
  }
};

const loadQueue = async () => {
  if (loaded) return;
  loaded = true;
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      queue = JSON.parse(data);
    }
  } catch {
    queue = [];
  }
};

const scheduleRetry = () => {
  if (retryTimer || queue.length === 0) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    processQueue();
  }, RETRY_DELAY_MS);
};

const isNetworkError = (err: any) => {
  if (!err) return false;
  const msg = String(err.message || "").toLowerCase();
  return (
    msg.includes("network") ||
    err.code === "storage/retry-limit-exceeded" ||
    err.code === "storage/network-request-failed"
  );
};

const attemptUpload = async (item: QueueItem) => {
  const photoRef = doc(firestore, "projects", item.projectId, "photos", item.id);
  const storageRef = ref(storage, item.storagePath);

  try {
    await updateDoc(photoRef, {
      uploadStatus: "syncing",
    });
  } catch {
    // if offline for Firestore update, continue; Firestore will sync later
  }

  let blob: Blob;
  try {
    const response = await fetch(item.uri);
    blob = await response.blob();
  } catch (err) {
    item.attempts += 1;
    const status = item.attempts >= MAX_ATTEMPTS ? "error" : "pending";
    await markError(item, "Fichier introuvable ou inaccessible");
    return item.attempts >= MAX_ATTEMPTS;
  }

  try {
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    await updateDoc(photoRef, {
      url,
      uploadStatus: "synced",
      uploadAttempts: item.attempts,
      uploadError: null,
      path: item.storagePath,
    });
    return true;
  } catch (err: any) {
    if (isNetworkError(err)) {
      // don't count attempts for network issues; try again later
      await updateDoc(photoRef, {
        uploadStatus: "pending",
        uploadError: "En attente de réseau",
      });
      return false;
    }
    item.attempts += 1;
    const status = item.attempts >= MAX_ATTEMPTS ? "error" : "pending";
    await updateDoc(photoRef, {
      uploadStatus: status,
      uploadAttempts: item.attempts,
      uploadError: err?.message || "Erreur inconnue",
    });
    return status === "error";
  }
};

export const enqueueUpload = async (item: Omit<QueueItem, "attempts">) => {
  await loadQueue();
  queue.push({ ...item, attempts: 0 });
  await saveQueue();
  processQueue();
};

export const processQueue = async () => {
  await loadQueue();
  if (processing || queue.length === 0) return;
  processing = true;
  try {
    let index = 0;
    while (index < queue.length) {
      const item = queue[index];
      let done = false;
      try {
        done = await attemptUpload(item);
      } catch (err: any) {
        item.attempts = MAX_ATTEMPTS;
        await markError(item, err?.message || "Erreur interne");
        done = true;
      }
      if (done) {
        queue.splice(index, 1);
        await saveQueue();
      } else {
        index += 1;
      }
    }
  } finally {
    processing = false;
    if (queue.length > 0) {
      scheduleRetry();
    } else if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  }
};

export const startUploadQueueProcessor = async () => {
  await loadQueue();
  if (queue.length > 0) {
    processQueue();
  }
  if (!appStateSubscribed) {
    AppState.addEventListener("change", (state) => {
      if (state === "active") {
        processQueue();
      }
    });
    appStateSubscribed = true;
  }
  if (!heartbeatTimer) {
    heartbeatTimer = setInterval(() => {
      processQueue();
    }, HEARTBEAT_MS);
  }
};

export const forceProcessQueue = async () => {
  await loadQueue();
  processQueue();
};
import { AppState } from "react-native";
