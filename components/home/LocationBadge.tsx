import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { LocationStatus } from "./locationTypes";
import { styles } from "./sharedStyles";

type Props = {
  status: LocationStatus;
};

export const LocationBadge = ({ status }: Props) => {
  const baseStyle = [styles.locationBadge];

  if (status === "granted" || status === "manual") baseStyle.push(styles.locationBadgeSuccess);
  else if (status === "loading") baseStyle.push(styles.locationBadgeLoading);
  else if (status === "denied" || status === "unavailable") baseStyle.push(styles.locationBadgeWarning);

  let label = "Localisation inactive";
  if (status === "loading") label = "Localisation...";
  if (status === "granted") label = "Localisation OK";
  if (status === "manual") label = "Localisation saisie";
  if (status === "denied") label = "Permission manquante";
  if (status === "unavailable") label = "GPS indisponible";

  return (
    <View style={styles.locationRow}>
      <View style={styles.locationLabel}>
        <Ionicons name="location-outline" size={18} color="#0f172a" style={{ marginRight: 8 }} />
        <Text style={styles.label}>Localisation</Text>
      </View>
      <View style={baseStyle}>
        {status === "loading" ? (
          <ActivityIndicator size="small" color="#0f172a" />
        ) : (
          <Text style={styles.locationBadgeText}>{label}</Text>
        )}
      </View>
    </View>
  );
};
