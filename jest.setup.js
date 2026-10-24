/* global jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('react-native-notify-kit', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(async () => 'daily-quote'),
    requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
    createTriggerNotification: jest.fn(async () => 'daily-quote-reminder'),
    cancelTriggerNotification: jest.fn(async () => undefined),
  },
  AlarmType: {
    SET: 0,
    SET_AND_ALLOW_WHILE_IDLE: 1,
    SET_EXACT: 2,
    SET_EXACT_AND_ALLOW_WHILE_IDLE: 3,
    SET_ALARM_CLOCK: 4,
  },
  AndroidImportance: { DEFAULT: 3 },
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
  RepeatFrequency: { NONE: -1, HOURLY: 0, DAILY: 1, WEEKLY: 2 },
  TriggerType: { TIMESTAMP: 0, INTERVAL: 1 },
}));

// Keep tests offline and deterministic.
global.fetch = jest.fn(() =>
  Promise.reject(new Error('Network disabled in tests')),
);
