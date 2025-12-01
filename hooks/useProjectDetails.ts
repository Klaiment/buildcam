import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { listenToProject } from "@/services/projects";
import { listenToProjectPhotos, uploadProjectPhoto } from "@/services/photos";
import { requestCurrentLocation } from "@/services/location";
import { generateProjectPdf } from "@/services/pdfExport";
import { Project } from "@/types/project";
import { ProjectPhoto } from "@/types/photo";

type Status =
  | { label: string; pillStyle: any; textStyle: any; icon?: keyof typeof Ionicons.glyphMap; iconColor?: string }
  | { label: string; pillStyle: any; textStyle: any; icon?: undefined; iconColor?: undefined };

export const useProjectDetails = (projectId?: string) => {
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [photos, setPhotos] = React.useState<ProjectPhoto[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState("");
  const [showNoteModal, setShowNoteModal] = React.useState(false);
  const [locationInfo, setLocationInfo] = React.useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [exportUrl, setExportUrl] = React.useState<string | null>(null);
  const [exportError, setExportError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!projectId) return;
    const unsub = listenToProject(
      projectId,
      (data) => {
        setProject(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [projectId]);

  React.useEffect(() => {
    if (!projectId) return;
    const unsub = listenToProjectPhotos(
      projectId,
      (list) => setPhotos(list),
      (err) => setError(err.message)
    );
    return () => unsub();
  }, [projectId]);

  const ensureLocation = React.useCallback(async () => {
    try {
      const loc = await requestCurrentLocation();
      if (loc.status === "granted") {
        setLocationInfo({
          latitude: loc.location.latitude,
          longitude: loc.location.longitude,
          accuracy: loc.location.accuracy,
        });
      } else {
        setLocationInfo(null);
      }
    } catch {
      setLocationInfo(null);
    }
  }, []);

  const closeNoteModal = React.useCallback(() => {
    setShowNoteModal(false);
    setNoteDraft("");
  }, []);

  const pickImage = React.useCallback(
    async (source: "camera" | "library", noteForThisPhoto: string | null) => {
      if (!projectId) return;
      try {
        setUploading(true);
        await ensureLocation();

        const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!mediaPerm.granted) {
          Alert.alert("Permission requise", "Autorise l'accès à ta galerie pour ajouter une photo.");
          return;
        }

        let pickerResult: ImagePicker.ImagePickerResult;
        if (source === "camera") {
          const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
          if (!cameraPerm.granted) {
            Alert.alert("Permission requise", "Autorise la caméra pour prendre une photo.");
            return;
          }
          pickerResult = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });
        } else {
          pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsMultipleSelection: false,
          });
        }

        if (pickerResult.canceled || !pickerResult.assets?.length) {
          return;
        }

        const asset = pickerResult.assets[0];
        if (!asset.uri) {
          Alert.alert("Erreur", "Impossible de récupérer le fichier.");
          return;
        }

        await uploadProjectPhoto({
          projectId,
          uri: asset.uri,
          note: noteForThisPhoto,
          location: locationInfo || undefined,
        });
      } catch (err: any) {
        Alert.alert(
          "Upload impossible",
          err?.message || "Impossible d'ajouter la photo pour le moment."
        );
      } finally {
        setUploading(false);
        closeNoteModal();
      }
    },
    [closeNoteModal, ensureLocation, locationInfo, projectId]
  );

  const sortedPhotos = React.useMemo(
    () => [...photos].sort((a, b) => b.createdAt - a.createdAt),
    [photos]
  );

  const getPhotoStatus = React.useCallback(
    (styles: any, photo: ProjectPhoto): Status => {
      if (photo.uploadStatus === "error") {
        return {
          label: "Erreur",
          pillStyle: styles.statusError,
          textStyle: styles.statusErrorText,
          icon: "alert-circle",
          iconColor: "#b91c1c",
        };
      }
      if (photo.fromCache && photo.hasPendingWrites) {
        return {
          label: "Local",
          pillStyle: styles.statusLocal,
          textStyle: styles.statusLocalText,
        };
      }
      if (
        photo.uploadStatus === "pending" ||
        photo.uploadStatus === "syncing" ||
        !photo.url ||
        photo.hasPendingWrites
      ) {
        return {
          label: "En attente",
          pillStyle: styles.statusPending,
          textStyle: styles.statusPendingText,
        };
      }
      if (photo.fromCache) {
        return {
          label: "Local",
          pillStyle: styles.statusLocal,
          textStyle: styles.statusLocalText,
        };
      }
      return {
        label: "Synchro",
        icon: "cloud-done",
        iconColor: "#15803d",
        pillStyle: styles.statusSynced,
        textStyle: styles.statusSyncedText,
      };
    },
    []
  );

  const openGallery = React.useCallback(() => {
    if (!projectId) return;
    router.push({ pathname: "/project/[id]/gallery", params: { id: projectId } });
  }, [projectId]);

  const openRooms = React.useCallback(() => {
    if (!projectId) return;
    router.push({ pathname: "/project/[id]/rooms", params: { id: projectId } });
  }, [projectId]);

  const handleGeneratePdf = React.useCallback(
    async (startDate?: number | null, endDate?: number | null) => {
      if (!project) return;
      try {
        setExporting(true);
        setExportError(null);
        const result = await generateProjectPdf({
          project,
          photos,
          startDate: startDate || null,
          endDate: endDate || null,
        });
        setExportUrl(result.downloadUrl);
        return result;
      } catch (err: any) {
        setExportError(err?.message || "Impossible de générer le PDF pour le moment.");
        return null;
      } finally {
        setExporting(false);
      }
    },
    [photos, project]
  );

  const handleSelectSource = React.useCallback(
    (source: "camera" | "library") => {
      const noteForThisPhoto = noteDraft.trim() ? noteDraft.trim() : null;
      pickImage(source, noteForThisPhoto);
    },
    [noteDraft, pickImage]
  );

  const openNoteModal = React.useCallback(() => {
    setNoteDraft("");
    setShowNoteModal(true);
  }, []);

  const goBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, []);

  const handleSave = React.useCallback(() => {
    router.push({
      pathname: "/project/[id]/edit",
      params: { id: projectId },
    });
  }, [projectId]);

  return {
    project,
    loading,
    error,
    sortedPhotos,
    uploading,
    noteDraft,
    setNoteDraft,
    showNoteModal,
    openNoteModal,
    closeNoteModal,
    handleSelectSource,
    openGallery,
    goBack,
    handleSave,
    getPhotoStatus,
    exporting,
    exportUrl,
    exportError,
    handleGeneratePdf,
    openRooms,
  };
};
