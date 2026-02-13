import { Platform, Linking } from 'react-native';

/**
 * iOS: Uses Screen Time / Family Controls API (requires native module)
 * Android: Uses UsageStatsManager (requires native module)
 *
 * For the MVP, this service provides the interface and scaffolding.
 * The actual native locking is handled by a custom Expo module (Phase 2).
 * For now, implement as "soft lock" — tracks lock state in AsyncStorage
 * and shows a blocking modal when user tries to open a locked app.
 */

export async function lockApp(bundleId: string): Promise<void> {
  // TODO: Call native module NativeScreenTime.lockApp(bundleId)
  console.log(`[LockService] Locking ${bundleId}`);
}

export async function unlockApp(bundleId: string, durationMs: number): Promise<void> {
  // TODO: Call native module NativeScreenTime.unlockApp(bundleId, durationMs)
  console.log(`[LockService] Unlocking ${bundleId} for ${durationMs}ms`);
}

export function openApp(bundleId: string, packageName: string): void {
  const url = Platform.OS === 'ios' ? `${bundleId}://` : `market://details?id=${packageName}`;
  Linking.openURL(url).catch(() => {
    console.log('Could not open app');
  });
}
