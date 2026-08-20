import { useClipboard } from '@vueuse/core'

export function useTaskHelpers() {
  const taskStore = useTaskStore()
  const toast = useToast()
  const { copy } = useClipboard()


}
