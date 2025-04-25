import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export const initNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

export const scheduleMorningQuote = async (quote) => {
  const hasScheduled = await AsyncStorage.getItem("hasScheduledQuote");

  if (hasScheduled) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Morning Zen",
      body: quote,
      sound: "default",
    },
    trigger: {
      hour: 7,
      minute: 0,
      repeats: true,
    },
  });

  await AsyncStorage.setItem("hasScheduledQuote", "true");
};
