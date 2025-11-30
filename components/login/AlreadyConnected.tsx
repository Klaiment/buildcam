import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./styles";

type Props = {
  email?: string | null;
  onBack: () => void;
  onGoProjects: () => void;
};

export const AlreadyConnected = ({ email, onBack, onGoProjects }: Props) => (
  <SafeAreaView style={styles.safeArea} edges={["top"]}>
    <View style={[styles.card, { margin: 20, alignSelf: "stretch" }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>Déjà connecté</Text>
      </View>
      <Text style={styles.helperText}>
        Connecté en tant que {email || "utilisateur"}. Tu peux retourner à tes chantiers.
      </Text>
      <Pressable
        style={[styles.primaryButton, { marginTop: 20 }]}
        onPress={onGoProjects}
      >
        <Text style={styles.primaryButtonText}>Aller aux chantiers</Text>
      </Pressable>
    </View>
  </SafeAreaView>
);
