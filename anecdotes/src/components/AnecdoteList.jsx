import { useAnecdotes, useAnecdoteActions } from '../store'

const AnecdoteList = () => {
  const anecdotes = useAnecdotes()
  const { vote, remove } = useAnecdoteActions()

  const onVote = (id) => {
    vote(id).catch((error) => console.error('Could not save vote', error))
  }
  const onDelete = (id) => {
    remove(id).catch((error) => console.error('Could not delete anecdote', error))
  }

  return (
    <>
      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button type="button" onClick={() => onVote(anecdote.id)}>vote</button>
            {anecdote.votes === 0 && (
              <button type="button" onClick={() => onDelete(anecdote.id)}>delete</button>
            )}
          </div>
        </div>
      ))}
    </>
  )
}

export default AnecdoteList
