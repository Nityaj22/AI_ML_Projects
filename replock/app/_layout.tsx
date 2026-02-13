import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';
import { ExerciseSessionProvider } from '../context/ExerciseSessionContext';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <ExerciseSessionProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.black },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="camera"
            options={{
              presentation: 'fullScreenModal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </ExerciseSessionProvider>
    </AppProvider>
  );
}
