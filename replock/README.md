# REPLOCK

Lock social media apps behind physical exercise. Complete reps with correct form (verified via camera + pose detection) to earn timed access to selected apps.

## Tech Stack

- **Framework**: React Native with Expo (SDK 54)
- **Navigation**: Expo Router (file-based routing)
- **Pose Detection**: @tensorflow-models/pose-detection with MoveNet SinglePose Lightning
- **Storage**: AsyncStorage for stats/settings, SecureStore for tokens
- **Language**: TypeScript throughout
- **State**: React Context + useReducer

## Getting Started

```bash
cd replock
npm install
npx expo start
```

## Project Structure

```
replock/
├── app/                    # Screens (Expo Router file-based routing)
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Redirect to /home
│   ├── camera.tsx          # Camera + exercise detection (modal)
│   └── (tabs)/             # Tab navigation
│       ├── home.tsx        # Dashboard
│       ├── exercise.tsx    # Exercise selection
│       ├── stats.tsx       # Stats & streaks
│       └── settings.tsx    # Settings
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── engine/                 # Exercise analysis engine
│   ├── angleCalculator.ts  # Joint angle math
│   ├── poseDetector.ts     # TF.js model loader
│   ├── antiCheat.ts        # Liveness checks
│   └── exercises/          # Per-exercise state machines
├── context/                # React Context providers
├── services/               # App locking, notifications, stats persistence
├── constants/              # Theme, exercise definitions, app configs
└── types/                  # TypeScript type definitions
```

## How It Works

1. User selects a locked app from the dashboard
2. Chooses an exercise (push-ups, squats, lunges, jumping jacks, plank)
3. Camera opens with pose detection overlay
4. Exercise engine validates form via joint angle analysis
5. Rep counter tracks completed reps using state machine
6. On completion, app is "unlocked" for a timed period

## MVP Limitations

1. **App locking is soft-lock only** — iOS Screen Time / Android Device Policy Manager native modules require full native builds. MVP uses honor system with blocking UI.
2. **TF.js on React Native** — Pose detection may need web view canvas in Expo Go; production builds should use bare workflow with expo-gl.
3. **Frame processing** — Uses setInterval with camera snapshots (150ms interval) rather than native frame processors.
4. **Demo mode** — Camera screen includes demo keypoint generation for UI testing without TF.js model loaded.
