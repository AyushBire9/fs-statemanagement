import { useAnecdoteActions } from '../store'

const AnecdoteForm = () => {
  const { add } = useAnecdoteActions()

  const createAnecdote = (event) => {
    event.preventDefault()
    const content = event.currentTarget.elements.namedItem('anecdote').value.trim()
    if (!content) return
    add(content)
    event.currentTarget.reset()
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
