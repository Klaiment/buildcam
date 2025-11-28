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
import { router, useLocalSearchParams } from "expo-router";

import { listenToProject, updateProject } from "@/services/projects";
import { Project, ProjectLocation } from "@/types/project";

export default function ProjectEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nameInput, setNameInput] = React.useState("");
  const [latInput, setLatInput] = React.useState("");
  const [lngInput, setLngInput] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    const unsub = listenToProject(
      id,
      (data) => {
        setProject(data);
        if (data) {
          setNameInput(data.name || "");
          setLatInput(
            data.location?.latitude ? data.location.latitude.toString() : ""
          );
          setLngInput(
            data.location?.longitude ? data.location.longitude.toString() : ""
          );
        }
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

  const handleSave = async () => {
    if (!project || !id) return;
    const normalizedName = nameInput.trim();
    if (!normalizedName) {
      Alert.alert("Nom requis", "Merci de renseigner le nom du chantier.");
      return;
    }

    let location: ProjectLocation | null | undefined = project.location || null;
    const hasLat = latInput.trim().length > 0;
    const hasLng = lngInput.trim().length > 0;

    if ((hasLat && !hasLng) || (!hasLat && hasLng)) {
      Alert.alert(
        "Coordonnées incomplètes",
        "Renseigne latitude et longitude ou laisse les deux vides."
      );
      return;
    }

    if (hasLat && hasLng) {
      const lat = parseFloat(latInput.replace(",", "."));
      const lng = parseFloat(lngInput.replace(",", "."));
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        Alert.alert("Coordonnées invalides", "Merci de saisir des nombres valides.");
        return;
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        Alert.alert(
          "Coordonnées hors limites",
          "Latitude entre -90/90 et longitude entre -180/180."
        );
        return;
      }
      location = {
        latitude: lat,
        longitude: lng,
        timestamp: Date.now(),
      };
    } else if (!hasLat && !hasLng) {
      location = null;
    }

    try {
      setSaving(true);
      await updateProject(id, {
        name: normalizedName,
        location,
      });
      Alert.alert("Chantier mis à jour", "Les modifications seront synchronisées.");
      goBack();
    } catch (e: any) {
      Alert.alert(
        "Sauvegarde impossible",
        e?.message || "Impossible de sauvegarder le chantier."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.helper}>Chargement du chantier...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !project) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error || "Chantier introuvable."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#0f172a" />
          </Pressable>
          <Text style={styles.title}>Modifier le chantier</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nom du chantier</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Nom du chantier"
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Localisation</Text>
          <Text style={styles.helperSmall}>
            Laisse vide si tu veux retirer la localisation.
          </Text>
          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Latitude</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={latInput}
                  onChangeText={setLatInput}
                  placeholder="48.8566"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Longitude</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={lngInput}
                  onChangeText={setLngInput}
                  placeholder="2.3522"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.saveButton, (!nameInput.trim() || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!nameInput.trim() || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons
              name="save-outline"
              size={18}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={styles.saveButtonText}>
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </Text>
        </Pressable>
      </ScrollView>
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
  errorText: {
    color: "#dc2626",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#f1f2f6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eef1f6",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  helperSmall: {
    color: "#6b7280",
    fontSize: 12,
  },
  inputsRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  inputLabel: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 6,
  },
  inputWrapper: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
