<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn, ContextMenuItem, TableRow } from '@nuxt/ui'
import { useClipboard, type UseRafFnOptions } from '@vueuse/core'
import { header } from '#build/ui';

const userStore = useUserStore();
const taskStore = useTaskStore();
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const toast = useToast()
const { copy } = useClipboard()


const createModalOpen = ref(false)
const updateModalOpen = ref(false)
const selectedUserId = ref<number | null>(null)
    const selectedTaskId = ref<number | null>(null)
const newTaskText = ref('')

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
          variant: 'subtle'
        },
        () => row.getValue('completed') ? 'Done' : 'Pending'
      )
  },
  { accessorKey: 'createdAt', header: 'Creation Date' },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: 'end'
          },
          items: getTaskRowItems(row),
          'aria-label': 'Task actions dropdown'
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost',
            'aria-label': 'Task actions dropdown',
            onClick: (event: MouseEvent) => {
              event.stopPropagation()
            }
          })
      )
    }
  }
]

function getTasksForUser(userId: number) {
  return taskStore.taskList.filter(task => task.userId === userId)
}

function getTaskRowItems(row: TableRow<Task>) {
  return [
    {
      type: 'label' as const,
      label: 'Actions'
    },
    {
      label: 'Copy Task ID',
      onSelect() {
        copy(String(row.original.id))

        toast.add({
          title: 'Task ID copied to clipboard!',
          color: 'success',
          icon: 'i-lucide-circle-check'
        })
      }
    },
    {
      label: 'Delete Task',
      onSelect() {
        taskStore.deleteTask(row.original.id);
      }
    },
    {
         label: row.original.completed ? 'Change to Pendind' : 'Change to completed',
         onSelect(){
        taskStore.toggleTask(row.original.id);
         }
    },
    {label: 'Update Task',
    onSelect(){
                 selectedTaskId.value = row.original.id;
         newTaskText.value = '';
         updateModalOpen.value = true;

    }
    }

  ]
}

const userColumns: TableColumn<User>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : ''
          ]
        },
        onClick: () => row.toggleExpanded()
      })
  },
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'username', header: 'Username' },
  { accessorKey: 'email', header: 'Email' },
]

const items = ref<ContextMenuItem[]>([])

function getRowItems(row: TableRow<User>) {
  return [
    {
      type: 'label' as const,
      label: 'Actions'
    },
    {
      label: 'Copy User ID',
      onSelect() {
        copy(String(row.original.id))

        toast.add({
          title: 'User ID copied to clipboard!',
          color: 'success',
          icon: 'i-lucide-circle-check'
        })
      }
    },
    {
      label: row.getIsExpanded() ? 'Collapse' : 'Expand',
      onSelect() {
        row.toggleExpanded()
      }
    },
    {
      label: 'Add task',
      onSelect(){
         selectedUserId.value = row.original.id
    newTaskText.value = ''
    createModalOpen.value = true
      }
    }
  ]
}

function onContextmenu(_e: Event, row: TableRow<User>) {
  items.value = getRowItems(row)
}

function getUsername(userId: number | null) {
  if (userId === null) return ''
  const user = userStore.users.find(u => u.id === userId)
  return user?.name;
}
function createTaskForUser() {
  if (selectedUserId.value !== null && newTaskText.value.trim()) {
    taskStore.addTask(newTaskText.value.trim(), selectedUserId.value)
    createModalOpen.value = false
    toast.add({
      title: 'Task added!',
      color: 'success',
      icon: 'i-lucide-check'
    })
  }
}

function updateTask() {
  if (selectedTaskId.value !== null && newTaskText.value.trim()) {
    taskStore.updateTask(selectedTaskId.value, newTaskText.value.trim())
    updateModalOpen.value = false
    toast.add({
      title: 'Task updated!',
      color: 'success',
      icon: 'i-lucide-check'
    })
  }
}
onMounted(() => {
  userStore.fetchUsers()
  taskStore.loadFromLocalStorage();
})
</script>

<template>
    <UApp>
     <UContextMenu :items="items">
  <UTable  loading
    loading-color="primary"
    loading-animation="carousel" :data="userStore.users" @contextmenu="onContextmenu" class="flex-1"
       :columns="userColumns">
    <template #expanded="{row}">
          <h2 class="text-sm font-medium mb-2">Tasks for {{ row.original.name }}</h2>
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
