import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { Project } from "@/types/project";
import { styles } from "./styles";

type Props = {
  project: Project;
  onBack: () => void;
};

export const ProjectHero = ({ project, onBack }: Props) => (
  <View style={styles.hero}>
    <Pressable onPress={onBack} style={styles.backButton}>
      <Ionicons name="chevron-back" size={22} color="#0f172a" />
    </Pressable>
    <View style={styles.heroTitles}>
      <Text style={styles.heroTitle}>{project.name}</Text>
      <Text style={styles.heroSubtitle}>
        Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")} · Mis à jour le{" "}
        {new Date(project.updatedAt).toLocaleDateString("fr-FR")}
      </Text>
    </View>
  </View>
);
