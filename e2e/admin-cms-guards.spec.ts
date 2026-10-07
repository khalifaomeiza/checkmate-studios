import { expect, test } from '@playwright/test';

const protectedRoutes = [
  '/admin/playground',
  '/admin/careers',
  '/admin/applications'
];

test.describe('Admin CMS routes', () => {
  for (const route of protectedRoutes) {
    test(`redirects unauthenticated users from ${route} to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByTestId('admin-login-page')).toBeVisible();
    });
  }

  test('admin login page renders sign-in form', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByTestId('admin-login-submit')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });
});
