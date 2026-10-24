import notifee, {
  AlarmType,
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from 'react-native-notify-kit';

import { config } from '../constants/config';
import type { Quote } from '../types/quote';
import { nextOccurrence } from '../utils/date';

const CHANNEL_ID = 'daily-quote';
const NOTIFICATION_ID = 'daily-quote-reminder';

async function ensureChannel(): Promise<string> {
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Daily quote',
    description: 'A gentle morning reminder with a quote to start your day.',
    importance: AndroidImportance.DEFAULT,
  });
}

/** Asks for notification permission. Resolves to true when granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Schedules (or re-schedules) a repeating daily reminder at the configured
 * time. Using a fixed notification id means calling this again simply
 * replaces the previous one instead of stacking duplicates.
 */
export async function scheduleDailyReminder(quote?: Quote): Promise<void> {
  const channelId = await ensureChannel();
  const fireAt = nextOccurrence(config.reminder.hour, config.reminder.minute);

  await notifee.createTriggerNotification(
    {
      id: NOTIFICATION_ID,
      title: 'Your quote for today',
      body: quote
        ? `“${quote.text}” — ${quote.author}`
        : 'A fresh quote is waiting for you.',
      android: {
        channelId,
        pressAction: { id: 'default' },
      },
      ios: {
        sound: 'default',
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: fireAt.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
      // Inexact-but-doze-friendly alarm: no SCHEDULE_EXACT_ALARM permission needed.
      alarmManager: { type: AlarmType.SET_AND_ALLOW_WHILE_IDLE },
    },
  );
}

export async function cancelDailyReminder(): Promise<void> {
  await notifee.cancelTriggerNotification(NOTIFICATION_ID);
}
