<script setup lang="ts">
import type {
  ContextMenuItem,
  TableColumn,
  TableRow,
} from '@nuxt/ui'
import { h, resolveComponent } from 'vue'

const UButton = resolveComponent('UButton')
const userStore = useUserStore()

const {
  createModalOpen,
  updateModalOpen,
  selectedUserId,
  newTaskText,
  taskColumns,

  getTasksForUser,
  getUsername,

  createTaskForUser,
  updateTask,
} = useTaskActions()

const items = ref<ContextMenuItem[]>([])

const userColumns: TableColumn<User>[] = [
  {
    id: 'expand',

    cell: ({ row }) =>
      h(UButton, {
        'color': 'neutral',
        'variant': 'ghost',
        'icon': 'i-lucide-chevron-down',
        'square': true,
        'aria-label': 'Expand',

        'ui': {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded()
              ? 'duration-200 rotate-180'
              : '',
          ],
        },

        'onClick': () => row.toggleExpanded(),
      }),
  },

  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'username', header: 'Username' },
  { accessorKey: 'email', header: 'Email' },
]

function getRowItems(row: TableRow<User>) {
  return [
    {
      type: 'label' as const,
      label: 'Actions',
    },

    {
      label: 'Copy User ID',

      onSelect() {
        // ...
      },
    },

    {
      label: row.getIsExpanded()
        ? 'Collapse'
        : 'Expand',

      onSelect() {
        row.toggleExpanded()
      },
    },

    {
      label: 'Add task',

      onSelect() {
        selectedUserId.value = row.original.id
        newTaskText.value = ''
        createModalOpen.value = true
      },
    },
  ]
}

function onContextmenu(
  _e: Event,
  row: TableRow<User>,
) {
  items.value = getRowItems(row)
}

onMounted(() => {
  userStore.fetchUsers()
  useTaskStore().loadFromLocalStorage()
})
</script>

<template>
  <UApp>
    <UContextMenu :items="items">
      <UTable
        loading
        loading-color="primary"
        loading-animation="carousel" :data="userStore.users" class="flex-1" :columns="userColumns"
        @contextmenu="onContextmenu"
      >
        <template #expanded="{ row }">
          <h2 class="text-sm font-medium mb-2">
            Tasks for {{ row.original.name }}
          </h2>
          <div class="p-3 dark:bg-blue-900 rounded-lg border border-green-500">
            <UTable
              :data="getTasksForUser(row.original.id)"
              :columns="taskColumns"
              size="sm"
              class="w-full"
            />
          </div>
        </template>
      </UTable>
    </UContextMenu>

    <UModal v-model:open="createModalOpen" title="Add Task">
      <template #body>
        <p>
          Add a new task for
          <span class="font-medium text-gray-200">
            {{ getUsername(selectedUserId) }}
          </span>
        </p>

        <UTextarea
          v-model="newTaskText"
          placeholder="Enter task..."
          :rows="4"
          class="w-full"
        />
      </template>

      <template #footer>
        <UButton
          :disabled="!newTaskText.trim()"
          @click="createTaskForUser"
        >
          Add Task
        </UButton>
      </template>
    </UModal>

    <UModal v-model:open="updateModalOpen" title="Update Task">
      <template #body>
        <UTextarea
          v-model="newTaskText"
          placeholder="Enter task..."
          :rows="4"
          class="w-full"
        />
      </template>

      <template #footer>
        <UButton
          :disabled="!newTaskText.trim()"
          @click="updateTask"
        >
          Update Task
        </UButton>
      </template>
    </UModal>
  </UApp>
</template>
