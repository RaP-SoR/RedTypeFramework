<template>
   <div>
      <div
         v-for="(uiInstance, type) in visibleUIs"
         :key="type"
         class="ui-container"
      >
         <component
            :is="getUIComponent(type)"
            v-bind="uiInstance || {}"
            @close="handleClose($event, type)"
         />
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { UIConfig } from "@/interfaces";

const props = defineProps({
   uiComponents: {
      type: Object,
      required: true,
   },
   activeUIs: {
      type: Object,
      required: true,
   },
   isDev: {
      type: Boolean,
      default: false,
   },
});

const visibleUIs = computed(() => {
   return Object.entries(props.activeUIs)
      .filter(([_, ui]) => !ui.hidden)
      .reduce((acc, [type, ui]) => {
         acc[type] = ui;
         return acc;
      }, {} as Record<string, UIConfig>);
});
const getUIComponent = (type: string) => {
   return props.uiComponents[type];
};

const emit = defineEmits(["closeUI"]);

const closeUI = (type: string) => {
   emit("closeUI", type);
};

const handleClose = (eventType?: string, fallbackType?: string) => {
   const typeToClose = eventType || fallbackType;
   if (typeToClose) {
      closeUI(typeToClose);
   }
};
</script>
