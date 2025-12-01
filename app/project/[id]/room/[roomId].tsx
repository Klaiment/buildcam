import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, router } from "expo-router";

import { listenToTasks, createTask } from "@/services/tasks";
import { listenToFloorPlans, uploadFloorPlan } from "@/services/floorplans";
import { Task } from "@/types/task";
import { FloorPlan } from "@/types/floorplan";
import { styles } from "@/components/project/styles";

export default function RoomDetailScreen() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [plans, setPlans] = React.useState<FloorPlan[]>([]);
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [planName, setPlanName] = React.useState("");
  const [planNote, setPlanNote] = React.useState("");

  React.useEffect(() => {
    if (!id || !roomId) return;
    const unsub = listenToTasks(
      id,
      roomId,
      (list) => setTasks(list),
      () => {}
    );
    const unsubPlans = listenToFloorPlans(
      id,
      roomId,
      (list) => setPlans(list),
      () => {}
    );
    return () => {
      unsub();
      unsubPlans();
    };
  }, [id, roomId]);

  if (!id || !roomId) return null;

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert("Titre requis", "Ajoute un titre de tâche.");
      return;
    }
    try {
      setCreating(true);
      await createTask({
        projectId: id,
        roomId,
        title: title.trim(),
        description: desc.trim() || null,
      });
      setTitle("");
      setDesc("");
    } catch (err: any) {
      Alert.alert("Impossible de créer la tâche", err?.message || "Réessaie plus tard.");
    } finally {
      setCreating(false);
    }
  };

  const handleUploadPlan = async () => {
    const name = planName.trim();
    if (!name) {
      Alert.alert("Nom requis", "Ajoute un nom de plan.");
      return;
    }
    try {
      setUploading(true);
      const res = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"] });
      if (res.canceled || !res.assets?.[0]?.uri) {
        return;
      }
      await uploadFloorPlan({
        projectId: id,
        roomId,
        name,
        note: planNote.trim() || null,
        uri: res.assets[0].uri,
      });
      setPlanName("");
      setPlanNote("");
    } catch (err: any) {
      Alert.alert("Upload impossible", err?.message || "Réessaie plus tard.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color="#0f172a" />
            </Pressable>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.sectionTitle}>Pièce</Text>
              <Text style={styles.sectionText}>
                Ajoute des tâches et plans pour organiser cette pièce.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nouvelle tâche</Text>
          <View style={{ gap: 8 }}>
            <View style={styles.inputWrapper}>
              <Ionicons name="checkbox-outline" size={20} color="#9ca3af" />
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Titre de la tâche"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
              <TextInput
                value={desc}
                onChangeText={setDesc}
                placeholder="Description"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
            <Pressable
              style={[styles.primaryButton, creating && styles.primaryButtonDisabled]}
              disabled={creating}
              onPress={handleCreateTask}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Ajouter la tâche</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Tâches</Text>
          </View>
          {tasks.length === 0 ? (
            <Text style={styles.emptyState}>Aucune tâche pour le moment.</Text>
          ) : (
            tasks.map((task) => (
              <View key={task.id} style={styles.projectRow}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{task.title}</Text>
                  <Text style={styles.projectMeta}>{task.description || "Aucune description"}</Text>
                </View>
                <View style={styles.rowBadge}>
                  <Text style={styles.rowBadgeText}>{task.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ajouter un plan</Text>
          <View style={{ gap: 8 }}>
            <View style={styles.inputWrapper}>
              <Ionicons name="document-outline" size={20} color="#9ca3af" />
              <TextInput
                value={planName}
                onChangeText={setPlanName}
                placeholder="Nom du plan"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="create-outline" size={20} color="#9ca3af" />
              <TextInput
                value={planNote}
                onChangeText={setPlanNote}
                placeholder="Note (optionnelle)"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
            <Pressable
              style={[styles.primaryButton, uploading && styles.primaryButtonDisabled]}
              disabled={uploading}
              onPress={handleUploadPlan}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Uploader un plan</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Plans de la pièce</Text>
          </View>
          {plans.length === 0 ? (
            <Text style={styles.emptyState}>Aucun plan pour le moment.</Text>
          ) : (
            plans.map((plan) => (
              <Pressable
                key={plan.id}
                style={styles.projectRow}
                onPress={() => {
                  if (plan.url) {
                    router.push({
                      pathname: "/project/[id]/photo/[photoId]",
                      params: { id, photoId: plan.id },
                    });
                  }
                }}
              >
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{plan.name}</Text>
                  <Text style={styles.projectMeta}>{plan.note || "Sans note"}</Text>
                </View>
                <Ionicons name="download-outline" size={18} color="#0f172a" />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
