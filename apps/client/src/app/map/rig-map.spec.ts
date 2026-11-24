import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Hub } from '../hub';
import { actuator, now, snapshot } from '../testing/rig-snapshot';
import { RigMap } from './rig-map';

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
  });

  async function mount(change: (s: typeof snapshot) => object = (s) => s): Promise<void> {
    const snap = change(structuredClone(snapshot));
    fixture = TestBed.createComponent(RigMap);
    fixture.componentRef.setInput('id', 'grow-1');
    fixture.detectChanges();
    for (const r of http.match('/api/snapshot')) r.flush(snap);
    const hub = TestBed.inject(Hub);
    hub.snapshot.set(snap as never);
    hub.connected.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  }
  const node = (selector: string, text: string) =>
    [...el.querySelectorAll(selector)].find((n) => n.textContent!.includes(text))!;
  const button = (scope: Element, label: string) =>
    [...scope.querySelectorAll('button')].find((b) => b.textContent!.trim().endsWith(label))!;

  it('draws every supply tank, the mixing tank and each pot from the setup, with state on the parts', async () => {
    await mount();
    const tanks = [...el.querySelectorAll('.node.tank')];
    expect(tanks.length).toBe(6); // water, grow, micro, bloom, ripen, pH down
    const grow = node('.node.tank', 'Grow');
    expect(grow.getAttribute('data-alert')).toBe('bad');
    expect(grow.textContent).toContain('Low: refill');
    expect(node('.node.tank', 'Micro').textContent).toContain('No pump');
    // Nutrient colours (F-017): the tent's own, else the default.
    expect(grow.querySelector<HTMLElement>('.swatch')!.style.background).toBe('rgb(26, 127, 55)');
    expect(node('.node.tank', 'Bloom').querySelector<HTMLElement>('.swatch')!.style.background).not.toBe('');
    expect(el.querySelector('.node.mix')!.textContent).toContain('Idle');
    const pot = el.querySelector('.node.pot')!;
    expect(pot.textContent).toContain('NL g2');
    expect(pot.getAttribute('data-alert')).toBe('bad');
    expect(pot.textContent).toContain('feed stopped');
    expect(pot.querySelector('[role=switch]')).not.toBeNull();
    expect(el.querySelector('.alerts')).toBeNull();
  });

  it('shows the words of an alert on the tank it concerns, and others above', async () => {
    await mount((s) => ({
      ...s,
      alerts: [
        {
          key: 'probe:tank-grow:below',
          roomId: 'grow-1',
          potId: null,
          level: 'warn',
          message: 'Grow tank low: refill it',
          since: now,
        },
        {
          key: 'probe:tank-mix:above',
          roomId: 'grow-1',
          potId: null,
          level: 'warn',
          message: 'Mixing tank above 30 cm',
          since: now,
        },
        {
          key: 'agent:pi-2',
          roomId: 'grow-1',
          potId: null,
          level: 'bad',
          message: 'Agent pi-2 is offline',
          since: now,
        },
      ],
    }));
    expect(node('.node.tank', 'Grow').textContent).toContain('Grow tank low: refill it');
    expect(el.querySelector('.node.mix')!.textContent).toContain('Mixing tank above 30 cm');
    const top = el.querySelector('.alerts')!.textContent!;
    expect(top).toContain('Agent pi-2 is offline');
    expect(top).not.toContain('refill');
  });

  it('a running feed: the mixing tank names the pot, Feed now waits', async () => {
    await mount((s) => ({
      ...s,
      feeds: [
        { feedId: 'f', roomId: 'grow-1', potId: 'pot-1', state: 'started', message: 'grow 4 mL', requestedAt: now },
      ],
    }));
    expect(el.querySelector('.node.mix')!.textContent).toContain('Feeding Pot 1: grow 4 mL');
    expect(button(el.querySelector('.node.pot')!, 'Feeding…').disabled).toBe(true);
  });

  it('follows the mode: silent lets lights on but not the loop; off disables Read; Stop all stays', async () => {
    await mount((s) => ({ ...s, rooms: [{ ...s.rooms[0]!, mode: 'silent' }] }));
    expect(button(node('.node.switch', 'light'), 'Off').disabled).toBe(false);
    expect(button(el.querySelector('.node.pot')!, 'Off').disabled).toBe(true);
    expect(button(node('.node.tank', 'Grow'), 'Run').disabled).toBe(true);
    fixture.destroy();
    await mount((s) => ({ ...s, rooms: [{ ...s.rooms[0]!, mode: 'off' }] }));
    expect(button(el.querySelector('.tile')!, 'Read').disabled).toBe(true);
    expect(button(el, 'Stop all').disabled).toBe(false);
  });

  it('lists parts it cannot place in the drawing, so nothing is hidden', async () => {
    await mount((s) => ({ ...s, actuators: [...s.actuators, actuator('pump-grow-2', 'pump_grow')] }));
    expect(el.querySelector('.others')!.textContent).toContain('pump-grow-2');
  });

  it('runs a supply pump through the hub, and disables Run while it waits', async () => {
    await mount();
    const run = button(node('.node.tank', 'Grow'), 'Run');
    run.click();
    fixture.detectChanges();
    const req = http.expectOne('/api/actuators/pump-grow/run');
    expect(req.request.body).toEqual({ durationMs: 2000 });
    expect(run.disabled).toBe(true);
    req.flush({ commandId: 'c', ok: true, error: null, value: 2000 });
  });
});
