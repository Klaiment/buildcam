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
            <Text style={styles.sectionTitle}>Pièces</Text>
            <Pressable onPress={() => router.back()} style={styles.chip}>
              <Ionicons name="chevron-back" size={16} color="#0f172a" style={{ marginRight: 6 }} />
              <Text style={styles.chipText}>Retour</Text>
            </Pressable>
          </View>

          <View style={{ gap: 8 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nom de la pièce (ex: Salon)"
              placeholderTextColor="#9ca3af"
              style={styles.modalInput}
            />
            <TextInput
              value={desc}
              onChangeText={setDesc}
              placeholder="Description (optionnel)"
              placeholderTextColor="#9ca3af"
              style={styles.modalInput}
            />
            <Pressable
              style={[styles.primaryButton, creating && styles.primaryButtonDisabled]}
              disabled={creating}
              onPress={handleCreate}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Ajouter la pièce</Text>
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
            rooms.map((room) => (
              <Pressable
                key={room.id}
                style={styles.projectRow}
                onPress={() =>
                  router.push({
                    pathname: "/project/[id]/room/[roomId]",
                    params: { id, roomId: room.id },
                  })
                }
              >
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{room.name}</Text>
                  <Text style={styles.projectMeta}>
                    {room.description || "Aucune description"} ·{" "}
                    {(tasksPerRoom[room.id] ?? 0)}{" "}
                    {(tasksPerRoom[room.id] ?? 0) > 1 ? "tâches" : "tâche"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#0f172a" />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
