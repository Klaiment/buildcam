import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { Project } from "@/types/project";
import { styles } from "./styles";

type Props = {
  project: Project;
};

export const StatsRow = ({ project }: Props) => (
  <View style={styles.statsRow}>
    <View style={styles.statCard}>
      <Ionicons name="images-outline" size={18} color="#0f172a" />
      <View>
        <Text style={styles.statLabel}>Photos</Text>
        <Text style={styles.statValue}>
          {project.photoCount} {project.photoCount > 1 ? "photos" : "photo"}
        </Text>
      </View>
    </View>
    <View style={styles.statCard}>
      <Ionicons name="location-outline" size={18} color="#0f172a" />
      <View>
        <Text style={styles.statLabel}>Localisation</Text>
        <Text style={styles.statValue}>
          {project.location ? "Disponible" : "Non renseignée"}
        </Text>
      </View>
    </View>
    <View style={styles.statCard}>
      <Ionicons name="cloud-done-outline" size={18} color="#0f172a" />
      <View>
        <Text style={styles.statLabel}>Synchro</Text>
        <Text style={styles.statValue}>
          {project.hasPendingWrites ? "En attente" : "À jour"}
        </Text>
      </View>
    </View>
  </View>
);
