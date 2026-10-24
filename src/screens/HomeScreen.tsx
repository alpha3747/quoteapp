import React, { useEffect } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionBar } from '../components/ActionBar';
import { AmbientBackground } from '../components/AmbientBackground';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { LoadingDots } from '../components/LoadingDots';
import { QuoteView } from '../components/QuoteView';
import { useToast } from '../components/Toast';
import { storageKeys } from '../constants/config';
import { colors, fonts, spacing } from '../constants/theme';
import { useFavorites } from '../context/FavoritesContext';
import { useDailyQuote } from '../hooks/useDailyQuote';
import { useDailyReminder } from '../hooks/useDailyReminder';
import { useShareQuote } from '../hooks/useShareQuote';
import type { RootStackScreenProps } from '../navigation/types';
import { readJson, writeJson } from '../services/storage';
import { dayOfYear, formatHeaderDate } from '../utils/date';

export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const shareQuote = useShareQuote();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const {
    status,
    quote,
    upcomingQuote,
    isOffline,
    isUpdating,
    isRefreshing,
    refresh,
    shuffle,
  } = useDailyQuote();
  const reminder = useDailyReminder(upcomingQuote);

  // One-time hint for new users.
  useEffect(() => {
    readJson<boolean>(storageKeys.hasSeenHint).then(seen => {
      if (!seen) {
        toast.show('Pull down anytime for a fresh batch of quotes');
        writeJson(storageKeys.hasSeenHint, true);
      }
    });
  }, [toast]);

  const saved = quote ? isFavorite(quote.id) : false;

  const handleToggleFavorite = () => {
    if (!quote) {
      return;
    }
    const added = toggleFavorite(quote);
    toast.show(added ? 'Saved to your collection' : 'Removed from saved');
  };

  const handleToggleReminder = async () => {
    const result = await reminder.toggle();
    const messages = {
      enabled: 'Daily quote reminder set for 7:00 AM',
      disabled: 'Daily reminder turned off',
      denied: 'Allow notifications in Settings to get daily quotes',
      error: 'Couldn’t update the reminder. Please try again.',
    } as const;
    toast.show(messages[result]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <AmbientBackground seed={dayOfYear()} />

      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.wordmark} accessibilityRole="header">
          Quotely
        </Text>
        <IconButton
          icon={reminder.enabled ? 'bell' : 'bellOff'}
          color={reminder.enabled ? colors.accent : colors.text}
          onPress={handleToggleReminder}
          accessibilityLabel={
            reminder.enabled
              ? 'Turn off daily reminder'
              : 'Turn on daily reminder'
          }
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.textMuted}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surfaceRaised}
          />
        }
      >
        <View style={styles.dateRow}>
          <Text style={styles.date}>{formatHeaderDate()}</Text>
          {isUpdating ? <LoadingDots size={5} /> : null}
          {isOffline && !isUpdating ? (
            <View style={styles.offlinePill}>
              <Icon name="wifiOff" size={12} color={colors.textMuted} />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          ) : null}
        </View>

        {status === 'loading' || !quote ? (
          <View style={styles.loader}>
            <LoadingDots label="Finding today’s quote" />
          </View>
        ) : (
          <QuoteView quote={quote} />
        )}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <ActionBar
          actions={[
            {
              key: 'save',
              icon: 'heart',
              label: saved ? 'Saved' : 'Save',
              active: saved,
              disabled: !quote,
              onPress: handleToggleFavorite,
            },
            {
              key: 'shuffle',
              icon: 'shuffle',
              label: 'Another',
              disabled: !quote,
              onPress: shuffle,
            },
            {
              key: 'share',
              icon: 'share',
              label: 'Share',
              disabled: !quote,
              onPress: () => quote && shareQuote(quote),
            },
            {
              key: 'favorites',
              icon: 'bookmark',
              label: 'Collection',
              badge: favorites.length,
              onPress: () => navigation.navigate('Favorites'),
            },
          ]}
        />
        <Text
          style={styles.credits}
          onPress={() => Linking.openURL('https://zenquotes.io')}
          accessibilityRole="link"
        >
          Quotes by ZenQuotes
        </Text>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.text,
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl + 4,
    paddingVertical: spacing.xxl,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  date: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  offlineText: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  loader: {
    paddingVertical: spacing.xxxl * 2,
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
  credits: {
    marginTop: spacing.md,
    alignSelf: 'center',
    fontSize: 11,
    color: colors.textFaint,
  },
});
