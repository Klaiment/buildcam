import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { Project } from "@/types/project";
import { ProjectItem } from "./ProjectItem";
import { styles } from "./sharedStyles";

type Props = {
  projects: Project[];
  loading: boolean;
};

export const ProjectsList = ({ projects, loading }: Props) => (
  <View style={styles.listCard}>
    <View style={styles.listHeader}>
      <Text style={styles.listTitle}>Vos chantiers</Text>
      {loading && <ActivityIndicator size="small" color="#0f172a" />}
    </View>

    {!loading && projects.length === 0 ? (
      <Text style={styles.emptyState}>
        Aucun chantier pour le moment. Créez-en un pour commencer.
      </Text>
    ) : (
      projects.map((project) => <ProjectItem key={project.id} project={project} />)
    )}
  </View>
);
