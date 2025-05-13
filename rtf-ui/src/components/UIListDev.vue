<template>
   <div v-if="isDev" class="dev-ui-list" :style="positionStyle">
      <div class="drag-handle" @mousedown="startDrag">
         <span>UIs</span>
         <div class="drag-icon">⋮⋮</div>
      </div>

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
import { computed, ref, onMounted, onBeforeUnmount } from "vue";

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

const posX = ref(10);
const posY = ref(10);
const isDragging = ref(false);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);

const positionStyle = computed(() => {
   return {
      left: `${posX.value}px`,
      top: `${posY.value}px`,
   };
});

const startDrag = (e: MouseEvent) => {
   isDragging.value = true;
   dragOffsetX.value = e.clientX - posX.value;
   dragOffsetY.value = e.clientY - posY.value;
   document.addEventListener("mousemove", onDrag);
   document.addEventListener("mouseup", stopDrag);
};

const onDrag = (e: MouseEvent) => {
   if (!isDragging.value) return;

   let newX = e.clientX - dragOffsetX.value;
   let newY = e.clientY - dragOffsetY.value;

   const maxWidth = window.innerWidth - 200;
   const maxHeight = window.innerHeight - 100;

   newX = Math.max(0, Math.min(newX, maxWidth));
   newY = Math.max(0, Math.min(newY, maxHeight));

   posX.value = newX;
   posY.value = newY;
};

const stopDrag = () => {
   isDragging.value = false;
   document.removeEventListener("mousemove", onDrag);
   document.removeEventListener("mouseup", stopDrag);

   try {
      localStorage.setItem("uiListDevPosX", posX.value.toString());
      localStorage.setItem("uiListDevPosY", posY.value.toString());
   } catch (e) {
      console.warn("Konnte Position nicht speichern", e);
   }
};

onMounted(() => {
   try {
      const savedX = localStorage.getItem("uiListDevPosX");
      const savedY = localStorage.getItem("uiListDevPosY");
      if (savedX && savedY) {
         posX.value = parseInt(savedX);
         posY.value = parseInt(savedY);
      }
   } catch (e) {
      console.warn("Konnte gespeicherte Position nicht laden", e);
   }
});

onBeforeUnmount(() => {
   document.removeEventListener("mousemove", onDrag);
   document.removeEventListener("mouseup", stopDrag);
});

const groupedComponents = computed(() => {
   const groups: Record<string, string[]> = {};

   Object.keys(props.uiComponents).forEach((type) => {
      const dashIndex = type.indexOf("-");
      let groupName = "";
      if (dashIndex > 0) {
         groupName = type.substring(0, dashIndex);
      }

      if (!groups[groupName]) {
         groups[groupName] = [];
      }

      groups[groupName].push(type);
   });

   return groups;
});

const formatGroupName = (groupName: string): string => {
   return groupName.charAt(0).toUpperCase() + groupName.slice(1);
};

const formatComponentName = (type: string): string => {
   const dashIndex = type.indexOf("-");
   if (dashIndex > 0) {
      return type.substring(dashIndex + 1);
   }
   return type;
};

const toggleDevUI = (type: string) => {
   emit("toggleDevUI", type);
};
</script>

<style>
.dev-ui-list {
   position: fixed;
   background-color: rgba(0, 0, 0, 0.8);
   color: white;
   padding: 10px;
   z-index: 9999;
   max-width: 250px;
   min-width: 180px;
   border-radius: 4px;
   max-height: 80vh;
   overflow-y: auto;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
   user-select: none;
}

.drag-handle {
   cursor: move;
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding-bottom: 5px;
   border-bottom: 2px solid rgba(255, 204, 0, 0.5);
   margin-bottom: 10px;
   font-weight: bold;
}

.drag-icon {
   color: #ffcc00;
   font-weight: bold;
   letter-spacing: -3px;
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
