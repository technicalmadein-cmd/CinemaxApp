import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "cinemax.refresh";
const AKEY = "cinemax.access";

async function getItem(k: string) {
  if (Platform.OS === "web") return typeof localStorage !== "undefined" ? localStorage.getItem(k) : null;
  return SecureStore.getItemAsync(k);
}
async function setItem(k: string, v: string | null) {
  if (Platform.OS === "web") {
    if (typeof localStorage === "undefined") return;
    v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v);
    return;
  }
  if (v === null) await SecureStore.deleteItemAsync(k);
  else await SecureStore.setItemAsync(k, v);
}

export const authStore = {
  getRefresh: () => getItem(KEY),
  setRefresh: (v: string | null) => setItem(KEY, v),
  getAccess: () => getItem(AKEY),
  setAccess: (v: string | null) => setItem(AKEY, v),
};
