import * as Notifications from 'expo-notifications';

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleExpiryWarning(appName: string, expiresAt: number): Promise<void> {
  const warningTime = new Date(expiresAt - 5 * 60 * 1000);
  if (warningTime < new Date()) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${appName} locking soon`,
      body: '5 minutes left — do more reps to extend!',
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: warningTime },
  });
}

export async function scheduleDailyReminder(hour = 9): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to earn your scroll',
      body: 'Start your reps to unlock your apps for today.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour, minute: 0, repeats: true },
  });
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
