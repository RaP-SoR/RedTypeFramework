<template>
   <div v-if="isDev" class="dev-ui-list">
      <h3>UI Komponenten</h3>

      <!-- Gruppierte UIs -->
      <div
         v-for="(components, groupName) in groupedComponents"
         :key="groupName"
         class="ui-group"
      >
         <div class="group-header">{{ formatGroupName(groupName) }}</div>
         <div class="dev-ui-buttons">
            <button
               v-for="type in components"
               :key="type"
               @click="toggleDevUI(type)"
               :class="{
                  active: activeUIs[type],
                  'hidden-ui': activeUIs[type]?.hidden,
               }"
            >
               {{ formatComponentName(type)
               }}{{ activeUIs[type]?.hidden ? " (hidden)" : "" }}
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

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
      required: true,
   },
});

const emit = defineEmits(["toggleDevUI"]);

// Gruppierte Komponenten nach Ordner/Modul
const groupedComponents = computed(() => {
   const groups: Record<string, string[]> = {};

   Object.keys(props.uiComponents).forEach((type) => {
      // Versuche eine Gruppe zu finden (z.B. "inventory" aus "inventory-details")
      const dashIndex = type.indexOf("-");
      let groupName = "";

      if (dashIndex > 0) {
         groupName = type.substring(0, dashIndex);
         // Entscheide, ob wir den vollständigen Namen oder nur den Teil nach dem Bindestrich zeigen
      }

      if (!groups[groupName]) {
         groups[groupName] = [];
      }

      groups[groupName].push(type);
   });

   return groups;
});

// Formatiert den Gruppennamen für bessere Lesbarkeit
const formatGroupName = (groupName: string): string => {
   return groupName.charAt(0).toUpperCase() + groupName.slice(1);
};

// Zeigt nur den relevanten Teil des Komponentennamens an
const formatComponentName = (type: string): string => {
   const dashIndex = type.indexOf("-");
   if (dashIndex > 0) {
      return type.substring(dashIndex + 1);
   }
   return type;
};

// Delegiere die toggleDevUI-Funktion an die Elternkomponente
const toggleDevUI = (type: string) => {
   emit("toggleDevUI", type);
};
</script>

<style>
.dev-ui-list {
   position: fixed;
   top: 0;
   left: 0;
   background-color: rgba(0, 0, 0, 0.8);
   color: white;
   padding: 10px;
   z-index: 9999;
   max-width: 250px;
   min-width: 180px;
   border-radius: 4px;
   max-height: 80vh;
   overflow-y: auto;
}

.ui-group {
   margin-bottom: 15px;
}

.group-header {
   font-weight: bold;
   color: #ffcc00;
   margin-bottom: 5px;
   border-bottom: 1px solid rgba(255, 204, 0, 0.5);
   padding-bottom: 3px;
}

.dev-ui-buttons {
   display: flex;
   flex-direction: column;
   gap: 5px;
   margin-top: 5px;
}

.dev-ui-buttons button {
   background-color: rgba(60, 60, 60, 0.8);
   color: white;
   border: none;
   padding: 5px 10px;
   border-radius: 3px;
   cursor: pointer;
   text-align: left;
}

.dev-ui-buttons button:hover {
   background-color: rgba(80, 80, 80, 0.8);
}

.dev-ui-buttons button.active {
   background-color: rgba(0, 215, 0, 0.8);
}
.dev-ui-buttons button.hidden-ui {
   background-color: rgba(0, 100, 215, 0.8);
   font-style: italic;
}
</style>
