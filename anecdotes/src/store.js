import { create } from 'zustand'
import anecdoteService from './services/anecdotes'
import { useNotificationStore } from './notificationStore'

// Serialize votes for the same anecdote so rapid clicks cannot overwrite votes.
const pendingVotes = new Map()
const notify = (message) => useNotificationStore.getState().actions.show(message)

const useAnecdoteStore = create((set, get) => ({
  anecdotes: [],
  filter: '',
  actions: {
    initialize: async () => {
      const anecdotes = await anecdoteService.getAll()
      set({ anecdotes })
    },
    setFilter: (filter) => set({ filter }),
    add: async (content) => {
      const anecdote = await anecdoteService.createNew(content)
      set((state) => ({ anecdotes: [...state.anecdotes, anecdote] }))
      notify(`you added '${anecdote.content}'`)
      return anecdote
    },
    vote: async (id) => {
      const previous = pendingVotes.get(id) ?? Promise.resolve()
      const current = previous.catch(() => {}).then(async () => {
        const anecdote = get().anecdotes.find((item) => item.id === id)
        if (!anecdote) return
        const updated = await anecdoteService.update(id, {
          ...anecdote,
          votes: anecdote.votes + 1,
        })
        set((state) => ({
          anecdotes: state.anecdotes.map((item) => item.id === id ? updated : item),
        }))
        notify(`you voted '${anecdote.content}'`)
      })
      pendingVotes.set(id, current)
      try {
        await current
      } finally {
        if (pendingVotes.get(id) === current) pendingVotes.delete(id)
      }
    },
    remove: async (id) => {
      const anecdote = get().anecdotes.find((item) => item.id === id)
      if (!anecdote || anecdote.votes !== 0) return false
      await anecdoteService.remove(id)
      set((state) => ({
        anecdotes: state.anecdotes.filter((item) => item.id !== id),
      }))
      return true
    },
  },
}))

// Read the two fields separately: returning a new filtered array from a
// Zustand selector would cause needless rerenders (or a selector loop).
export const useAnecdotes = () => {
  const anecdotes = useAnecdoteStore((state) => state.anecdotes)
  const filter = useAnecdoteStore((state) => state.filter)
  return anecdotes
    .filter((anecdote) => anecdote.content.toLowerCase().includes(filter.toLowerCase()))
    .toSorted((a, b) => b.votes - a.votes)
}

export const useFilter = () => useAnecdoteStore((state) => state.filter)
export const useAnecdoteActions = () => useAnecdoteStore((state) => state.actions)

export default useAnecdoteStore
