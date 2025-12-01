import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import * as Linking from "expo-linking";

import { styles } from "./styles";

type Props = {
  visible: boolean;
  startDate: string;
  endDate: string;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  onPresetAll: () => void;
  onGenerate: () => void;
  onClose: () => void;
  downloading: boolean;
  downloadUrl?: string | null;
  error?: string | null;
};

export const PdfExportModal = ({
  visible,
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  onPresetAll,
  onGenerate,
  onClose,
  downloading,
  downloadUrl,
  error,
}: Props) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Exporter en PDF</Text>
          <Pressable onPress={onClose} style={styles.modalClose}>
            <Ionicons name="close" size={20} color="#0f172a" />
          </Pressable>
        </View>

        <Text style={styles.modalLabel}>Période</Text>
        <View style={{ gap: 6 }}>
          <TextInput
            value={startDate}
            onChangeText={onChangeStart}
            placeholder="Début (YYYY-MM-DD) - optionnel"
            placeholderTextColor="#9ca3af"
            style={styles.modalInput}
          />
          <TextInput
            value={endDate}
            onChangeText={onChangeEnd}
            placeholder="Fin (YYYY-MM-DD) - optionnel"
            placeholderTextColor="#9ca3af"
            style={styles.modalInput}
          />
          <Pressable onPress={onPresetAll} style={[styles.modalButton, styles.modalSecondary]}>
            <Text style={styles.modalSecondaryText}>Tout le projet</Text>
          </Pressable>
        </View>

        <View style={styles.modalActions}>
          <Pressable
            style={[styles.modalButton, styles.modalPrimary]}
            onPress={onGenerate}
            disabled={downloading}
          >
            <Ionicons
              name={downloading ? "time-outline" : "download-outline"}
              size={16}
              color="#0f172a"
            />
            <Text style={styles.modalPrimaryText}>
              {downloading ? "Génération..." : "Générer le PDF"}
            </Text>
          </Pressable>
          {downloadUrl ? (
            <Pressable
              style={[styles.modalButton, styles.modalPrimary]}
              onPress={() => Linking.openURL(downloadUrl)}
            >
              <Ionicons name="link-outline" size={16} color="#0f172a" />
              <Text style={styles.modalPrimaryText}>Ouvrir le lien</Text>
            </Pressable>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>
    </View>
  </Modal>
);
