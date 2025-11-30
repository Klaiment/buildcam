import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { ProjectPhoto } from "@/types/photo";
import { styles } from "./styles";

type Props = {
  projectId: string;
  photos: ProjectPhoto[];
  getStatus: (styles: any, photo: ProjectPhoto) => any;
  onSeeAll: () => void;
  onAdd: () => void;
  uploading: boolean;
  renderSyncBadge: React.ReactNode;
};

export const PhotosSection = ({
  projectId,
  photos,
  getStatus,
  onSeeAll,
  onAdd,
  uploading,
  renderSyncBadge,
}: Props) => (
  <View style={styles.card}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionTitle}>Photos</Text>
        {photos.length > 0 && (
          <Pressable onPress={onSeeAll} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={14} color="#0f172a" />
          </Pressable>
        )}
      </View>
      <View style={styles.sectionActions}>
        {renderSyncBadge}
        <Pressable
          style={[styles.addPhotoButton, uploading && styles.addPhotoButtonDisabled]}
          disabled={uploading}
          onPress={onAdd}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#0f172a" />
          ) : (
            <>
              <Ionicons name="add" size={18} color="#0f172a" style={{ marginRight: 6 }} />
              <Text style={styles.addPhotoText}>Ajouter</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
    {photos.length === 0 ? (
      <View style={styles.photoPlaceholder}>
        <Ionicons name="image-outline" size={28} color="#94a3b8" />
        <Text style={styles.placeholderText}>Aucune photo pour le moment.</Text>
        <Text style={styles.placeholderSub}>
          Ajoute une photo du chantier pour suivre son évolution.
        </Text>
      </View>
    ) : (
      <View style={styles.photoGrid}>
        {photos.map((photo) => {
          const status = getStatus(styles, photo);
          return (
            <Pressable
              key={photo.id}
              style={styles.photoItem}
              onPress={() =>
                router.push({
                  pathname: "/project/[id]/photo/[photoId]",
                  params: { id: projectId, photoId: photo.id },
                })
              }
            >
              {photo.url ? (
                <Image source={{ uri: photo.url }} style={styles.photo} contentFit="cover" transition={200} />
              ) : (
                <View style={styles.photoPlaceholderThumb}>
                  <Ionicons name="cloud-offline" size={22} color="#9ca3af" />
                </View>
              )}
              <View style={styles.photoFooter}>
                <Text style={styles.photoDate}>
                  {new Date(photo.createdAt).toLocaleDateString("fr-FR")}
                </Text>
                <View style={[styles.statusPill, status.pillStyle]}>
                  {status.icon ? (
                    <Ionicons
                      name={status.icon as any}
                      size={14}
                      color={status.iconColor || status.textStyle?.color || "#0f172a"}
                    />
                  ) : null}
                  <Text style={[styles.statusText, status.textStyle]}>{status.label}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    )}
  </View>
);
