export const useTaskStore = defineStore('task', () => {
  const taskList = ref<Task[]>([])
  const nextId = ref(1)

  function loadFromLocalStorage() {
    if (import.meta.client) {
      const stored = localStorage.getItem('tasks')
      if (stored) {
        try {
          taskList.value = JSON.parse(stored)
          if (taskList.value.length > 0) {
            nextId.value = Math.max(...taskList.value.map(t => t.id)) + 1
          } else {
            nextId.value = 1
          }
        } catch (e) {
          console.warn('Failed to parse tasks', e)
          taskList.value = []
          nextId.value = 1
        }
      }
    }
  }

  function saveTasks() {
    if (import.meta.client) {
      localStorage.setItem('tasks', JSON.stringify(taskList.value))
    }
  }

  function addTask(text: string, userId: number) {
    taskList.value.push({
      id: nextId.value++,
      text,
      completed: false,
      createdAt: new Date(),
      userId,
    })
    saveTasks()
  }

  function toggleTask(id: number) {
    const task = taskList.value.find(t => t.id === id)
    if (task) {
      task.completed = !task.completed
      saveTasks()
    }
  }

  function deleteTask(id: number) {
    taskList.value = taskList.value.filter(t => t.id !== id)
    saveTasks()
  }

  function updateTask(id: number, text: string) {
    const task = taskList.value.find(t => t.id === id)
    if (task) {
      task.text = text
      saveTasks()
    }
  }

  return {
    taskList,
    loadFromLocalStorage,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
  }
})