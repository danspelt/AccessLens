import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /AccessLens home/i })).toBeVisible();
  });

  test('explore page loads', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).toHaveURL(/\/explore/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('victoria city page loads', async ({ page }) => {
    await page.goto('/cities/victoria-bc');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('signin page loads', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByRole('form', { name: /sign in/i })).toBeVisible();
  });

  test('place detail loads when seeded', async ({ page }) => {
    const res = await page.request.get('/api/places?city=victoria-bc&limit=1');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    const place = data.places?.[0];
    test.skip(!place, 'No seeded places available');
    await page.goto(`/places/${place._id}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(place.name);
  });

  test('protected dashboard redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/signin/);
  });
});
