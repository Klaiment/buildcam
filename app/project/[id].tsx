import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

import { listenToProject } from "@/services/projects";
import { listenToProjectPhotos, uploadProjectPhoto } from "@/services/photos";
import { Project } from "@/types/project";
import { ProjectPhoto } from "@/types/photo";
import { requestCurrentLocation } from "@/services/location";

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
  const sortedPhotos = React.useMemo(
    () => [...photos].sort((a, b) => b.createdAt - a.createdAt),
    [photos]
  );

  const getPhotoStatus = React.useCallback((photo: ProjectPhoto) => {
    if (photo.fromCache && photo.hasPendingWrites) {
      return {
        label: "Local",
        pillStyle: styles.statusLocal,
        textStyle: styles.statusLocalText,
      };
    }
    if (photo.hasPendingWrites) {
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
  }, []);

  React.useEffect(() => {
    if (!id) return;
    const unsub = listenToProject(
      id,
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
  }, [id]);

  React.useEffect(() => {
    if (!id) return;
    const unsub = listenToProjectPhotos(
      id,
      (list) => setPhotos(list),
      (err) => setError(err.message)
    );
    return () => unsub();
  }, [id]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const openGallery = () => {
    if (!id) return;
    router.push({ pathname: "/project/[id]/gallery", params: { id } });
  };

  const openMaps = (p: Project) => {
    if (!p.location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${p.location.latitude},${p.location.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const renderSyncBadge = (p: Project) => (
    <View style={styles.syncBadge}>
      <View
        style={[
          styles.syncDot,
          p.hasPendingWrites ? styles.syncDotPending : styles.syncDotSynced,
        ]}
      />
      <Text style={styles.syncBadgeText}>
        {p.hasPendingWrites ? "En attente de synchro" : "Synchronisé"}
      </Text>
    </View>
  );

  const handleSave = async () => {
    router.push({
      pathname: "/project/[id]/edit",
      params: { id: project?.id },
    });
  };

  const ensureLocation = async () => {
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
  };

  const pickImage = async (source: "camera" | "library", noteForThisPhoto: string | null) => {
    if (!id) return;
    try {
      setUploading(true);
      await ensureLocation();

      const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!mediaPerm.granted) {
        Alert.alert(
          "Permission requise",
          "Autorise l'accès à ta galerie pour ajouter une photo."
        );
        return;
      }

      let pickerResult: ImagePicker.ImagePickerResult;
      if (source === "camera") {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPerm.granted) {
          Alert.alert(
            "Permission requise",
            "Autorise la caméra pour prendre une photo."
          );
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
        projectId: id,
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
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setNoteDraft("");
  };

  const handleAddPhoto = () => {
    setNoteDraft("");
    setShowNoteModal(true);
  };

  const handleSelectSource = (source: "camera" | "library") => {
    const noteForThisPhoto = noteDraft.trim() ? noteDraft.trim() : null;
    pickImage(source, noteForThisPhoto);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.helper}>Chargement du chantier...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!project) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>Chantier introuvable.</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#0f172a" />
          </Pressable>
          <View style={styles.heroTitles}>
            <Text style={styles.heroTitle}>{project.name}</Text>
            <Text style={styles.heroSubtitle}>
              Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")} ·
              Mis à jour le {new Date(project.updatedAt).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="images-outline" size={18} color="#0f172a" />
            <View>
              <Text style={styles.statLabel}>Photos</Text>
              <Text style={styles.statValue}>
                {project.photoCount} {project.photoCount > 1 ? "photos" : "photo"}
              </Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="location-outline" size={18} color="#0f172a" />
            <View>
              <Text style={styles.statLabel}>Localisation</Text>
              <Text style={styles.statValue}>
                {project.location ? "Disponible" : "Non renseignée"}
              </Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cloud-done-outline" size={18} color="#0f172a" />
            <View>
              <Text style={styles.statLabel}>Synchro</Text>
              <Text style={styles.statValue}>
                {project.hasPendingWrites ? "En attente" : "À jour"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            {project.location && (
              <Pressable style={styles.chip} onPress={() => openMaps(project)}>
                <Ionicons name="map-outline" size={16} color="#0f172a" style={{ marginRight: 6 }} />
                <Text style={styles.chipText}>Ouvrir la carte</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.sectionText}>
            {project.location
              ? `${project.location.latitude.toFixed(5)}, ${project.location.longitude.toFixed(5)}`
              : "Aucune localisation enregistrée pour ce chantier."}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionTitle}>Photos</Text>
              {sortedPhotos.length > 0 && (
                <Pressable onPress={openGallery} style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>Voir tout</Text>
                  <Ionicons name="chevron-forward" size={14} color="#0f172a" />
                </Pressable>
              )}
            </View>
            <View style={styles.sectionActions}>
              {renderSyncBadge(project)}
              <Pressable
                style={[
                  styles.addPhotoButton,
                  uploading && styles.addPhotoButtonDisabled,
                ]}
                disabled={uploading}
                onPress={handleAddPhoto}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#0f172a" />
                ) : (
                  <>
                    <Ionicons
                      name="add"
                      size={18}
                      color="#0f172a"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.addPhotoText}>Ajouter</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
          {sortedPhotos.length === 0 ? (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={28} color="#94a3b8" />
              <Text style={styles.placeholderText}>
                Aucune photo pour le moment.
              </Text>
              <Text style={styles.placeholderSub}>
                Ajoute une photo du chantier pour suivre son évolution.
              </Text>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {sortedPhotos.map((photo) => {
                const status = getPhotoStatus(photo);
                return (
                  <Pressable
                    key={photo.id}
                    style={styles.photoItem}
                    onPress={() =>
                      router.push({
                        pathname: "/project/[id]/photo/[photoId]",
                        params: { id, photoId: photo.id },
                      })
                    }
                  >
                    <Image
                      source={{ uri: photo.url }}
                      style={styles.photo}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.photoFooter}>
                      <Text style={styles.photoDate}>
                        {new Date(photo.createdAt).toLocaleDateString("fr-FR")}
                      </Text>
                      <View
                        style={[
                          styles.statusPill,
                          status.pillStyle,
                        ]}
                      >
                        {status.icon ? (
                          <Ionicons
                            name={status.icon as any}
                            size={14}
                            color={status.iconColor || status.textStyle?.color || "#0f172a"}
                            style={{ marginRight: 4 }}
                          />
                        ) : null}
                        <Text
                          style={[
                            styles.statusText,
                            status.textStyle,
                          ]}
                        >
                          {status.label}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actions</Text>
          </View>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Ionicons
              name="create-outline"
              size={18}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.saveButtonText}>Modifier le chantier</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderContent()}
      <Modal visible={showNoteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter une photo</Text>
              <Pressable onPress={closeNoteModal} style={styles.modalClose}>
                <Ionicons name="close" size={20} color="#0f172a" />
              </Pressable>
            </View>
            <Text style={styles.modalLabel}>Note (optionnel)</Text>
            <TextInput
              value={noteDraft}
              onChangeText={setNoteDraft}
              placeholder="Ex: façade nord, fissure à surveiller"
              placeholderTextColor="#9ca3af"
              style={styles.modalInput}
              multiline
            />
            <Text style={styles.modalHint}>
              La note sera attachée uniquement à cette photo et visible en plein écran.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalSecondary]}
                onPress={closeNoteModal}
              >
                <Text style={styles.modalSecondaryText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalPrimary]}
                disabled={uploading}
                onPress={() => handleSelectSource("library")}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#0f172a" />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={16} color="#0f172a" />
                    <Text style={styles.modalPrimaryText}>Depuis la galerie</Text>
                  </>
                )}
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalPrimary]}
                disabled={uploading}
                onPress={() => handleSelectSource("camera")}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#0f172a" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={16} color="#0f172a" />
                    <Text style={styles.modalPrimaryText}>Prendre une photo</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7fb",
  },
  scroll: {
    padding: 20,
    gap: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  helper: {
    color: "#6b7280",
  },
  hero: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitles: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eef1f6",
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 12,
  },
  statValue: {
    color: "#0f172a",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#eef1f6",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionText: {
    color: "#4b5563",
    fontSize: 14,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
  },
  chipText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 12,
  },
  photoPlaceholder: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
  },
  placeholderText: {
    color: "#0f172a",
    fontWeight: "700",
  },
  placeholderSub: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
  },
  addPhotoButton: {
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoButtonDisabled: {
    opacity: 0.5,
  },
  addPhotoText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  photoItem: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
  },
  photo: {
    width: "100%",
    height: "80%",
  },
  photoDate: {
    color: "#4b5563",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "#f8fafc",
    borderColor: "#e5e7eb",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },
  statusPending: {
    backgroundColor: "rgba(249, 115, 22, 0.08)",
    borderColor: "#f97316",
  },
  statusPendingText: {
    color: "#9a3412",
  },
  statusSynced: {
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderColor: "#22c55e",
  },
  statusSyncedText: {
    color: "#15803d",
  },
  statusLocal: {
    backgroundColor: "rgba(14, 165, 233, 0.08)",
    borderColor: "#0ea5e9",
  },
  statusLocalText: {
    color: "#0284c7",
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  syncBadgeText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 12,
  },
  syncDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  syncDotPending: {
    backgroundColor: "#f97316",
  },
  syncDotSynced: {
    backgroundColor: "#16a34a",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  seeAllText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  modalLabel: {
    fontWeight: "700",
    color: "#0f172a",
  },
  modalInput: {
    minHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    textAlignVertical: "top",
  },
  modalHint: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalActions: {
    flexDirection: "column",
    gap: 8,
  },
  modalButton: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modalPrimary: {
    backgroundColor: "#eef2ff",
    borderColor: "#e0e7ff",
  },
  modalPrimaryText: {
    color: "#0f172a",
    fontWeight: "700",
  },
  modalSecondary: {
    backgroundColor: "#f8fafc",
    borderColor: "#e5e7eb",
  },
  modalSecondaryText: {
    color: "#374151",
    fontWeight: "700",
  },
  sectionActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
  },
  saveButton: {
    marginTop: 6,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
