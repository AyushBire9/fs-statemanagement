import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAnecdotes, updateAnecdote } from './requests'
import { useNotification } from './NotificationContext'
import AnecdoteForm from './components/AnecdoteForm'
import Notification from './components/Notification'

const App = () => {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const anecdotesQuery = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    retry: false,
  })

  const voteMutation = useMutation({
    // Serializing ensures two quick votes use successive server values.
    scope: { id: 'vote-anecdotes' },
    mutationFn: async (id) => {
      const anecdotes = queryClient.getQueryData(['anecdotes']) || []
      const current = anecdotes.find((item) => item.id === id)
      if (!current) throw new Error('Anecdote was not found')
      return updateAnecdote({ ...current, votes: current.votes + 1 })
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['anecdotes'], (previous = []) =>
        previous.map((item) => item.id === updated.id ? updated : item)
      )
      notify(`you voted '${updated.content}'`)
    },
    onError: (error) => notify(error.message),
  })

  if (anecdotesQuery.isPending) return <div>loading data...</div>
  if (anecdotesQuery.isError) {
    return <div>anecdote service not available due to problems in server</div>
  }

  return (
    <div>
      <h3>Anecdote app</h3>
      <Notification />
      <AnecdoteForm />
      {anecdotesQuery.data.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button type="button" onClick={() => voteMutation.mutate(anecdote.id)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
