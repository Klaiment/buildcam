import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";

import { listenToPhoto } from "@/services/photos";
import { ProjectPhoto } from "@/types/photo";

export default function PhotoDetailScreen() {
  const { id, photoId } = useLocalSearchParams<{ id: string; photoId: string }>();
  const [photo, setPhoto] = React.useState<ProjectPhoto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const getStatus = React.useCallback((p: ProjectPhoto) => {
    if (p.uploadStatus === "error") {
      return {
        label: "Erreur",
        pillStyle: styles.statusError,
        textStyle: styles.statusErrorText,
        icon: "alert-circle",
        iconColor: "#b91c1c",
      };
    }
    if (p.fromCache && p.hasPendingWrites) {
      return {
        label: "Local",
        pillStyle: styles.statusLocal,
        textStyle: styles.statusLocalText,
      };
    }
    if (
      p.uploadStatus === "pending" ||
      p.uploadStatus === "syncing" ||
      !p.url ||
      p.hasPendingWrites
    ) {
      return {
        label: "En attente",
        pillStyle: styles.statusPending,
        textStyle: styles.statusPendingText,
      };
    }
    if (p.fromCache) {
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
    if (!id || !photoId) return;
    const unsub = listenToPhoto(
      id,
      photoId,
      (data) => {
        setPhoto(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id, photoId]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };
  const status = photo ? getStatus(photo) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.helper}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !photo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.helper}>{error || "Photo introuvable."}</Text>
          <Pressable onPress={goBack} style={styles.closeButton}>
            <Text style={styles.closeText}>Fermer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.title}>Photo</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.content}>
        {photo.url ? (
          <Image
            source={{ uri: photo.url }}
            style={styles.fullImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.fullImage, styles.fullImagePlaceholder]}>
            <Ionicons name="cloud-offline" size={26} color="#9ca3af" />
            <Text style={styles.placeholderText}>En attente d’upload</Text>
          </View>
        )}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#111827" />
            <Text style={styles.infoText}>
              {new Date(photo.createdAt).toLocaleString("fr-FR")}
            </Text>
          </View>
          {photo.note ? (
            <View style={[styles.infoRow, { alignItems: "flex-start" }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#111827" />
              <Text style={styles.infoText}>{photo.note}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Ionicons name="cloud-outline" size={16} color="#111827" />
            {status ? (
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
            ) : (
              <Text style={styles.infoText}>Synchronisation inconnue</Text>
            )}
          </View>
          {photo.location ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#111827" />
              <Text style={styles.infoText}>
                {photo.location.latitude.toFixed(5)}, {photo.location.longitude.toFixed(5)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  fullImage: {
    width: "100%",
    height: "60%",
    backgroundColor: "#0f172a",
  },
  infoCard: {
    padding: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    color: "#111827",
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
    fontSize: 12,
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
  fullImagePlaceholder: {
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  helper: {
    color: "#ffffff",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  closeText: {
    color: "#0f172a",
    fontWeight: "700",
  },
});
