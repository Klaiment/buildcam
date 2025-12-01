import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { styles } from "./sharedStyles";

type Props = {
  manualLatitude: string;
  manualLongitude: string;
  onChangeLatitude: (v: string) => void;
  onChangeLongitude: (v: string) => void;
  onSubmitManualLocation: () => void;
};

export const ManualLocationFields = ({
  manualLatitude,
  manualLongitude,
  onChangeLatitude,
  onChangeLongitude,
  onSubmitManualLocation,
}: Props) => (
  <View style={styles.manualContainer}>
    <Text style={styles.manualHint}>
      Localisation indisponible ? Renseigne les coordonnées.
    </Text>
    <View style={styles.manualRow}>
      <View style={styles.inputWrapper}>
        <Ionicons name="navigate-outline" size={20} color="#9ca3af" />
        <TextInput
          value={manualLatitude}
          onChangeText={onChangeLatitude}
          placeholder="Latitude (ex: 48.8566)"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          keyboardType="decimal-pad"
        />
      </View>
    </View>
    <View style={styles.manualRow}>
      <View style={styles.inputWrapper}>
        <Ionicons name="compass-outline" size={20} color="#9ca3af" />
        <TextInput
          value={manualLongitude}
          onChangeText={onChangeLongitude}
          placeholder="Longitude (ex: 2.3522)"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          keyboardType="decimal-pad"
        />
      </View>
    </View>
    <Pressable
      style={styles.secondaryButton}
      onPress={onSubmitManualLocation}
    >
      <Ionicons
        name="checkmark-outline"
        size={18}
        color="#0f172a"
        style={{ marginRight: 8 }}
      />
      <Text style={styles.secondaryButtonText}>
        Valider la localisation
      </Text>
    </Pressable>
  </View>
);
