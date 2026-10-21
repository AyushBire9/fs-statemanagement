import { useAnecdoteActions } from '../store'

const AnecdoteForm = () => {
  const { add } = useAnecdoteActions()

  const createAnecdote = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const content = form.elements.namedItem('anecdote').value.trim()
    if (!content) return
    try {
      await add(content)
      form.reset()
    } catch (error) {
      console.error('Could not save anecdote', error)
    }
  }

  return (
    <>
      <h2>create new</h2>
      <form onSubmit={createAnecdote}>
        <div>
          <input name="anecdote" data-testid="new" />
        </div>
        <button type="submit">create</button>
      </form>
    </>
  )
}

export default AnecdoteForm
