import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAnecdote } from '../requests'
import { useNotification } from '../NotificationContext'

const AnecdoteForm = () => {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const mutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (created) => {
      queryClient.setQueryData(['anecdotes'], (previous = []) => [...previous, created])
      notify(`created '${created.content}'`)
    },
    onError: (error) => notify(error.message),
  })

  const onCreate = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const content = form.elements.namedItem('anecdote').value.trim()
    try {
      await mutation.mutateAsync(content)
      form.reset()
    } catch {
      // The mutation's onError callback displays the server error.
    }
  }

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input name="anecdote" />
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
