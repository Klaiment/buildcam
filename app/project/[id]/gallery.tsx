import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";

import { listenToProject } from "@/services/projects";
import { listenToProjectPhotos } from "@/services/photos";
import { Project } from "@/types/project";
import { ProjectPhoto } from "@/types/photo";

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photos, setPhotos] = React.useState<ProjectPhoto[]>([]);
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const unsubProject = listenToProject(
      id,
      (data) => setProject(data),
      (err) => setError(err.message)
    );
    const unsubPhotos = listenToProjectPhotos(
      id,
      (list) => {
        setPhotos(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => {
      unsubProject();
      unsubPhotos();
    };
  }, [id]);

  const sortedPhotos = React.useMemo(
    () => [...photos].sort((a, b) => b.createdAt - a.createdAt),
    [photos]
  );

  const getPhotoStatus = React.useCallback((photo: ProjectPhoto) => {
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
  }, []);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.helper}>Chargement de la galerie...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.helper}>{error}</Text>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#0f172a" />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Galerie photos</Text>
          {project?.name ? <Text style={styles.subtitle}>{project.name}</Text> : null}
        </View>
        <View style={{ width: 44 }} />
      </View>
      {sortedPhotos.length === 0 ? (
        <View style={[styles.center, { padding: 20 }]}>
          <Ionicons name="image-outline" size={28} color="#94a3b8" />
          <Text style={styles.helper}>Aucune photo disponible.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {sortedPhotos.map((photo) => {
            const status = getPhotoStatus(photo);
            return (
              <Pressable
                key={photo.id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/project/[id]/photo/[photoId]",
                    params: { id, photoId: photo.id },
                  })
                }
              >
                {photo.url ? (
                  <Image
                    source={{ uri: photo.url }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="cloud-offline" size={22} color="#9ca3af" />
                  </View>
                )}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardDate}>
                      {new Date(photo.createdAt).toLocaleDateString("fr-FR")}
                    </Text>
                    <Text style={styles.cardTime}>
                      {new Date(photo.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, status.pillStyle]}>
                    {status.icon ? (
                      <Ionicons
                        name={status.icon as any}
                        size={14}
                        color={status.iconColor || status.textStyle?.color || "#0f172a"}
                        style={{ marginRight: 4 }}
                      />
                    ) : null}
                    <Text style={[styles.statusText, status.textStyle]}>{status.label}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 12,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47.5%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eef1f6",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: "#e5e7eb",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  cardDate: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },
  cardTime: {
    color: "#6b7280",
    fontSize: 12,
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
  statusError: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "#ef4444",
  },
  statusErrorText: {
    color: "#b91c1c",
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#eef1f6",
    alignItems: "center",
    justifyContent: "center",
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
});
