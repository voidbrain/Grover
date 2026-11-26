import { expect, test } from '@playwright/test';

// The dev stack seeds the demo tent (apps/hub/src/seed.ts) and runs agent pi-1 with simulated hardware.
test('the dashboard renders the demo tent with its agent online', async ({ page }) => {
  await page.goto('/');
  const tent = page.getByRole('region', { name: /Tent 1/ });
  await expect(tent.getByRole('heading', { level: 2, name: /Tent 1/ })).toBeVisible();
  await expect(tent.getByRole('status').filter({ hasText: 'Agent pi-1' })).toHaveText(/Agent pi-1 online/);
  for (const section of ['Tent', 'Tanks', 'Pots'])
    await expect(tent.getByRole('heading', { level: 3, name: section, exact: true })).toBeVisible();
  for (const pot of ['Pot 1', 'Pot 2', 'Pot 3', 'Pot 4'])
    await expect(tent.getByText(pot, { exact: true }).first()).toBeVisible();
});
