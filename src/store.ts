import { writable } from "svelte/store";

interface StoreData {
  focusedPubs: string[];
}

const InitialStore: StoreData = {
  focusedPubs: [],
};

function createStore() {
  const { subscribe, set, update } = writable<StoreData>(InitialStore);
  const simpleUpdate = (updateFunc: (old: string[]) => string[]) =>
    update((oldStore) => ({
      ...oldStore,
      focusedPubs: updateFunc(oldStore.focusedPubs),
    }));
  return {
    subscribe,
    setPubs: (val: string[]) => simpleUpdate(() => val),

    reset: () => set({ ...InitialStore }),
  };
}

const store = createStore();

export default store;
