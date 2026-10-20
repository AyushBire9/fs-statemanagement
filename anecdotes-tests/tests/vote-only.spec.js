import { test, expect } from '@playwright/test'

test('voting increases only the selected anecdote count', async ({ page }) => {
  await page.goto('/')

  const first = page.getByText('If it hurts, do it more often', { exact: true }).locator('..')
  const second = page.getByText('Adding manpower to a late software project makes it later!', { exact: true }).locator('..')

  await expect(first).toContainText('has 0')
  await expect(second).toContainText('has 0')

  await first.getByRole('button', { name: 'vote' }).click()
  await expect(first).toContainText('has 1')
  await expect(second).toContainText('has 0')

  await first.getByRole('button', { name: 'vote' }).click()
  await expect(first).toContainText('has 2')
  await expect(second).toContainText('has 0')
})
