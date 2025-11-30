import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

import { Project } from "@/types/project";
import { styles } from "./sharedStyles";

export const ProjectItem = ({ project }: { project: Project }) => (
  <Pressable
    style={({ pressed }) => [
      styles.projectRow,
      pressed && { opacity: 0.9 },
    ]}
    onPress={() =>
      router.push({
        pathname: "/project/[id]",
        params: { id: project.id },
      })
    }
  >
    <View style={styles.projectInfo}>
      <Text style={styles.projectName}>{project.name}</Text>
      <Text style={styles.projectMeta}>
        Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")} ·{" "}
        {project.photoCount} {project.photoCount > 1 ? "photos" : "photo"} ·{" "}
        {project.location ? "Localisé" : "Sans localisation"}
      </Text>
    </View>
    {project.hasPendingWrites ? (
      <View style={styles.syncBadge}>
        <Text style={styles.syncBadgeText}>À synchroniser</Text>
      </View>
    ) : (
      <Ionicons name="chevron-forward" size={20} color="#0f172a" />
    )}
  </Pressable>
);
