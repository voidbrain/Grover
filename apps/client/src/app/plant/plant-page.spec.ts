import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { PlantReport } from '@grover/contracts';
import { Hub } from '../hub';
import { PlantPage } from './plant-page';

const plant = {
  id: 'nl-g2',
  name: 'NL g2',
  strainId: null,
  breederId: null,
  generation: 2,
  motherId: null,
  potId: 'pot-3',
  medium: 'hydro' as const,
  startedOn: '2026-10-01',
  placedOn: '2026-10-20',
  trimmedOn: null,
  bloomOn: null,
  flushOn: null,
  harvestedOn: null,
  yieldGrams: null,
  notes: '',
};

const report = (over: Partial<PlantReport> = {}): PlantReport => ({
  plantId: 'nl-g2',
  potId: 'pot-3',
  from: '2026-10-20',
  to: '2026-11-24',
  fromMs: Date.parse('2026-10-19T22:00:00Z'),
  toMs: Date.parse('2026-11-24T23:00:00Z'),
  timeline: [
    {
      index: 1,
      name: 'Veg growth',
      from: '2026-10-20',
      to: '2026-11-24',
      ec: { min: 1, max: 1.6 },
      ph: { min: 5.8, max: 6.2 },
      waterLevel: { min: 10, max: 30 },
      waterTemp: { min: 18, max: 22 },
      fromMs: Date.parse('2026-10-19T22:00:00Z'),
      toMs: Date.parse('2026-11-24T23:00:00Z'),
    },
  ],
  series: { level: [], ec: [{ at: Date.parse('2026-11-01T10:00:00'), value: 1.2 }], ph: [], waterTemp: [] },
  markers: [{ kind: 'placed', day: '2026-10-20', at: Date.parse('2026-10-19T22:00:00Z') }],
  stats: {
    daysInTent: 35,
    feeds: 4,
    waterLiters: 6.5,
    nutrientMl: { grow: 12, micro: 6 },
    ecInRange: 0.75,
    phInRange: null,
    yieldGrams: null,
  },
  feeds: [],
  alerts: [],
  ...over,
});

/** Lets the resource's loader issue its request (whenStable would wait for the answer). */
const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise((r) => setTimeout(r));
};

/** The plant page against the hub's report: what it shows, and that the range is asked of the hub. */
describe('PlantPage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    snapshot = {
      plants: [plant],
      strains: [],
      breeders: [],
      pots: [{ id: 'pot-3', name: 'Pot 3' }],
      feeds: [],
    };
  });

  let snapshot: object;
  /** The page for nl-g2 with `body` as its report. */
  async function render(body: PlantReport): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(PlantPage);
    fixture.componentRef.setInput('id', 'nl-g2');
    fixture.detectChanges();
    await settle();
    answerSnapshot();
    fixture.detectChanges();
    await settle();
    answerReport('all', body);
    fixture.detectChanges();
    await settle();
    return fixture.nativeElement as HTMLElement;
  }
  /** Answers the report requests for `range` (one before the snapshot arrived, one after). */
  function answerReport(range: string, body: PlantReport): void {
    const reqs = http.match((r) => r.url === '/api/plants/nl-g2/report' && r.params.get('range') === range);
    expect(reqs.length).toBeGreaterThan(0);
    for (const r of reqs) r.flush(body);
    TestBed.tick();
  }
  /** The Hub service asks for a snapshot on start; answer with the test's. */
  function answerSnapshot(): void {
    for (const r of http.match('/api/snapshot')) r.flush(snapshot);
    TestBed.inject(Hub).snapshot.set(snapshot as never);
  }

  it('shows the statistics and doses, and asks the hub for the chosen range', async () => {
    const fixture = TestBed.createComponent(PlantPage);
    fixture.componentRef.setInput('id', 'nl-g2');
    fixture.detectChanges();
    await settle();
    answerSnapshot();
    fixture.detectChanges();
    await settle();
    answerReport('all', report());
    fixture.detectChanges();
    await settle();
    const el = fixture.nativeElement as HTMLElement;
    const text = el.textContent!.replace(/\s+/g, ' ');
    expect(text).toContain('NL g2');
    expect(text).toContain('2nd cutting');
    expect(text).toContain('in Pot 3');
    const tiles = [...el.querySelectorAll('.tile')].map((t) =>
      [...t.querySelectorAll('span')].map((x) => x.textContent!.trim()).join(' '),
    );
    expect(tiles).toContain('35 days');
    expect(tiles).toContain('75% EC in range');
    expect(tiles).toContain('– pH in range');
    expect(el.querySelectorAll('.doses li').length).toBe(2);
    expect(el.querySelectorAll('bx-line-chart').length).toBe(4);

    const week = [...el.querySelectorAll<HTMLInputElement>('input[name=plant-range]')][1]!;
    week.click();
    fixture.detectChanges();
    await settle();
    answerReport('week', report());
  });

  it('draws the readings as bricks line charts labelled in local time', async () => {
    const el = await render(report());
    const ec = [...el.querySelectorAll('bx-line-chart')].find((c) => c.querySelector('.title')?.textContent === 'EC')!;
    expect(ec.querySelector('[role=button]')!.getAttribute('aria-label')).toBe('EC, 2026-11-01 10:00: 1.2 mS/cm');
    const from = new Date(report().fromMs);
    const day = `${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`;
    expect(ec.querySelector('text.tick:not([text-anchor])')!.textContent!.trim()).toBe(day);
    expect(ec.querySelectorAll('rect.band').length).toBe(1);
    expect(ec.querySelectorAll('line.marker').length).toBe(1);
  });

  it('stacks what the feeds gave per day, and says so when there were none', async () => {
    const given = new Date(2026, 10, 1, 9).getTime();
    const done = {
      feedId: 'f1',
      roomId: 'tent-1',
      potId: 'pot-3',
      source: 'manual' as const,
      state: 'done' as const,
      message: '',
      requestedAt: given,
      finishedAt: given,
      batchLiters: 1.5,
      ml: { water: 1480, grow: 12, micro: 6 },
      ecBefore: null,
      phBefore: null,
      ecAfter: null,
      phAfter: null,
      potLitersBefore: null,
      expectedEc: null,
      expectedPh: null,
    };
    const el = await render(report({ feeds: [done] }));
    const chart = el.querySelector('bx-stacked-bar-chart')!;
    expect(chart.querySelector('.title')!.textContent).toBe('Given per day');
    expect([...chart.querySelectorAll('[role=button]')].map((s) => s.getAttribute('aria-label'))).toEqual([
      'Grow, 11-01: 12 mL (66.7 %)',
      'Micro, 11-01: 6 mL (33.3 %)',
    ]);

    const none = await render(report({ feeds: [] }));
    expect(none.querySelector('bx-stacked-bar-chart')!.textContent).toContain('No feeds in this range.');
  });

  it('says so when the plant has no pot yet', async () => {
    const fixture = TestBed.createComponent(PlantPage);
    fixture.componentRef.setInput('id', 'nl-g2');
    fixture.detectChanges();
    await settle();
    answerSnapshot();
    fixture.detectChanges();
    await settle();
    answerReport('all', report({ potId: null }));
    fixture.detectChanges();
    await settle();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Not placed in a pot yet');
  });
});
