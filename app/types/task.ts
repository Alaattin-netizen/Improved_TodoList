declare global {

  export interface Task {
    id: number
    userId: number
    text: string
    completed: boolean
    createdAt: string
  }
}
