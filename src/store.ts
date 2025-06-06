import { writable } from "svelte/store";
import { PUBLICATIONS } from "./constants";

interface StoreData {
  focusedPubs: string[];
  focus: "set" | "intersection";
  focusTopic: string[];
}

const InitialStore: StoreData = {
  focusedPubs: [],
  focus: "intersection",
  focusTopic: [],
};

function isSubset(A: string[], B: string[]) {
  return B.every((b) => A.includes(b));
}
function setEqual(A: string[], B: string[]) {
  return isSubset(A, B) && isSubset(B, A);
}

function createStore() {
  const { subscribe, set, update } = writable<StoreData>(InitialStore);

  return {
    subscribe,
    // setPubs: (val: string[]) => update((old) => ({ ...old, focusedPubs: val })),
    focusSet: (val: string) =>
      update((old) => ({
        ...old,
        focus: "set",
        focusedPubs: PUBLICATIONS.filter((x) => isSubset(x.topics, [val])).map(
          (x) => x.title
        ),
        focusTopic: [val],
      })),
    focusIntersection: (val: string[]) =>
      update((old) => ({
        ...old,
        focus: "intersection",
        focusedPubs: PUBLICATIONS.filter((x) => setEqual(x.topics, val)).map(
          (x) => x.title
        ),
        focusTopic: val,
      })),
    reset: () => set({ ...InitialStore }),
  };
}

const store = createStore();

export default store;
