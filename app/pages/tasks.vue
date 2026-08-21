<script setup lang="ts">
import type {
  ContextMenuItem,
  TableColumn,
} from '@nuxt/ui'

import { useTaskActions } from '~/composables/helper'

const taskStore = useTaskStore()
const userStore = useUserStore()

const {
  updateModalOpen,
  newTaskText,
  getTaskRowItems,
  updateTask,
} = useTaskActions()

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const createModalOpen = ref(false)
const selectedUserId = ref<number | null>(null)

const toast = useToast()

const tasksWithUsers = computed(() => {
  return taskStore.taskList.map(task => ({
    ...task,
    userName:
      userStore.getUserById(task.userId)?.name ?? '—',
  }))
})

function openCreateModal() {
  newTaskText.value = ''
  selectedUserId.value = null
  createModalOpen.value = true
}

const taskColumns: TableColumn<Task>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'text', header: 'Task' },

  {
    accessorKey: 'completed',
    header: 'Status',
    cell: ({ row }) =>
      h(
        UBadge,
        {
          color: row.getValue('completed') ? 'success' : 'neutral',
          variant: 'subtle',
        },
        () => row.getValue('completed') ? 'Done' : 'Pending',
      ),
  },
  { accessorKey: 'userName', header: 'User' },
  { accessorKey: 'createdAt', header: 'Creation Date' },
  { accessorKey: 'userId', header: 'User ID' },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right',
      },
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          'content': {
            align: 'end',
          },
          'items': getTaskRowItems(row),
          'aria-label': 'Task actions dropdown',
        },
        () =>
          h(UButton, {
            'icon': 'i-lucide-ellipsis-vertical',
            'color': 'neutral',
            'variant': 'ghost',
            'aria-label': 'Task actions dropdown',
            'onClick': (event: MouseEvent) => {
              event.stopPropagation()
            },
          }),
      )
    },
  },
]

function createTask() {
  if (
    selectedUserId.value !== null
    && newTaskText.value.trim()
  ) {
    if (userStore.getUserById(selectedUserId.value)) {
      taskStore.addTask(
        newTaskText.value.trim(),
        selectedUserId.value,
      )

      createModalOpen.value = false

      toast.add({
        title: 'Task added!',
        color: 'success',
        icon: 'i-lucide-check',
      })
    }
    else {
      toast.add({
        title: 'User ID does not exist!',
        color: 'warning',
        icon: 'i-lucide-circle-check',
      })
    }
  }
}

const items = ref<ContextMenuItem[]>([])

onMounted(() => {
  userStore.fetchUsers()
  taskStore.loadFromLocalStorage()
})
</script>

<template>
  <UApp>
    <UButton @click="openCreateModal">
      Create Task
    </UButton>
    <UContextMenu :items="items">
      <UTable
        :data="tasksWithUsers"
        :columns="taskColumns"
        class="w-full"
      />
    </UContextMenu>

    <UModal v-model:open="createModalOpen" title="Add Task">
      <template #body>
        <UTextarea
          v-model="newTaskText"
          placeholder="Enter task..."
          :rows="4"
          class="w-full"
        />

        <UInput
          v-model="selectedUserId"
          placeholder="Enter user ID..."
          type="number"
          class="w-full"
        />
      </template>

      <template #footer>
        <UButton
          :disabled="!newTaskText.trim()"
          @click="createTask"
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
