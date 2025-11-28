import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { listenToProject } from "@/services/projects";
import { Project } from "@/types/project";

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
            {renderSyncBadge(project)}
          </View>
          <View style={styles.photoPlaceholder}>
            <Ionicons name="image-outline" size={28} color="#94a3b8" />
            <Text style={styles.placeholderText}>
              {project.photoCount === 0
                ? "Aucune photo pour le moment."
                : `${project.photoCount} photo(s) associée(s).`}
            </Text>
            <Text style={styles.placeholderSub}>
              Ajoute des photos depuis l&apos;écran principal (à implémenter).
            </Text>
          </View>
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
