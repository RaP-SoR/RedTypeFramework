<template>
  <VCard class="example-complex-panel">
    <VCardTitle>
      <VIcon icon="mdi-account-group" class="me-2"></VIcon>
      Example Complex Module
    </VCardTitle>
    
    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <VCard>
            <VCardTitle>Online Users ({{ users.length }})</VCardTitle>
            <VCardText>
              <VList>
                <VListItem
                  v-for="user in users"
                  :key="user.id"
                  density="comfortable"
                >
                  <template v-slot:prepend>
                    <VIcon icon="mdi-account"></VIcon>
                  </template>
                  <VListItemTitle>{{ user.name }}</VListItemTitle>
                  <VListItemSubtitle>Level {{ user.level }}</VListItemSubtitle>
                  <template v-slot:append>
                    <VChip 
                      size="small" 
                      :color="getUserLevelColor(user.level)"
                    >
                      {{ user.permissions.length }} perms
                    </VChip>
                  </template>
                </VListItem>
              </VList>
            </VCardText>
          </VCard>
        </VCol>
        
        <VCol cols="12" md="6">
          <VCard>
            <VCardTitle>Module Statistics</VCardTitle>
            <VCardText>
              <VTable>
                <tbody>
                  <tr>
                    <td>Total Users:</td>
                    <td>{{ users.length }}</td>
                  </tr>
                  <tr>
                    <td>Average Level:</td>
                    <td>{{ averageLevel }}</td>
                  </tr>
                  <tr>
                    <td>Max Level:</td>
                    <td>{{ maxLevel }}</td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td>
                      <VChip color="success" size="small">
                        <VIcon icon="mdi-check" size="small" class="me-1"></VIcon>
                        Active
                      </VChip>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VCardText>
    
    <VCardActions>
      <VBtn color="primary" @click="refreshData">
        <VIcon icon="mdi-refresh" class="me-1"></VIcon>
        Refresh
      </VBtn>
      <VBtn color="secondary" @click="exportData">
        <VIcon icon="mdi-download" class="me-1"></VIcon>
        Export
      </VBtn>
      <VSpacer></VSpacer>
      <VBtn variant="text" @click="$emit('close')">
        Close
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  VCard, 
  VCardTitle, 
  VCardText, 
  VCardActions,
  VRow,
  VCol,
  VList,
  VListItem,
  VListItemTitle,
  VListItemSubtitle,
  VTable,
  VChip,
  VBtn,
  VIcon,
  VSpacer
} from 'vuetify/components';

// Simple type definitions for this component
interface ExampleUser {
  id: string;
  name: string;
  level: number;
  permissions: string[];
}

// Props
interface Props {
  initialData?: {
    users: ExampleUser[];
  };
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({ users: [] })
});

// Emits
defineEmits<{
  close: [];
}>();

// Reactive data
const users = ref<ExampleUser[]>(props.initialData.users || []);

// Computed properties
const averageLevel = computed(() => {
  if (users.value.length === 0) return 0;
  const total = users.value.reduce((sum, user) => sum + user.level, 0);
  return Math.round(total / users.value.length * 100) / 100;
});

const maxLevel = computed(() => {
  if (users.value.length === 0) return 0;
  return Math.max(...users.value.map(user => user.level));
});

// Methods
function getUserLevelColor(level: number): string {
  if (level >= 50) return 'purple';
  if (level >= 25) return 'blue';
  if (level >= 10) return 'green';
  return 'grey';
}

function refreshData(): void {
  // This would trigger a refresh from the backend
  console.log('Refreshing data...');
  // In a real implementation, this would emit an event to the client script
  // which would then request fresh data from the server
}

function exportData(): void {
  const data = {
    users: users.value,
    timestamp: new Date().toISOString(),
    stats: {
      total: users.value.length,
      averageLevel: averageLevel.value,
      maxLevel: maxLevel.value
    }
  };
  
  // In a real implementation, this would trigger a download
  console.log('Export data:', data);
}

// Lifecycle
onMounted(() => {
  console.log('Example Complex UI component mounted');
});
</script>

<style scoped>
.example-complex-panel {
  max-width: 800px;
  margin: 0 auto;
}
</style>
