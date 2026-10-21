const baseUrl = 'http://localhost:3001/anecdotes'

const request = async (url, options) => {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }
  if (response.status === 204) return null
  return response.json()
}

const getAll = () => request(baseUrl)

const createNew = (content) => request(baseUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content, votes: 0 }),
})

const update = (id, anecdote) => request(`${baseUrl}/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(anecdote),
})

const remove = (id) => request(`${baseUrl}/${id}`, {
  method: 'DELETE',
})

export default { getAll, createNew, update, remove }
