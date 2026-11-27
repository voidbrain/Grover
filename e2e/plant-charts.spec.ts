import { expect, test } from '@playwright/test';

// F-029: the plant page draws its readings with the 🧱 bricks line chart and what the feeds gave per day with the
// bricks stacked bar chart; each chart keeps a data table as its text alternative. The demo plant in pot 3 is
// "NL5xHaze gen 2" (apps/hub/src/seed.ts); the shared EC probe measures its pot.
test('the plant page shows its bricks charts and their data tables', async ({ page, request }) => {
  // One EC reading, so the EC chart has a point; the agent may still be connecting.
  await expect.poll(async () => (await request.post('/api/probes/ec/read', { data: {} })).ok()).toBe(true);
  await page.goto('/plants/nl5h-gen2');

  for (const name of ['Level', 'EC', 'pH', 'Water temperature', 'Given per day'])
    await expect(page.getByRole('figure', { name, exact: true })).toBeVisible();

  const ec = page.getByRole('figure', { name: 'EC', exact: true });
  await expect(ec.getByRole('button').first()).toHaveAttribute('aria-label', /^EC, \d{4}-\d\d-\d\d \d\d:\d\d: /);
  await ec.getByText('Data table').click();
  await expect(ec.getByRole('table').getByRole('row')).not.toHaveCount(0);
  await expect(ec.getByRole('columnheader', { name: 'Time' })).toBeVisible();

  await expect(page.getByRole('figure', { name: 'Given per day' })).toContainText('No feeds in this range.');
});
