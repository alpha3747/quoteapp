# Quotely: Technical Documentation

This document explains how Quotely is put together and how to configure, test, release and extend it. For a quick overview, see the [README](README.md).

## Contents

1. [Architecture overview](#1-architecture-overview)
2. [Folder structure](#2-folder-structure)
3. [Data flow](#3-data-flow)
4. [Modules in detail](#4-modules-in-detail)
5. [Configuration](#5-configuration)
6. [Persistence (storage keys)](#6-persistence-storage-keys)
7. [Notifications](#7-notifications)
8. [Design system](#8-design-system)
9. [Testing and quality](#9-testing-and-quality)
10. [Release builds](#10-release-builds)
11. [Troubleshooting](#11-troubleshooting)
12. [Migration notes: Expo to RN CLI](#12-migration-notes-expo-to-rn-cli)
13. [Ideas and roadmap](#13-ideas-and-roadmap)

---

## 1. Architecture overview

Quotely is a two-screen app built in layers:

```
 Screens  ──►  Hooks / Context  ──►  Services  ──►  Network / Device
(UI only)      (state + logic)       (I/O only)      (APIs, storage, OS)
                     │
                     └──►  Utils (pure functions, unit-tested)
```

- **Screens** render UI and wire user actions to hooks. They contain no fetching or storage code.
- **Hooks and context** own state and business rules: caching, shuffling, favourites and reminder preferences.
- **Services** are thin wrappers around the outside world (`fetch`, AsyncStorage, notifications). They never touch React state.
- **Utils** are pure functions (dates, ids, formatting) with full unit-test coverage.

Provider tree (`src/App.tsx`):

```
SafeAreaProvider
└── FavoritesProvider        # persisted collection, shared by both screens
    └── ToastProvider        # app-wide toasts with optional actions (Undo)
        └── RootNavigator    # NavigationContainer + native stack
            ├── Home
            └── Favorites
```

## 2. Folder structure

```
.
├── App.tsx                     # Re-exports src/App (entry used by index.js)
├── index.js                    # AppRegistry registration
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── ActionBar.tsx       # Floating glass toolbar (Save · Another · Share · Collection)
│   │   ├── AmbientBackground.tsx # Drifting radial-gradient backdrop, palette per day
│   │   ├── Icon.tsx            # SVG stroke icons
│   │   ├── IconButton.tsx      # Round translucent icon button
│   │   ├── PressableScale.tsx  # Pressable with spring "squish" feedback
│   │   ├── LoadingDots.tsx     # Wave-of-dots activity indicator
│   │   ├── QuoteView.tsx       # Hero quote with enter animation
│   │   └── Toast.tsx           # ToastProvider + useToast()
│   ├── constants/
│   │   ├── config.ts           # Endpoints, timeouts, reminder time, storage keys
│   │   ├── fallbackQuotes.ts   # Offline quotes
│   │   └── theme.ts            # Colors, spacing, radii, fonts
│   ├── context/FavoritesContext.tsx
│   ├── hooks/
│   │   ├── useDailyQuote.ts
│   │   ├── useDailyReminder.ts
│   │   └── useShareQuote.ts
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   └── types.ts            # RootStackParamList + typed screen props
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   └── FavoritesScreen.tsx
│   ├── services/
│   │   ├── http.ts             # fetchJson with timeout
│   │   ├── notifications.ts    # Daily reminder scheduling
│   │   ├── quotesApi.ts        # ZenQuotes + payload parsing
│   │   └── storage.ts          # Safe JSON read/write
│   ├── types/
│   │   └── quote.ts
│   └── utils/
│       ├── date.ts
│       └── quote.ts
├── __tests__/                  # Jest tests
├── android/  ios/              # Native projects
```

## 3. Data flow

### Quote of the day (`useDailyQuote`)

The home screen opens immediately and never waits on the network:

```
mount
 └─ read @quotely/daily-quote
     ├─ saved today?            ──► show it, done (no network)
     ├─ saved on an older day?  ──► show it NOW, fetch today's batch in the background
     │                              (small dots next to the date while it updates)
     └─ nothing saved (first launch)
                                ──► show the LoadingDots loader, fetch today's batch
 buildSnapshot()
   ├─ fetchQuotes()   ZenQuotes, 5 s timeout
   │    └─ fails or slow? use the previous batch, or FALLBACK_QUOTES (isOffline = true)
   ├─ index = dayOfYear % quotes.length
   └─ save snapshot ──► the quote animates in
```

- **Another** (`shuffle`) picks a different random index from today's batch and saves it.
- **Pull to refresh** (`refresh`) rebuilds the snapshot from the network and always lands on a different quote.
- The snapshot is keyed by the local calendar day (`YYYY-MM-DD`), so the quote changes at local midnight.

### Favourites (`FavoritesContext`)

- Loaded once from storage on launch and shared by both screens, so the badge count and heart state always agree.
- Each quote has a stable `id` (a djb2 hash of normalised text and author), so the same quote can't be saved twice.
- `removeFavorite` returns the removed item, which the Favourites screen passes to the **Undo** toast so `restoreFavorite` can put it back.
- Every change is written straight to AsyncStorage.

## 4. Modules in detail

| Module | Responsibility | Notes |
| --- | --- | --- |
| `services/http.ts` | `fetchJson(url, init, timeoutMs)` | Uses `AbortController`; throws on non-2xx. |
| `services/quotesApi.ts` | `fetchQuotes()`, `parseZenQuotes()` | Drops ZenQuotes' rate-limit pseudo-quote and duplicates. |
| `services/storage.ts` | `readJson`, `writeJson` | Never throws; logs only in `__DEV__`. |
| `services/notifications.ts` | `scheduleDailyReminder`, `cancelDailyReminder`, `requestNotificationPermission` | A fixed notification id means rescheduling replaces the old reminder instead of adding another. |
| `hooks/useDailyReminder.ts` | Saves the reminder preference and keeps the notification text in sync | Asks for permission only when the user turns the reminder on. |
| `components/Toast.tsx` | Single-slot toast queue with an optional action | Announces messages to screen readers. |

## 5. Configuration

There are no API keys and no `.env` file. All settings live in `src/constants/config.ts`:

| Setting | Default | Purpose |
| --- | --- | --- |
| `zenQuotesUrl` | `https://zenquotes.io/api/quotes` | Quotes endpoint |
| `requestTimeoutMs` | `5000` | Network timeout |
| `reminder.hour` / `reminder.minute` | `7` / `0` | Daily reminder time |
| `storageKeys` | `@quotely/*` | AsyncStorage keys |

Colours, spacing, fonts and the ambient palettes live in `src/constants/theme.ts`.

## 6. Persistence (storage keys)

| Key | Shape | Written by |
| --- | --- | --- |
| `@quotely/daily-quote` | `{ date, quotes[], index, isOffline }` | `useDailyQuote` |
| `@quotely/favorites` | `FavoriteQuote[]` (`{ id, text, author, savedAt }`) | `FavoritesContext` |
| `@quotely/reminder-enabled` | `boolean` | `useDailyReminder` |
| `@quotely/has-seen-hint` | `boolean` | `HomeScreen` (first-run hint) |

To reset the app during development, uninstall it or clear its storage.

## 7. Notifications

- Library: **`react-native-notify-kit`**, a maintained drop-in fork of Notifee (Notifee itself was archived in April 2026).
- The reminder is a repeating `TIMESTAMP` trigger at the next 7:00 AM, with `RepeatFrequency.DAILY`.
- On Android it uses `AlarmType.SET_AND_ALLOW_WHILE_IDLE`. That fires reliably during Doze **without** the restricted `SCHEDULE_EXACT_ALARM` permission, though it may be a few minutes late.
- Android permissions (in `AndroidManifest.xml`): `POST_NOTIFICATIONS` for Android 13+, and `RECEIVE_BOOT_COMPLETED` so reminders come back after a reboot.
- The notification shows the quote the app will feature *tomorrow*, and is refreshed each time a new batch loads.

## 8. Design system

All visual tokens live in `src/constants/theme.ts`:

- **Palette:** calm and dark: background `#0E1110`, soft off-white text `#E9ECE8`, and a single muted sage accent `#9DB8A5`. There are no glows or saturated colours.
- **Type:** the quote uses a system serif (Georgia on iOS, Noto Serif on Android) and gets smaller as it gets longer (`quoteFontSize`). UI labels use the system sans with wide letter-spacing and uppercase.
- **Background:** `AmbientBackground` draws two large radial gradients (RN's native `backgroundImage: 'radial-gradient(…)'`) that drift on a 28-second sine loop, plus a bottom fade. `ambientPalettes` in `theme.ts` holds five soft colour pairs, and one is picked by day of the year. Motion stops when the system Reduce Motion setting is on.
- **Surfaces:** translucent "glass" panels with hairline borders.
- **Motion:** quotes fade and rise in, the background drifts slowly, buttons spring when pressed, and toasts slide up. All of these use the native driver.

App icons live in `android/app/src/main/res/mipmap-*` and `ios/quotely/Images.xcassets/AppIcon.appiconset`. The source artwork is `docs/icon.png` (1024×1024).

## 9. Testing and quality

```bash
npm run validate     # typecheck + lint + tests
```

- `__tests__/quote.test.ts`: id generation, ZenQuotes parsing, shuffle and formatting.
- `__tests__/date.test.ts`: day keys, day-of-year, formatting, reminder scheduling.
- `__tests__/App.test.tsx`: smoke test that the full provider tree renders.
- `jest.setup.js` mocks AsyncStorage and notifications, and turns off the network so tests are deterministic.

## 10. Release builds

### Android

1. Generate an upload key (one time). **Keep it safe and never commit it.**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore quotely-upload.keystore \
     -alias quotely -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Move the keystore to `android/app/`, then add the following to `~/.gradle/gradle.properties` (your user-level file, not the project one):
   ```properties
   QUOTELY_UPLOAD_STORE_FILE=quotely-upload.keystore
   QUOTELY_UPLOAD_STORE_PASSWORD=*****
   QUOTELY_UPLOAD_KEY_ALIAS=quotely
   QUOTELY_UPLOAD_KEY_PASSWORD=*****
   ```
3. Build:
   ```bash
   npm run build:android    # APK → android/app/build/outputs/apk/release/
   npm run bundle:android   # AAB → android/app/build/outputs/bundle/release/
   ```

If those properties are missing, release builds fall back to the debug key, so local release testing still works.

Bump `versionCode` and `versionName` in `android/app/build.gradle` for each store release.

### iOS

1. Open `ios/quotely.xcworkspace` in Xcode.
2. Under *Signing & Capabilities*, pick your team and a unique bundle id.
3. Set the version and build under the target's *General* tab.
4. Choose *Product → Archive*, then distribute through the Organizer.

## 11. Troubleshooting

| Problem | Fix |
| --- | --- |
| iOS build fails after adding packages | `npm run pods` (or `cd ios && bundle exec pod install`) |
| Android build can't find AsyncStorage's `shared-storage` artifact | Check that the `allprojects { repositories { maven { … local_repo } } }` block is still in `android/build.gradle` |
| No reminder on Android 13+ | The user denied permission. Re-enable it in system Settings → Apps → Quotely → Notifications |
| Always shows *Offline* | ZenQuotes rate-limits heavy use (about 5 requests every 30 seconds). Wait and pull to refresh |
| Weird Metro or Gradle errors after switching branches | `npm run clean:android`, delete `node_modules`, `npm install`, `npm run pods` |

## 12. Migration notes: Expo to RN CLI

| Expo app (`quoteapp`) | Quotely (RN CLI) |
| --- | --- |
| `expo-router` + stack navigator | `@react-navigation/native-stack` with typed routes |
| `expo-constants` + `app.config.js` `extra` + Pexels photos | Not needed: no API keys, background drawn with native gradients |
| `expo-notifications` | `react-native-notify-kit` |
| `react-native-toast-message` | Built-in `ToastProvider` (no dependency, supports Undo) |
| `react-native-reanimated` `FadeIn` | Core `Animated` API (native driver) |
| One 300-line screen component | Screens, hooks, services, context and utils |
| JavaScript | TypeScript |

Bugs fixed along the way:

- The reminder was scheduled only once (guarded by a `hasScheduledQuote` flag) and always showed the very first quote.
- Deleting a favourite used the index in a reversed list, which could delete the wrong item. Favourites now use stable ids.
- A failed fetch replaced the quote with *"Failed to fetch quote"*. The app now falls back to cached or bundled quotes.
- The app needed a Pexels API key and a 600 KB background image. Both are gone, replaced by a code-drawn ambient background.

## 13. Ideas and roadmap

- A settings screen to choose the reminder time
- Home-screen widgets (iOS WidgetKit, Android Glance)
- Categories and search in the collection
- Share as an image card (`react-native-view-shot`)
- A light theme
- Haptic feedback on save
