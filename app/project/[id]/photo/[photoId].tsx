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
        <Image
          source={{ uri: photo.url }}
          style={styles.fullImage}
          contentFit="cover"
          transition={200}
        />
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
            <Text style={styles.infoText}>
              {photo.hasPendingWrites ? "En attente de synchro" : "Synchronisée"}
            </Text>
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
