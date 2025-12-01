import React from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Project } from "@/types/project";
import { ProjectItem } from "./ProjectItem";
import { styles } from "./sharedStyles";

type Props = {
  projects: Project[];
  loading: boolean;
};

export const ProjectsList = ({ projects, loading }: Props) => {
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, query]);

  return (
    <View style={styles.listCard}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Vos chantiers</Text>
        {loading && <ActivityIndicator size="small" color="#0f172a" />}
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color="#9ca3af" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un chantier..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      {!loading && filtered.length === 0 ? (
        <Text style={styles.emptyState}>
          Aucun chantier trouvé. Ajuste ta recherche ou crée-en un.
        </Text>
      ) : (
        filtered.map((project) => <ProjectItem key={project.id} project={project} />)
      )}
    </View>
  );
};
