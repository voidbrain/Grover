import { expect, test } from '@playwright/test';

// B-015: the number fields of a calendar phase (doses and target ranges) overlapped their neighbours, because an
// input's intrinsic width (about 20 characters) kept it wider than its 9rem grid column.
test('the dose and range fields of a calendar phase do not overlap', async ({ page }) => {
  await page.goto('/setup/calendars/default');
  const phase = page.getByRole('region', { name: 'Phase 1' });
  await expect(phase).toBeVisible();
  const boxes = await phase.locator('input[type="number"]').evaluateAll((inputs) =>
    inputs.map((i) => {
      const r = i.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }),
  );
  expect(boxes.length).toBeGreaterThan(8);
  const overlaps: string[] = [];
  for (let a = 0; a < boxes.length; a++)
    for (let b = a + 1; b < boxes.length; b++) {
      const p = boxes[a]!;
      const q = boxes[b]!;
      if (p.left < q.right - 0.5 && q.left < p.right - 0.5 && p.top < q.bottom - 0.5 && q.top < p.bottom - 0.5)
        overlaps.push(`${a}/${b}`);
    }
  expect(overlaps).toEqual([]);
});
