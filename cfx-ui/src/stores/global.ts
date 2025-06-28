import { defineStore } from "pinia";

interface GlobalState {
  playerID: number;
  characterName: string;
  character: any | null;
}

export const useGlobalStore = defineStore("app", {
  state: (): GlobalState => ({
    playerID: 0,
    characterName: "John Doe",
    character: null,
  }),
});
