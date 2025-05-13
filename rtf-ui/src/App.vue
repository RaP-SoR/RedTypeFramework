<template>
   <v-app theme="dark">
      <UIListDev
         v-if="isDev"
         :uiComponents="uiComponents"
         :activeUIs="activeUIs"
         :isDev="isDev"
         @toggleDevUI="toggleDevUI"
      />
      <UIRender
         :uiComponents="uiComponents"
         :activeUIs="activeUIs"
         :isDev="isDev"
         @closeUI="closeUI"
      />
   </v-app>
</template>

<script setup lang="ts">
declare global {
   interface Window {
      invokeNative?: any;
   }
}
import { onMounted, onUnmounted, reactive } from "vue";
import { VApp } from "vuetify/components";
import { useGlobalStore } from "./stores/global";
import { eventManager, type MessageData } from "./utils/EventManager";
import type { UIConfig } from "./interfaces";
import { loadUIComponents } from "./utils/uiLoader";

import UIListDev from "./components/UIListDev.vue";
import UIRender from "./components/UIRender.vue";

const isInRedM = !!window.invokeNative;
const isDev = process.env.NODE_ENV === "development" && !isInRedM;
const globalStore = useGlobalStore();
const activeUIs = reactive<Record<string, UIConfig>>({});

const uiComponents = reactive<Record<string, any>>({});

const openUI = (config: UIConfig): string => {
   const type = config.type;

   if (config.exclusive && config.exclusive.length > 0) {
      Object.entries(activeUIs).forEach(([uiType, ui]) => {
         if (config.exclusive?.includes(uiType)) {
            delete activeUIs[uiType];
         }
      });
   }

   let shouldClose = false;
   Object.values(activeUIs).forEach((ui) => {
      if (ui.exclusive?.includes(type)) {
         shouldClose = true;
      }
   });

   if (shouldClose) {
      return "";
   }

   activeUIs[type] = {
      ...config,
   };

   return type;
};

const closeUI = (type: string) => {
   if (activeUIs[type]) {
      delete activeUIs[type];
   }

   if (Object.keys(activeUIs).length === 0 && window.invokeNative && !isDev) {
      fetch(`${process.env.BASE_URL}/closeUI`, {
         method: "POST",
         body: JSON.stringify({}),
      });
   }
};
const closeAllUIs = () => {
   Object.keys(activeUIs).forEach((type) => delete activeUIs[type]);

   if (window.invokeNative && !isDev) {
      fetch(`${process.env.BASE_URL}/closeUI`, {
         method: "POST",
         body: JSON.stringify({}),
      });
   }
};

const toggleDevUI = (type: string) => {
   if (activeUIs[type]) {
      closeUI(type);
   } else {
      openUI({
         type,
         title: `${type.charAt(0).toUpperCase() + type.slice(1)} UI`,
         showControls: true,
      });
   }
};

const setPlayerID = (id: number) => {
   globalStore.$state.playerID = id;
};

onMounted(async () => {
   const loadedComponents = await loadUIComponents();
   Object.entries(loadedComponents).forEach(([name, component]) => {
      uiComponents[name] = component;
   });

   if (isDev) {
      openUI({ type: "demo", title: "Demo UI", showControls: true });
      setPlayerID(1);
   }

   eventManager.on("exitUI", (data: MessageData) => {
      const uiType = data.payload?.[0] as string | undefined;

      if (uiType && activeUIs[uiType]) {
         closeUI(uiType);
      } else {
         closeAllUIs();
      }
   });

   eventManager.on("openUI", (data: MessageData) => {
      const config = data.payload?.[0] as UIConfig | undefined;

      if (config && config.type && uiComponents[config.type]) {
         openUI(config);
      }
   });

   eventManager.on("toggleUI", (data: MessageData) => {
      const uiType = data.payload?.[0] as string | undefined;
      const props = data.payload?.[1] as Record<string, any> | undefined;

      if (uiType && uiComponents[uiType]) {
         if (activeUIs[uiType]) {
            closeUI(uiType);
         } else {
            openUI({
               type: uiType,
               props: props,
               showControls: true,
            });
         }
      }
   });

   eventManager.on("setPlayerID", (data: MessageData) => {
      if (data.data !== undefined) {
         setPlayerID(data.data);
      }
   });
});

onUnmounted(() => {
   eventManager.off("openUI");
   eventManager.off("toggleUI");
   eventManager.off("exitUI");
   eventManager.off("setPlayerID");
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
