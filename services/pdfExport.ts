import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as Print from "expo-print";

import { storage } from "@/firebase/config";
import { Project } from "@/types/project";
import { ProjectPhoto } from "@/types/photo";

type Params = {
  project: Project;
  photos: ProjectPhoto[];
  startDate?: number | null;
  endDate?: number | null;
};

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatDateTime = (ts: number) =>
  new Date(ts).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const generateProjectPdf = async ({
  project,
  photos,
  startDate,
  endDate,
}: Params) => {
  const filtered = photos.filter((p) => {
    const ts = p.createdAt;
    if (startDate && ts < startDate) return false;
    if (endDate && ts > endDate) return false;
    return true;
  });

  const dateLabel =
    startDate || endDate
      ? `${startDate ? formatDate(startDate) : "..."} - ${endDate ? formatDate(endDate) : "..."}`
      : "Toute la période";

  const photosHtml = filtered
    .map(
      (p) => `
      <div class="photo">
        <div class="thumb">
          <img src="${p.url}" />
        </div>
        <div class="meta">
          <div class="meta-title">${formatDateTime(p.createdAt)}</div>
          <div class="meta-note">${p.note ? p.note : "Aucune note"}</div>
        </div>
      </div>
    `
    )
    .join("");

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; }
          h1 { margin: 0 0 4px 0; font-size: 22px; }
          h2 { margin: 16px 0 12px 0; font-size: 16px; }
          .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 16px; }
          .section { margin-bottom: 16px; }
          .photo { display: flex; gap: 12px; margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
          .thumb { width: 120px; height: 100px; background: #f3f4f6; flex-shrink: 0; }
          .thumb img { width: 100%; height: 100%; object-fit: cover; }
          .meta { padding: 10px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
          .meta-title { font-weight: 700; font-size: 13px; }
          .meta-note { color: #374151; font-size: 12px; line-height: 1.4; }
          .empty { color: #6b7280; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>Rapport chantier</h1>
        <div class="subtitle">${project.name} · ${project.location ? "Localisé" : "Sans localisation"}</div>
        <div class="section">
          <div><strong>Période :</strong> ${dateLabel}</div>
          <div><strong>Photos incluses :</strong> ${filtered.length}</div>
        </div>
        <h2>Photos</h2>
        ${filtered.length === 0 ? `<div class="empty">Aucune photo dans cette période.</div>` : photosHtml}
      </body>
    </html>
  `;

  const pdf = await Print.printToFileAsync({
    html,
  });

  const response = await fetch(pdf.uri);
  const blob = await response.blob();

  const storagePath = `projects/${project.id}/exports/report-${Date.now()}.pdf`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob, { contentType: "application/pdf" });
  const downloadUrl = await getDownloadURL(storageRef);

  return {
    downloadUrl,
    storagePath,
    photoCount: filtered.length,
  };
};
