import { test, expect } from '@playwright/test'

const firstVisibleAnecdote = (page) =>
  page.getByRole('button', { name: 'vote' }).first()
    .locator('xpath=../preceding-sibling::div')

test('most-voted anecdotes move to the top in descending order', async ({ page }) => {
  await page.goto('/')

  const topContent = 'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.'
  const secondContent = 'Premature optimization is the root of all evil.'

  const firstAnecdote = page.getByText(topContent, { exact: true }).locator('..')
  const secondAnecdote = page.getByText(secondContent, { exact: true }).locator('..')

  // Initially every anecdote has zero votes.
  await expect(firstVisibleAnecdote(page)).toHaveText('If it hurts, do it more often')

  // A vote must cause the last anecdote to rise to first place.
  await firstAnecdote.getByRole('button', { name: 'vote' }).click()
  await expect(firstAnecdote).toContainText('has 1')
  await expect(firstVisibleAnecdote(page)).toHaveText(topContent)

  // Two votes for another anecdote should put it above the 1-vote anecdote.
  await secondAnecdote.getByRole('button', { name: 'vote' }).click()
  await secondAnecdote.getByRole('button', { name: 'vote' }).click()
  await expect(firstVisibleAnecdote(page)).toHaveText(secondContent)
  await expect(secondAnecdote).toContainText('has 2')
  await expect(firstAnecdote).toContainText('has 1')
})

test('new anecdotes are displayed and can rise by votes', async ({ page }) => {
  await page.goto('/')
  const content = 'A new sorting anecdote'
  await page.locator('input[name="anecdote"]').fill(content)
  await page.getByRole('button', { name: 'create' }).click()

  const created = page.getByText(content, { exact: true }).locator('..')
  await expect(created).toContainText('has 0')
  await created.getByRole('button', { name: 'vote' }).click()
  await expect(created).toContainText('has 1')
  await expect(firstVisibleAnecdote(page)).toHaveText(content)
})
