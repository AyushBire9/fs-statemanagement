import { test, expect } from '@playwright/test'

test('creates an anecdote with zero votes, without losing existing votes', async ({ page }) => {
  await page.goto('/')

  const existing = page.getByText('If it hurts, do it more often', { exact: true }).locator('..')
  await existing.getByRole('button', { name: 'vote' }).click()
  await expect(existing).toContainText('has 1')

  const input = page.locator('input[name="anecdote"]')
  await input.fill('Learning Zustand makes state easier')
  await page.getByRole('button', { name: 'create' }).click()

  const created = page.getByText('Learning Zustand makes state easier', { exact: true }).locator('..')
  await expect(created).toContainText('has 0')
  await expect(input).toHaveValue('')
  await expect(existing).toContainText('has 1')

  await created.getByRole('button', { name: 'vote' }).click()
  await expect(created).toContainText('has 1')
})

test('ignores empty anecdotes', async ({ page }) => {
  await page.goto('/')
  const initialCount = await page.getByRole('button', { name: 'vote' }).count()
  await page.locator('input[name="anecdote"]').fill('   ')
  await page.getByRole('button', { name: 'create' }).click()
  await expect(page.getByRole('button', { name: 'vote' })).toHaveCount(initialCount)
})
