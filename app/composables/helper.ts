import type { TableColumn, TableRow } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import { h, resolveComponent } from 'vue'

export function useTaskActions() {
  const taskStore = useTaskStore()
  const userStore = useUserStore()

  const toast = useToast()
  const { copy } = useClipboard()

  const UButton = resolveComponent('UButton')
  const UBadge = resolveComponent('UBadge')
  const UDropdownMenu = resolveComponent('UDropdownMenu')

  const createModalOpen = ref(false)
  const updateModalOpen = ref(false)

  const selectedUserId = ref<number | null>(null)
  const selectedTaskId = ref<number | null>(null)

  const newTaskText = ref('')

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
        label: row.original.completed
          ? 'Change to Pending'
          : 'Change to Completed',

        onSelect() {
          taskStore.toggleTask(row.original.id)
        },
      },

      {
        label: 'Update Task',

        onSelect() {
          selectedTaskId.value = row.original.id
          newTaskText.value = ''
          updateModalOpen.value = true
        },
      },
    ]
  }

  const taskColumns: TableColumn<Task>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },

    {
      accessorKey: 'text',
      header: 'Task',
    },

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
          () =>
            row.getValue('completed')
              ? 'Done'
              : 'Pending',
        ),
    },

    {
      accessorKey: 'createdAt',
      header: 'Creation Date',
    },

    {
      id: 'actions',

      meta: {
        class: {
          td: 'text-right',
        },
      },

      cell: ({ row }) =>
        h(
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
        ),
    },
  ]

  function updateTask() {
    if (
      selectedTaskId.value !== null
      && newTaskText.value.trim()
    ) {
      taskStore.updateTask(
        selectedTaskId.value,
        newTaskText.value.trim(),
      )

      updateModalOpen.value = false

      toast.add({
        title: 'Task updated!',
        color: 'success',
        icon: 'i-lucide-check',
      })
    }
  }

  function openUpdateModal(taskId: number) {
    selectedTaskId.value = taskId
    newTaskText.value = ''
    updateModalOpen.value = true
  }

  function openCreateModal(userId?: number) {
    selectedUserId.value = userId ?? null
    newTaskText.value = ''
    createModalOpen.value = true
  }

  function createTaskForUser() {
    if (
      selectedUserId.value !== null
      && newTaskText.value.trim()
    ) {
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
  }

  function getTasksForUser(userId: number) {
    return taskStore.taskList.filter(
      task => task.userId === userId,
    )
  }

  function getUsername(userId: number | null) {
    if (userId === null)
      return ''

    return userStore.users.find(
      user => user.id === userId,
    )?.name ?? ''
  }

  return {
    createModalOpen,
    updateModalOpen,

    selectedUserId,
    selectedTaskId,

    newTaskText,

    taskColumns,

    getTaskRowItems,
    getTasksForUser,
    getUsername,

    openCreateModal,
    openUpdateModal,

    createTaskForUser,
    updateTask,
  }
}
