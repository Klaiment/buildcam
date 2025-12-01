import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { styles } from "./sharedStyles";

type Props = {
  fromCache: boolean;
  hasPendingWrites: boolean;
  syncing: boolean;
  onSync: () => void;
  userLabel: string;
};

export const SyncBar = ({
  fromCache,
  hasPendingWrites,
  syncing,
  onSync,
  userLabel,
}: Props) => (
  <View style={styles.syncRow}>
    <View style={styles.syncStatus}>
      <View
        style={[
          styles.syncDot,
          fromCache ? styles.syncDotOffline : styles.syncDotOnline,
        ]}
      />
      <Text style={styles.syncText}>
        {fromCache ? "Mode hors ligne (cache)" : "Connecté"}
        {hasPendingWrites ? " · en attente de synchro" : ""}
      </Text>
    </View>
    <View style={styles.userPill}>
      <Ionicons
        name="person-circle-outline"
        size={18}
        color="#0f172a"
        style={{ marginRight: 6 }}
      />
      <Text style={styles.userPillText}>{userLabel}</Text>
    </View>
    <Pressable style={styles.syncButton} onPress={onSync} disabled={syncing}>
      {syncing ? (
        <ActivityIndicator size="small" color="#0f172a" />
      ) : (
        <Ionicons name="cloud-upload-outline" size={18} color="#0f172a" />
      )}
      <Text style={styles.syncButtonText}>
        {syncing ? "Synchro..." : "Synchroniser"}
      </Text>
    </Pressable>
  </View>
);
