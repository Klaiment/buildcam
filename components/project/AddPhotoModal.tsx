import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from "react-native";

import { styles } from "./styles";

type Props = {
  visible: boolean;
  noteDraft: string;
  onChangeNote: (v: string) => void;
  onClose: () => void;
  onPickLibrary: () => void;
  onPickCamera: () => void;
  uploading: boolean;
};

export const AddPhotoModal = ({
  visible,
  noteDraft,
  onChangeNote,
  onClose,
  onPickLibrary,
  onPickCamera,
  uploading,
}: Props) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Ajouter une photo</Text>
          <Pressable onPress={onClose} style={styles.modalClose}>
            <Ionicons name="close" size={20} color="#0f172a" />
          </Pressable>
        </View>
        <Text style={styles.modalLabel}>Note (optionnel)</Text>
        <TextInput
          value={noteDraft}
          onChangeText={onChangeNote}
          placeholder="Ex: façade nord, fissure à surveiller"
          placeholderTextColor="#9ca3af"
          style={styles.modalInput}
          multiline
        />
        <Text style={styles.modalHint}>
          La note sera attachée uniquement à cette photo et visible en plein écran.
        </Text>
        <View style={styles.modalActions}>
          <Pressable
            style={[styles.modalButton, styles.modalSecondary]}
            onPress={onClose}
          >
            <Text style={styles.modalSecondaryText}>Annuler</Text>
          </Pressable>
          <Pressable
            style={[styles.modalButton, styles.modalPrimary]}
            disabled={uploading}
            onPress={onPickLibrary}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#0f172a" />
            ) : (
              <>
                <Ionicons name="image-outline" size={16} color="#0f172a" />
                <Text style={styles.modalPrimaryText}>Depuis la galerie</Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={[styles.modalButton, styles.modalPrimary]}
            disabled={uploading}
            onPress={onPickCamera}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#0f172a" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={16} color="#0f172a" />
                <Text style={styles.modalPrimaryText}>Prendre une photo</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);
