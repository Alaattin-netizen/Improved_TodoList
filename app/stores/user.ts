
export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])

  function loadFromLocalStorage() {
    if (import.meta.client) {
      const stored = localStorage.getItem('users')
      if (stored) {
        try {
          users.value = JSON.parse(stored)
          return true 
        } catch (e) {
          console.warn('Failed to parse users from localStorage', e)
        }
      }
    }
    return false
  }

  function saveToLocalStorage() {
    if (import.meta.client) {
      localStorage.setItem('users', JSON.stringify(users.value))
    }
  }

  async function fetchUsers() {
    if (users.value.length) return

    if (loadFromLocalStorage()) return

   
    try {
      const data = await $fetch<User[]>('https://jsonplaceholder.typicode.com/users')
      users.value = data.map(({ id, name, username, email }) => ({
      id,
      name,
      username,
      email,
    }))
      saveToLocalStorage() 
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
    }
  }

  function updateUser(updatedUser: User) {
    const index = users.value.findIndex(u => u.id === updatedUser.id)
    if (index !== -1) {
      users.value[index] = updatedUser
      saveToLocalStorage()
    }
  }

  return {
    users,
    fetchUsers,
    loadFromLocalStorage,
    saveToLocalStorage,
    updateUser,
  }
})