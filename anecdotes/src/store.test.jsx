import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, renderHook, screen, fireEvent } from '@testing-library/react'
import { afterEach } from 'vitest'
import anecdoteService from './services/anecdotes'
import useAnecdoteStore, { useAnecdotes, useAnecdoteActions } from './store'
import AnecdoteList from './components/AnecdoteList'
import Filter from './components/Filter'

vi.mock('./services/anecdotes', () => ({
  default: {
    getAll: vi.fn(),
    createNew: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const fixture = [
  { id: 'a', content: 'Testing is valuable', votes: 2 },
  { id: 'b', content: 'Readability matters', votes: 5 },
  { id: 'c', content: 'Testing is a skill', votes: 0 },
]

beforeEach(() => {
  useAnecdoteStore.setState({ anecdotes: [], filter: '' })
  vi.clearAllMocks()
})

afterEach(() => cleanup())

describe('Zustand anecdote store and hooks', () => {
  it('initializes state from the exact backend response', async () => {
    anecdoteService.getAll.mockResolvedValue(fixture)
    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await result.current.initialize()
    })

    expect(anecdoteService.getAll).toHaveBeenCalledTimes(1)
    expect(useAnecdoteStore.getState().anecdotes).toEqual(fixture)
  })

  it('returns anecdotes sorted by number of votes, highest first', () => {
    useAnecdoteStore.setState({ anecdotes: fixture })
    const { result } = renderHook(() => useAnecdotes())

    expect(result.current.map((anecdote) => anecdote.id)).toEqual(['b', 'a', 'c'])
    // Sorting for display must never modify the array kept in the store.
    expect(useAnecdoteStore.getState().anecdotes.map((anecdote) => anecdote.id))
      .toEqual(['a', 'b', 'c'])
  })

  it('passes anecdotes to the list in descending vote order', () => {
    useAnecdoteStore.setState({ anecdotes: fixture })
    render(<AnecdoteList />)

    const contentInOrder = screen.getAllByRole('button', { name: 'vote' })
      .map((button) => button.parentElement.previousElementSibling.textContent)
    expect(contentInOrder).toEqual([
      'Readability matters',
      'Testing is valuable',
      'Testing is a skill',
    ])
  })

  it('filters the list by content without losing sorted vote order', () => {
    useAnecdoteStore.setState({ anecdotes: fixture })
    render(<><Filter /><AnecdoteList /></>)

    fireEvent.change(screen.getByTestId('filter'), { target: { value: 'TESTING' } })

    const displayed = screen.getAllByRole('button', { name: 'vote' })
      .map((button) => button.parentElement.previousElementSibling.textContent)
    expect(displayed).toEqual(['Testing is valuable', 'Testing is a skill'])
    expect(screen.queryByText('Readability matters')).toBeNull()
  })

  it('voting increments exactly one anecdote and persists it through the service', async () => {
    useAnecdoteStore.setState({ anecdotes: fixture })
    anecdoteService.update.mockImplementation(async (_id, update) => update)
    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await result.current.vote('a')
    })

    expect(anecdoteService.update).toHaveBeenCalledWith('a', {
      id: 'a', content: 'Testing is valuable', votes: 3,
    })
    expect(useAnecdoteStore.getState().anecdotes.map((item) => item.votes))
      .toEqual([3, 5, 0])
  })

  it('adds the anecdote returned by the backend', async () => {
    useAnecdoteStore.setState({ anecdotes: fixture })
    const created = { id: 'new', content: 'New wisdom', votes: 0 }
    anecdoteService.createNew.mockResolvedValue(created)
    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await result.current.add('New wisdom')
    })

    expect(anecdoteService.createNew).toHaveBeenCalledWith('New wisdom')
    expect(useAnecdoteStore.getState().anecdotes).toContainEqual(created)
  })

  it('deletes only anecdotes with zero votes', async () => {
    useAnecdoteStore.setState({ anecdotes: fixture })
    anecdoteService.remove.mockResolvedValue(null)
    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      expect(await result.current.remove('a')).toBe(false)
      expect(await result.current.remove('c')).toBe(true)
    })

    expect(anecdoteService.remove).toHaveBeenCalledOnce()
    expect(anecdoteService.remove).toHaveBeenCalledWith('c')
    expect(useAnecdoteStore.getState().anecdotes.map((item) => item.id))
      .toEqual(['a', 'b'])
  })
})
