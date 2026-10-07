import { expect, test } from '@playwright/test';

test.describe('Public Playground & Careers', () => {
  test('Playground loads hero and post list from CMS or fallback', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.getByTestId('playground-page')).toBeVisible();
    await expect(page.getByTestId('playground-hero-subtitle')).not.toBeEmpty();
    const posts = page.getByTestId('playground-post-item');
    await expect(posts.first()).toBeVisible();
    await expect(posts).toHaveCount(5);

    await posts.first().click();
    await expect(page.getByRole('button', { name: 'Back to Playground' })).toBeVisible();
  });

  test('Careers lists roles and opens application modal', async ({ page }) => {
    await page.goto('/careers');
    await expect(page.getByTestId('careers-page')).toBeVisible();
    await expect(page.getByTestId('careers-hero-subtitle')).not.toBeEmpty();

    const jobs = page.getByTestId('careers-job-item');
    await expect(jobs.first()).toBeVisible();
    await expect(jobs).toHaveCount(5);

    await jobs.first().click();
    await expect(page.getByTestId('careers-job-detail')).toBeVisible();
    await page.getByTestId('careers-apply-open').click();
    await expect(page.getByTestId('careers-apply-modal')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit Application' })).toBeVisible();
  });
});
