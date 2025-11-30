import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { ProjectLocation } from "@/types/project";
import { ManualLocationFields } from "./ManualLocationFields";
import { LocationBadge } from "./LocationBadge";
import { LocationStatus } from "./locationTypes";
import { styles } from "./sharedStyles";

type Props = {
  visible: boolean;
  onClose: () => void;
  projectName: string;
  onChangeName: (name: string) => void;
  location: ProjectLocation | null;
  locationStatus: LocationStatus;
  manualMode: boolean;
  manualLatitude: string;
  manualLongitude: string;
  onToggleManual: () => void;
  onChangeLatitude: (v: string) => void;
  onChangeLongitude: (v: string) => void;
  onFetchLocation: () => void;
  onSubmitManualLocation: () => void;
  onCreate: () => void;
  submitting: boolean;
  errorMessage: string | null;
};

export const CreateProjectModal = ({
  visible,
  onClose,
  projectName,
  onChangeName,
  location,
  locationStatus,
  manualMode,
  manualLatitude,
  manualLongitude,
  onToggleManual,
  onChangeLatitude,
  onChangeLongitude,
  onFetchLocation,
  onSubmitManualLocation,
  onCreate,
  submitting,
  errorMessage,
}: Props) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Créer un chantier</Text>
            <Text style={styles.modalSubtitle}>
              Renseigne le nom et la localisation avant de démarrer.
            </Text>
          </View>
          <Pressable style={styles.modalClose} onPress={onClose}>
            <Ionicons name="close" size={20} color="#0f172a" />
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nom du chantier *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="folder-outline" size={20} color="#9ca3af" />
            <TextInput
              value={projectName}
              onChangeText={onChangeName}
              placeholder="Ex: Maison rue Victor Hugo"
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <LocationBadge status={locationStatus} />
          {location && (
            <Text style={styles.locationDetails}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} (
              {location.accuracy ? `${location.accuracy.toFixed(0)}m` : "gps"})
            </Text>
          )}

          <Pressable
            style={styles.secondaryButton}
            onPress={onFetchLocation}
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

          <Pressable
            style={styles.secondaryButtonGhost}
            onPress={onToggleManual}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#0f172a"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.secondaryButtonText}>
              {manualMode ? "Fermer la saisie manuelle" : "Saisir manuellement"}
            </Text>
          </Pressable>

          {manualMode && (
            <ManualLocationFields
              manualLatitude={manualLatitude}
              manualLongitude={manualLongitude}
              onChangeLatitude={onChangeLatitude}
              onChangeLongitude={onChangeLongitude}
              onSubmitManualLocation={onSubmitManualLocation}
            />
          )}
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            (!projectName.trim() || submitting) && styles.primaryButtonDisabled,
          ]}
          disabled={!projectName.trim() || submitting}
          onPress={onCreate}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? "Enregistrement..." : "Créer le chantier"}
          </Text>
        </Pressable>
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>
    </View>
  </Modal>
);
