import { defineStore } from "pinia";

interface GlobalState {
  playerID: number;
}

export const useGlobalStore = defineStore("app", {
  state: (): GlobalState => ({
    playerID: 0,
  }),
});
