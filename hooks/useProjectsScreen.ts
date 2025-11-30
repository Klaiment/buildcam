import React from "react";
import { Alert } from "react-native";
import { onAuthStateChanged, type User } from "firebase/auth";
import { router } from "expo-router";

import { auth } from "@/firebase/config";
import { requestCurrentLocation } from "@/services/location";
import {
  createProject,
  forceSyncProjects,
  listenToProjects,
} from "@/services/projects";
import { Project, ProjectLocation } from "@/types/project";
import { LocationStatus } from "@/components/home/locationTypes";

export const useProjectsScreen = () => {
  const [projectName, setProjectName] = React.useState("");
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [loadingProjects, setLoadingProjects] = React.useState(true);
  const [location, setLocation] = React.useState<ProjectLocation | null>(null);
  const [locationStatus, setLocationStatus] = React.useState<LocationStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [manualMode, setManualMode] = React.useState(false);
  const [manualLatitude, setManualLatitude] = React.useState("");
  const [manualLongitude, setManualLongitude] = React.useState("");
  const [fromCache, setFromCache] = React.useState(true);
  const [hasPendingWrites, setHasPendingWrites] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setProjectName("");
    setManualLatitude("");
    setManualLongitude("");
    setManualMode(false);
    setErrorMessage(null);
  }, []);

  const fetchLocation = React.useCallback(async () => {
    setLocationStatus("loading");
    try {
      const result = await requestCurrentLocation();
      if (result.status === "granted") {
        setLocation(result.location);
        setLocationStatus("granted");
        setErrorMessage(null);
        return;
      }

      setLocation(null);
      setLocationStatus(result.status);
      setErrorMessage(result.reason ?? null);
      setManualMode(result.status !== "granted");
    } catch (error: any) {
      setLocation(null);
      setLocationStatus("unavailable");
      setErrorMessage(error?.message || "Impossible de récupérer la localisation.");
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = listenToProjects(
      (payload) => {
        setProjects(payload.projects);
        setFromCache(payload.fromCache);
        setHasPendingWrites(payload.hasPendingWrites);
        setLoadingProjects(false);
        setErrorMessage(null);
      },
      (error) => {
        setErrorMessage(error.message);
        setLoadingProjects(false);
      }
    );

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    void fetchLocation();
  }, [fetchLocation]);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setCheckingAuth(false);
      if (!user) {
        router.replace("/(tabs)/(login)");
      }
    });
    return () => unsub();
  }, []);

  const handleSubmitManualLocation = React.useCallback(() => {
    const lat = parseFloat(manualLatitude.replace(",", "."));
    const lng = parseFloat(manualLongitude.replace(",", "."));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      Alert.alert("Coordonnées invalides", "Merci de saisir une latitude et une longitude valides.");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert("Coordonnées hors limites", "Latitude entre -90 et 90, longitude entre -180 et 180.");
      return;
    }

    const manualLocation: ProjectLocation = {
      latitude: lat,
      longitude: lng,
      timestamp: Date.now(),
    };

    setLocation(manualLocation);
    setLocationStatus("manual");
    setErrorMessage(null);
  }, [manualLatitude, manualLongitude]);

  const handleCreateProject = React.useCallback(async () => {
    const normalizedName = projectName.trim();
    if (!normalizedName) {
      Alert.alert("Nom requis", "Merci de renseigner le nom du chantier.");
      return;
    }

    try {
      setSubmitting(true);
      await createProject({
        name: normalizedName,
        location,
      });
      resetForm();
      setShowCreateModal(false);
      Alert.alert(
        "Chantier enregistré",
        "Le chantier est stocké localement et sera synchronisé dès que le réseau revient."
      );
    } catch (error: any) {
      const message = error?.message || "Impossible d'enregistrer le chantier pour le moment.";
      Alert.alert("Enregistrement impossible", message);
    } finally {
      setSubmitting(false);
    }
  }, [location, projectName, resetForm]);

  const handleForceSync = React.useCallback(async () => {
    try {
      setSyncing(true);
      await forceSyncProjects();
      setErrorMessage(null);
    } catch (error: any) {
      const message = error?.message || "Impossible de synchroniser pour le moment.";
      setErrorMessage(message);
      Alert.alert("Synchro impossible", message);
    } finally {
      setSyncing(false);
    }
  }, []);

  const openCreateModal = React.useCallback(() => {
    resetForm();
    setShowCreateModal(true);
  }, [resetForm]);

  const closeCreateModal = React.useCallback(() => {
    setShowCreateModal(false);
  }, []);

  return {
    checkingAuth,
    currentUser,
    projectName,
    setProjectName,
    projects,
    loadingProjects,
    location,
    locationStatus,
    manualMode,
    setManualMode,
    manualLatitude,
    manualLongitude,
    setManualLatitude,
    setManualLongitude,
    fromCache,
    hasPendingWrites,
    syncing,
    errorMessage,
    showCreateModal,
    fetchLocation,
    handleCreateProject,
    handleSubmitManualLocation,
    handleForceSync,
    openCreateModal,
    closeCreateModal,
    submitting,
  };
};
