<template>
  <v-app theme="dark" v-if="isVisible">
    <component :is="currentView" />
  </v-app>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted } from "vue";

declare global {
  interface Window {
    invokeNative?: any;
  }
}
import { useGlobalStore } from "./stores/global";
import BasicCardView from "./views/BasicCardView.vue";
import { eventManager, type MessageData } from "./utils/EventManager";

const isInRedM = !!window.invokeNative;
const isDev = process.env.NODE_ENV === "development" && !isInRedM;
const currentView = shallowRef(BasicCardView);
let isVisible = ref(isDev ? true : false);
const globalStore = useGlobalStore();

const toggleShow = (view = "") => {
  switch (view) {
    case "base":
      currentView.value = BasicCardView;
      break;
    default:
      break;
  }
  isVisible.value = !isVisible.value;
};

const setPlayerID = (id: number) => {
  globalStore.$state.playerID = id;
};

const closeUI = () => {
  isVisible.value = false;

  if (window.invokeNative && !isDev) {
    fetch(`${process.env.BASE_URL}/closeUI`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }
};
onMounted(() => {
  eventManager.on("exitUI", (data: MessageData) => {
    if (!isVisible.value) {
      console.log("exitUI called, but UI is not visible");
      return;
    }
    console.log("exitUI called");
    closeUI();
  });
  eventManager.on("toggleShowUI", (data: MessageData) => {
    const viewName = data.payload?.[0];
    toggleShow(viewName || "");

    if (!isVisible.value) {
      closeUI();
    }
  });

  eventManager.on("setPlayerID", (data: MessageData) => {
    if (data.data !== undefined) {
      setPlayerID(data.data);
    }
  });
});

onUnmounted(() => {
  // Entferne alle Handler beim Unmount
  eventManager.off("toggleShowUI");
  eventManager.off("setPlayerID");
  eventManager.off("exitUI");
});
</script>
<style>
::-webkit-scrollbar {
  width: 0;
  display: inline !important;
}
.v-application {
  background: rgb(0, 0, 0, 0.5) !important;
}

:root {
  color-scheme: none !important;
}
</style>
