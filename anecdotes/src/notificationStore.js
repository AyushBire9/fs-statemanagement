import { create } from 'zustand'

let notificationTimeout

export const useNotificationStore = create((set) => ({
  message: null,
  actions: {
    show: (message) => {
      clearTimeout(notificationTimeout)
      set({ message })
      notificationTimeout = setTimeout(() => set({ message: null }), 5000)
    },
    clear: () => {
      clearTimeout(notificationTimeout)
      set({ message: null })
    },
  },
}))

export const useNotification = () => useNotificationStore((state) => state.message)
