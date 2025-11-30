import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

import { Project } from "@/types/project";
import { styles } from "./sharedStyles";

export const ProjectItem = ({ project }: { project: Project }) => {
  const syncBadge =
    project.hasPendingWrites && project.fromCache
      ? { label: "Local", style: styles.badgeYellow, icon: "cloud-offline" }
      : project.hasPendingWrites
      ? { label: "En attente", style: styles.badgeYellow, icon: "time-outline" }
      : { label: "Sync", style: styles.badgeGreen, icon: "checkmark-circle-outline" };

  return (
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
          Mis à jour le {new Date(project.updatedAt).toLocaleDateString("fr-FR")} ·{" "}
          {project.photoCount} {project.photoCount > 1 ? "photos" : "photo"}
        </Text>
        <View style={styles.projectBadges}>
          <View style={[styles.badge, syncBadge.style]}>
            <Ionicons name={syncBadge.icon as any} size={14} color="#0f172a" />
            <Text style={styles.badgeText}>{syncBadge.label}</Text>
          </View>
          <View
            style={[
              styles.badge,
              project.location ? styles.badgeBlue : styles.badgeRed,
            ]}
          >
            <Ionicons
              name={project.location ? "location" : "location-off"}
              size={14}
              color="#0f172a"
            />
            <Text style={styles.badgeText}>
              {project.location ? "Localisé" : "Sans localisation"}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#0f172a" />
    </Pressable>
  );
};
