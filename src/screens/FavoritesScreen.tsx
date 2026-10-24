import React, { useCallback } from 'react';
import {
  FlatList,
  LayoutAnimation,
  type ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { PressableScale } from '../components/PressableScale';
import { useToast } from '../components/Toast';
import { colors, fonts, hitSlop, radii, spacing } from '../constants/theme';
import { useFavorites } from '../context/FavoritesContext';
import { useShareQuote } from '../hooks/useShareQuote';
import type { RootStackScreenProps } from '../navigation/types';
import type { FavoriteQuote } from '../types/quote';
import { formatShortDate } from '../utils/date';

export function FavoritesScreen({
  navigation,
}: RootStackScreenProps<'Favorites'>) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const shareQuote = useShareQuote();
  const { favorites, isLoaded, removeFavorite, restoreFavorite } =
    useFavorites();

  const handleDelete = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const removed = removeFavorite(id);
      if (removed) {
        toast.show({
          message: 'Quote removed',
          actionLabel: 'UNDO',
          durationMs: 4000,
          onAction: () => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            restoreFavorite(removed);
          },
        });
      }
    },
    [removeFavorite, restoreFavorite, toast],
  );

  const renderItem: ListRenderItem<FavoriteQuote> = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardMark}>{'“'}</Text>
      <Text style={styles.cardText}>{item.text}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.cardMeta}>
          <Text style={styles.cardAuthor} numberOfLines={1}>
            {item.author}
          </Text>
          <Text style={styles.cardDate}>
            Saved {formatShortDate(item.savedAt)}
          </Text>
        </View>
        <PressableScale
          onPress={() => shareQuote(item)}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel={`Share quote by ${item.author}`}
          style={styles.cardAction}
        >
          <Icon name="share" size={18} color={colors.textMuted} />
        </PressableScale>
        <PressableScale
          onPress={() => handleDelete(item.id)}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel={`Remove quote by ${item.author}`}
          style={styles.cardAction}
        >
          <Icon name="trash" size={18} color={colors.danger} />
        </PressableScale>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          icon="chevronLeft"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        />
        <View style={styles.headerText}>
          <Text style={styles.title} accessibilityRole="header">
            Collection
          </Text>
          <Text style={styles.subtitle}>
            {favorites.length === 1
              ? '1 saved quote'
              : `${favorites.length} saved quotes`}
          </Text>
        </View>
      </View>

      {isLoaded && favorites.length === 0 ? (
        <EmptyState onBrowse={() => navigation.goBack()} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing.xxxl },
          ]}
          ItemSeparatorComponent={Separator}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name="heart" size={30} color={colors.accent} />
      </View>
      <Text style={styles.emptyTitle}>Nothing saved yet</Text>
      <Text style={styles.emptyBody}>
        Tap the heart on any quote and it will live here, ready to revisit or
        share.
      </Text>
      <PressableScale
        onPress={onBrowse}
        accessibilityRole="button"
        style={styles.emptyButton}
      >
        <Text style={styles.emptyButtonText}>Find a quote</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerText: {
    marginLeft: spacing.lg,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
  card: {
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  cardMark: {
    fontFamily: fonts.serif,
    fontSize: 48,
    lineHeight: 48,
    height: 30,
    color: colors.accent,
  },
  cardText: {
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  cardMeta: {
    flex: 1,
  },
  cardAuthor: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  cardDate: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textFaint,
  },
  cardAction: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.xxxl * 2,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.text,
  },
  emptyBody: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  emptyButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  emptyButtonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
});
