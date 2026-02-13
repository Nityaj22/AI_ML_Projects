import { LockedApp } from '../types';

export const LOCKABLE_APPS: LockedApp[] = [
  { id: 'instagram', name: 'Instagram', bundleId: 'com.burbn.instagram', packageName: 'com.instagram.android', emoji: '📸', isLocked: false },
  { id: 'twitter', name: 'X / Twitter', bundleId: 'com.atebits.Tweetie2', packageName: 'com.twitter.android', emoji: '🐦', isLocked: false },
  { id: 'tiktok', name: 'TikTok', bundleId: 'com.zhiliaoapp.musically', packageName: 'com.zhiliaoapp.musically', emoji: '🎵', isLocked: false },
  { id: 'reddit', name: 'Reddit', bundleId: 'com.reddit.Reddit', packageName: 'com.reddit.frontpage', emoji: '🤖', isLocked: false },
  { id: 'youtube', name: 'YouTube', bundleId: 'com.google.ios.youtube', packageName: 'com.google.android.youtube', emoji: '▶️', isLocked: false },
  { id: 'snapchat', name: 'Snapchat', bundleId: 'com.toyopagroup.picaboo', packageName: 'com.snapchat.android', emoji: '👻', isLocked: false },
];
