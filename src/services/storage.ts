import AsyncStorage from '@react-native-async-storage/async-storage';

/** Typed JSON helpers around AsyncStorage that never throw. */
export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    if (__DEV__) {
      console.warn(`[storage] Failed to read "${key}"`, error);
    }
    return null;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (__DEV__) {
      console.warn(`[storage] Failed to write "${key}"`, error);
    }
  }
}
