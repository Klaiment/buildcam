import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getQueueSnapshot, processQueue } from "@/services/uploadQueue";
import { styles as homeStyles } from "@/components/home/sharedStyles";

type QueueItem = {
  id: string;
  projectId: string;
  uri: string;
  storagePath: string;
  attempts: number;
};

export default function SyncQueueScreen() {
  const [items, setItems] = React.useState<QueueItem[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadQueue = React.useCallback(async () => {
    setLoading(true);
    const data = await getQueueSnapshot();
    setItems(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  React.useEffect(() => {
    processQueue();
  }, []);

  return (
    <SafeAreaView style={homeStyles.safeArea}>
      <ScrollView contentContainerStyle={homeStyles.scrollContent}>
        <View style={homeStyles.card}>
          <Text style={homeStyles.title}>Synchronisation en attente</Text>
          <Text style={homeStyles.helperText}>
            Liste des éléments prêts à être envoyés dès que le réseau est disponible.
          </Text>
        </View>
        <View style={homeStyles.listCard}>
          <View style={homeStyles.listHeader}>
            <Text style={homeStyles.listTitle}>File d'attente</Text>
            {loading && <ActivityIndicator size="small" color="#0f172a" />}
          </View>
          {!loading && (items?.length ?? 0) === 0 ? (
            <Text style={homeStyles.emptyState}>Aucun élément à synchroniser.</Text>
          ) : (
            items?.map((item) => (
              <View key={item.id} style={homeStyles.projectRow}>
                <View style={homeStyles.projectInfo}>
                  <Text style={homeStyles.projectName}>{item.storagePath}</Text>
                  <Text style={homeStyles.projectMeta}>
                    Tentatives: {item.attempts} · Projet: {item.projectId}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
