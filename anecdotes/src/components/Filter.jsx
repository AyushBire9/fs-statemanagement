import { useAnecdoteActions, useFilter } from '../store'

const Filter = () => {
  const filter = useFilter()
  const { setFilter } = useAnecdoteActions()
  const style = { marginBottom: 10 }

  return (
    <div style={style}>
      filter{' '}
      <input
        data-testid="filter"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      />
    </div>
  )
}

export default Filter
