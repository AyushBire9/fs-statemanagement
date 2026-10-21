import { test, expect } from '@playwright/test'

test('form remains unchanged while votes update the list', async ({ page }) => {
  await page.goto('/')

  const input = page.locator('input[name="anecdote"]')
  await input.fill('Separation of components works')

  const anecdote = page.getByText('If it hurts, do it more often', { exact: true }).locator('..')
  await anecdote.getByRole('button', { name: 'vote' }).click()

  await expect(anecdote).toContainText('has 1')
  await expect(input).toHaveValue('Separation of components works')

  await page.getByRole('button', { name: 'create' }).click()
  const created = page.getByText('Separation of components works', { exact: true }).locator('..')
  await expect(created).toContainText('has 0')
  await expect(input).toHaveValue('')
  await expect(anecdote).toContainText('has 1')
})
