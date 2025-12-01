import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

import { listenToRooms, createRoom } from "@/services/rooms";
import { listenToTasks } from "@/services/tasks";
import { Room } from "@/types/room";
import { Task } from "@/types/task";
import { styles } from "@/components/project/styles";

export default function RoomsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [tasksPerRoom, setTasksPerRoom] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (!id) return;
    const unsub = listenToRooms(
      id,
      (list) => {
        setRooms(list);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [id]);

  React.useEffect(() => {
    if (!id) return;
    const unsubscribers: (() => void)[] = [];
    rooms.forEach((room) => {
      const unsub = listenToTasks(
        id,
        room.id,
        (tasks) => {
          setTasksPerRoom((prev) => ({ ...prev, [room.id]: tasks.length }));
        },
        () => {}
      );
      unsubscribers.push(unsub);
    });
    return () => unsubscribers.forEach((u) => u());
  }, [id, rooms]);

  const handleCreate = async () => {
    if (!id) return;
    const n = name.trim();
    if (!n) {
      Alert.alert("Nom requis", "Ajoute un nom de pièce.");
      return;
    }
    try {
      setCreating(true);
      await createRoom({
        projectId: id,
        name: n,
        description: desc.trim() || null,
      });
      setName("");
      setDesc("");
    } catch (err: any) {
      Alert.alert("Impossible de créer la pièce", err?.message || "Réessaie plus tard.");
    } finally {
      setCreating(false);
    }
  };

  if (!id) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color="#0f172a" />
            </Pressable>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.sectionTitle}>Pièces & tâches</Text>
              <Text style={styles.sectionText}>
                Organise le chantier par pièces, ajoute tâches et plans. Synchro auto au retour réseau.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nouvelle pièce</Text>
          <View style={{ gap: 8 }}>
            <View style={styles.inputWrapper}>
              <Ionicons name="home-outline" size={20} color="#9ca3af" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nom (ex: Salon)"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
              <TextInput
                value={desc}
                onChangeText={setDesc}
                placeholder="Description (optionnel)"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
            <Pressable
              style={[
                styles.primaryButton,
                { flexDirection: "row", gap: 8, justifyContent: "center" },
                creating && styles.primaryButtonDisabled,
              ]}
              disabled={creating}
              onPress={handleCreate}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>Ajouter la pièce</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Pièces du chantier</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#0f172a" />
          ) : rooms.length === 0 ? (
            <Text style={styles.emptyState}>Aucune pièce pour le moment.</Text>
          ) : (
            rooms.map((room) => {
              const taskCount = tasksPerRoom[room.id] ?? 0;
              const sync =
                room.hasPendingWrites && room.fromCache
                  ? { label: "Local", style: styles.badgeYellow, icon: "cloud-offline" }
                  : room.hasPendingWrites
                  ? { label: "En attente", style: styles.badgeYellow, icon: "time-outline" }
                  : { label: "Sync", style: styles.badgeGreen, icon: "checkmark-circle-outline" };
              return (
                <Pressable
                  key={room.id}
                  style={[
                    styles.projectRow,
                    { backgroundColor: "#ffffff", borderColor: "#e5e7eb" },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/project/[id]/room/[roomId]",
                      params: { id, roomId: room.id },
                    })
                  }
                >
                  <View style={styles.projectInfo}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="home-outline" size={16} color="#0f172a" />
                      <Text style={styles.projectName}>{room.name}</Text>
                    </View>
                    <Text style={styles.projectMeta}>
                      {room.description || "Aucune description"} ·{" "}
                      {taskCount} {taskCount > 1 ? "tâches" : "tâche"}
                    </Text>
                    <View style={styles.projectBadges}>
                      <View style={[styles.badge, sync.style]}>
                        <Ionicons name={sync.icon as any} size={14} color="#0f172a" />
                        <Text style={styles.badgeText}>{sync.label}</Text>
                      </View>
                      <View style={[styles.badge, styles.badgeBlue]}>
                        <Ionicons name="checkbox-outline" size={14} color="#0f172a" />
                        <Text style={styles.badgeText}>{taskCount} tâche(s)</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#0f172a" />
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
