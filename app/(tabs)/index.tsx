import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createProject, listenToProjects } from "@/services/projects";
import { requestCurrentLocation } from "@/services/location";
import { Project, ProjectLocation } from "@/types/project";

type LocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

export default function ProjectsScreen() {
  const [projectName, setProjectName] = React.useState("");
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [loadingProjects, setLoadingProjects] = React.useState(true);
  const [location, setLocation] = React.useState<ProjectLocation | null>(null);
  const [locationStatus, setLocationStatus] =
    React.useState<LocationStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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
    } catch (error: any) {
      setLocation(null);
      setLocationStatus("unavailable");
      setErrorMessage(
        error?.message || "Impossible de récupérer la localisation."
      );
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = listenToProjects(
      (projectsList) => {
        setProjects(projectsList);
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

  const handleCreateProject = async () => {
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
      setProjectName("");
      Alert.alert(
        "Chantier enregistré",
        "Le chantier est stocké localement et sera synchronisé dès que le réseau revient."
      );
    } catch (error: any) {
      const message =
        error?.message ||
        "Impossible d'enregistrer le chantier pour le moment.";
      Alert.alert("Enregistrement impossible", message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderLocationBadge = () => {
    const baseStyle = [styles.locationBadge];

    if (locationStatus === "granted") {
      baseStyle.push(styles.locationBadgeSuccess);
    } else if (locationStatus === "loading") {
      baseStyle.push(styles.locationBadgeLoading);
    } else if (locationStatus === "denied" || locationStatus === "unavailable") {
      baseStyle.push(styles.locationBadgeWarning);
    }

    let label = "Localisation inactive";
    if (locationStatus === "loading") label = "Localisation...";
    if (locationStatus === "granted") label = "Localisation OK";
    if (locationStatus === "denied") label = "Permission manquante";
    if (locationStatus === "unavailable") label = "GPS indisponible";

    return (
      <View style={styles.locationRow}>
        <View style={styles.locationLabel}>
          <Ionicons
            name="location-outline"
            size={18}
            color="#0f172a"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.label}>Localisation</Text>
        </View>
        <View style={baseStyle}>
          {locationStatus === "loading" ? (
            <ActivityIndicator size="small" color="#0f172a" />
          ) : (
            <Text style={styles.locationBadgeText}>{label}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="construct" size={20} color="#0f172a" />
            </View>
            <View>
              <Text style={styles.title}>Nouveau chantier</Text>
              <Text style={styles.subtitle}>
                Nom obligatoire, localisation automatique si dispo.
              </Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nom du chantier *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="folder-outline" size={20} color="#9ca3af" />
              <TextInput
                value={projectName}
                onChangeText={setProjectName}
                placeholder="Ex: Maison rue Victor Hugo"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            {renderLocationBadge()}
            {location && (
              <Text style={styles.locationDetails}>
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} (
                {location.accuracy ? `${location.accuracy.toFixed(0)}m` : "gps"}
                )
              </Text>
            )}

            <Pressable
              style={styles.secondaryButton}
              onPress={fetchLocation}
              disabled={locationStatus === "loading"}
            >
              <Ionicons
                name="refresh"
                size={18}
                color="#0f172a"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.secondaryButtonText}>
                Rafraîchir la position
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.primaryButton,
              (!projectName.trim() || submitting) && styles.primaryButtonDisabled,
            ]}
            disabled={!projectName.trim() || submitting}
            onPress={handleCreateProject}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? "Enregistrement..." : "Créer le chantier"}
            </Text>
          </Pressable>
          <Text style={styles.helperText}>
            Stocké localement et synchronisé automatiquement quand le réseau est
            de retour.
          </Text>
          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Vos chantiers</Text>
            {loadingProjects && <ActivityIndicator size="small" color="#0f172a" />}
          </View>

          {!loadingProjects && projects.length === 0 ? (
            <Text style={styles.emptyState}>
              Aucun chantier pour le moment. Créez-en un pour commencer.
            </Text>
          ) : (
            projects.map((project) => (
              <View key={project.id} style={styles.projectRow}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectMeta}>
                    {new Date(project.createdAt).toLocaleDateString("fr-FR")} ·{" "}
                    {project.location ? "Localisé" : "Sans localisation"}
                  </Text>
                </View>
                {project.hasPendingWrites ? (
                  <View style={styles.syncBadge}>
                    <Text style={styles.syncBadgeText}>À synchroniser</Text>
                  </View>
                ) : (
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7fb",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eef1f6",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 4,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#e5edff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 4,
  },
  fieldGroup: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  inputWrapper: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#111827",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  locationBadgeSuccess: {
    backgroundColor: "#ecfdf3",
    borderColor: "#16a34a",
  },
  locationBadgeWarning: {
    backgroundColor: "#fff7ed",
    borderColor: "#f97316",
  },
  locationBadgeLoading: {
    backgroundColor: "#eef2ff",
    borderColor: "#4338ca",
  },
  locationBadgeText: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
  },
  locationDetails: {
    color: "#6b7280",
    fontSize: 12,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: "#0f172a",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.35,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 4,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
  },
  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eef1f6",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  projectInfo: {
    flex: 1,
    marginRight: 10,
  },
  projectName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  projectMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  syncBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#f97316",
  },
  syncBadgeText: {
    fontSize: 11,
    color: "#c2410c",
    fontWeight: "700",
  },
  emptyState: {
    color: "#6b7280",
    fontSize: 13,
    paddingVertical: 8,
  },
});
