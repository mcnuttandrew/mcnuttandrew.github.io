import { writable } from "svelte/store";

interface StoreData {
  focusedPubs: string[];
  mode: "include-subsets" | "only-exact-matches";
}

const InitialStore: StoreData = {
  focusedPubs: [],
  mode: "only-exact-matches",
};

function createStore() {
  const { subscribe, set, update } = writable<StoreData>(InitialStore);

  return {
    subscribe,
    setPubs: (val: string[]) =>
      update((oldStore) => ({ ...oldStore, focusedPubs: val })),
    setMode: (mode: StoreData["mode"]) => update((old) => ({ ...old, mode })),
    reset: () => set({ ...InitialStore }),
  };
}

const store = createStore();

export default store;
