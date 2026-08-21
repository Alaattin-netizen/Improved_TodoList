<script setup lang="ts">
import type { ContextMenuItem, TableColumn, TableRow } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import { h, resolveComponent } from 'vue'
import { useTaskStore } from '~/stores/task'
import { useUserStore } from '~/stores/user'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const taskStore = useTaskStore()
const userStore = useUserStore()
const { copy } = useClipboard()

const createModalOpen = ref(false)
const updateModalOpen = ref(false)
const toast = useToast()
const selectedTaskId = ref<number>()
const newTaskText = ref('')
const selectedUserId = ref<number>()

const tasksWithUsers = computed(() => {
  return taskStore.taskList.map(task => ({
    ...task,
    userName: userStore.getUserById(task.userId)?.name || '—',
  }))
})

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

const items = ref<ContextMenuItem[]>([])

function getTaskRowItems(row: TableRow<Task>) {
  return [
    {
      type: 'label' as const,
      label: 'Actions',
    },
    {
      label: 'Copy Task ID',
      onSelect() {
        copy(String(row.original.id))

        toast.add({
          title: 'Task ID copied to clipboard!',
          color: 'success',
          icon: 'i-lucide-circle-check',
        })
      },
    },
    {
      label: 'Delete Task',
      onSelect() {
        taskStore.deleteTask(row.original.id)
      },
    },
    {
      label: row.original.completed ? 'Change to Pendind' : 'Change to completed',
      onSelect() {
        taskStore.toggleTask(row.original.id)
      },
    },
    { label: 'Update Task', onSelect() {
      selectedTaskId.value = row.original.id
      newTaskText.value = ''
      updateModalOpen.value = true
    } },

  ]
}

function updateTask() {
  if (selectedTaskId.value != null && newTaskText.value.trim()) {
    taskStore.updateTask(selectedTaskId.value, newTaskText.value.trim())
    updateModalOpen.value = false
    toast.add({
      title: 'Task updated!',
      color: 'success',
      icon: 'i-lucide-check',
    })
  }
}

function openCreateModal() {
  newTaskText.value = ''
  createModalOpen.value = true
}
function createTask() {
  if (selectedUserId.value != null && newTaskText.value.trim()) {
    if (userStore.getUserById(selectedUserId.value)) {
      taskStore.addTask(newTaskText.value.trim(), selectedUserId.value)
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
        icon: 'i-lucide-check',
      })
    }
  }
}

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
