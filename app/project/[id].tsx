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
  const [noteInput, setNoteInput] = React.useState("");
  const [locationInfo, setLocationInfo] = React.useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = React.useState<
    "idle" | "loading" | "granted" | "denied" | "unavailable"
  >("idle");

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
    setLocationStatus("loading");
    try {
      const loc = await requestCurrentLocation();
      if (loc.status === "granted") {
        setLocationInfo({
          latitude: loc.location.latitude,
          longitude: loc.location.longitude,
          accuracy: loc.location.accuracy,
        });
        setLocationStatus("granted");
      } else {
        setLocationInfo(null);
        setLocationStatus(loc.status);
      }
    } catch {
      setLocationInfo(null);
      setLocationStatus("unavailable");
    }
  };

  const pickImage = async (source: "camera" | "library") => {
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
        note: noteInput.trim() ? noteInput.trim() : null,
        location: locationInfo || undefined,
      });
      setNoteInput("");
    } catch (err: any) {
      Alert.alert(
        "Upload impossible",
        err?.message || "Impossible d'ajouter la photo pour le moment."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhoto = () => {
    Alert.alert(
      "Ajouter une photo",
      "Choisis une source",
      [
        {
          text: "Caméra (live)",
          onPress: () => pickImage("camera"),
        },
        {
          text: "Depuis la galerie",
          onPress: () => pickImage("library"),
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
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
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
          <View style={styles.noteBlock}>
            <Text style={styles.inputLabel}>Note (facultative)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={noteInput}
                onChangeText={setNoteInput}
                placeholder="Ex: façade nord, fissure à surveiller"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
            <Text style={styles.locationHint}>
              Localisation:{" "}
              {locationStatus === "loading"
                ? "Récupération..."
                : locationStatus === "granted" && locationInfo
                ? `${locationInfo.latitude.toFixed(5)}, ${locationInfo.longitude.toFixed(5)}`
                : "Non disponible"}
            </Text>
          </View>
          {photos.length === 0 ? (
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
              {photos.map((photo) => {
                const statusText = photo.hasPendingWrites
                  ? "En attente"
                  : "Synchronisé";
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
                          photo.hasPendingWrites
                            ? styles.statusPending
                            : styles.statusSynced,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            photo.hasPendingWrites && { color: "#9a3412" },
                          ]}
                        >
                          {statusText}
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

  return <SafeAreaView style={styles.safeArea}>{renderContent()}</SafeAreaView>;
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
  noteBlock: {
    gap: 8,
    marginBottom: 8,
  },
  locationHint: {
    fontSize: 12,
    color: "#6b7280",
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
