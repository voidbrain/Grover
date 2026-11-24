import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Hub } from '../hub';
import { RigMap } from './rig-map';

const now = Date.now();
const probe = (id: string, kind: string, extra: object = {}) => ({
  id,
  roomId: 'grow-1',
  potId: null,
  kind,
  name: id,
  enabled: true,
  binding: { driver: 'mock' },
  tank: null,
  alertBelow: null,
  alertAbove: null,
  calibration: null,
  ...extra,
});
const actuator = (id: string, kind: string, extra: object = {}) => ({
  id,
  roomId: 'grow-1',
  potId: null,
  kind,
  name: id,
  enabled: true,
  binding: { driver: 'mock' },
  maxRunMs: 30_000,
  mlPerSecond: null,
  ...extra,
});
const units = { unit: '', min: 0, max: 100, title: '' };

const snapshot = {
  rooms: [{ id: 'grow-1', name: 'Tent', mode: 'normal', agentId: 'pi-1', phase: null, autoFeed: false }],
  agents: [{ agentId: 'pi-1', roomId: 'grow-1', online: true, lastSeen: now, status: null, configCurrent: true }],
  pots: [{ id: 'pot-1', roomId: 'grow-1', name: 'Pot 1', liters: 15, feedLiters: 2, litersPerCm: 0.5 }],
  probes: [
    probe('tank-grow', 'water_level', { tank: 'grow', alertBelow: 3 }),
    probe('tank-mix', 'water_level', { tank: 'mix' }),
    probe('pot-1-level', 'water_level', { potId: 'pot-1' }),
    probe('ph', 'ph'),
  ],
  actuators: [
    actuator('light', 'light', { maxRunMs: 0 }),
    actuator('pump-grow', 'pump_grow'),
    actuator('pot-1-feed', 'pump_transfer', { potId: 'pot-1' }),
    actuator('pot-1-loop', 'water_loop', { potId: 'pot-1', maxRunMs: 0 }),
  ],
  latest: [
    { probeId: 'tank-grow', value: 2, at: now },
    { probeId: 'pot-1-level', value: 20, at: now },
  ],
  alerts: [{ key: 'feed:pot-1', roomId: 'grow-1', potId: 'pot-1', level: 'bad', message: 'feed stopped', since: now }],
  feeds: [],
  potPhases: {},
  plants: [{ id: 'nl', name: 'NL g2', potId: 'pot-1', harvestedOn: null }],
  strains: [],
  breeders: [],
  probeKinds: {
    water_level: { ...units, unit: 'cm' },
    ph: { ...units, unit: 'pH' },
    ec: units,
    water_temperature: units,
    air_temperature: units,
  },
};

/** The rig map draws the tent from its setup, with live state and the dashboard's controls (F-015). */
describe('RigMap', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<RigMap>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RigMap],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RigMap);
    fixture.componentRef.setInput('id', 'grow-1');
    fixture.detectChanges();
    for (const r of http.match('/api/snapshot')) r.flush(snapshot);
    const hub = TestBed.inject(Hub);
    hub.snapshot.set(snapshot as never);
    hub.connected.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('draws every supply tank, the mixing tank and each pot from the setup, with state on the parts', () => {
    const tanks = [...el.querySelectorAll('.node.tank')];
    expect(tanks.length).toBe(6); // water, grow, micro, bloom, ripen, pH down
    const grow = tanks.find((t) => t.textContent!.includes('Grow'))!;
    expect(grow.getAttribute('data-low')).toBe('true');
    expect(grow.textContent).toContain('Low: refill');
    expect(tanks.find((t) => t.textContent!.includes('Micro'))!.textContent).toContain('No pump');
    expect(el.querySelector('.node.mix')!.textContent).toContain('Idle');
    const pot = el.querySelector('.node.pot')!;
    expect(pot.textContent).toContain('NL g2');
    expect(pot.getAttribute('data-alert')).toBe('bad');
    expect(pot.textContent).toContain('feed stopped');
    expect(pot.querySelector('[role=switch]')).not.toBeNull();
    expect(el.querySelector('.alerts')).toBeNull();
  });

  it('runs a supply pump through the hub, and disables Run while it waits', async () => {
    const grow = [...el.querySelectorAll('.node.tank')].find((t) => t.textContent!.includes('Grow'))!;
    const run = [...grow.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Run')!;
    run.click();
    fixture.detectChanges();
    const req = http.expectOne('/api/actuators/pump-grow/run');
    expect(req.request.body).toEqual({ durationMs: 2000 });
    expect(run.disabled).toBe(true);
    req.flush({ commandId: 'c', ok: true, error: null, value: 2000 });
  });
});
