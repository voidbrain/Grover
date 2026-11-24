import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import type { Calibration } from '@grover/contracts';
import { ProbeCalibration } from './probe-calibration';

/** Taking calibration points against the hub's raw read (F-004). */
describe('ProbeCalibration', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<ProbeCalibration>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbeCalibration],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProbeCalibration);
    fixture.componentRef.setInput('probeId', 'pot-1-ph');
    fixture.componentRef.setInput('kind', 'ph');
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
    for (const r of http.match('/api/snapshot')) r.flush(null);
  });

  const button = (label: string) =>
    [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.trim() === label)!;

  async function takePoint(raw: number, value: string, tempC: number | null = null): Promise<void> {
    button('Read now').click();
    http.expectOne('/api/probes/pot-1-ph/read-raw').flush({ raw, tempC });
    await fixture.whenStable();
    const input = el.querySelector<HTMLInputElement>('input[inputmode=decimal]')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    button('Add point').click();
    await fixture.whenStable();
  }

  it('cannot read while the agent is offline', async () => {
    fixture.componentRef.setInput('online', false);
    await fixture.whenStable();
    expect(button('Read now').disabled).toBe(true);
    expect(el.textContent).toContain('The agent is offline');
  });

  it('says one pH buffer is not enough, and is satisfied by two', async () => {
    await takePoint(2.03, '7');
    expect(el.querySelector('[role=alert]')?.textContent).toContain('pH needs two buffers');
    await takePoint(2.53, '4');
    expect(el.querySelector('[role=alert]')).toBeNull();
    const c = fixture.componentInstance.calibration()!;
    expect(c.points.map((p) => p.value)).toEqual([7, 4]);
    expect(c.compensation).toBe('ph');
  });

  it('keeps a compensation chosen before the first point, and drops an impossible temperature', async () => {
    const select = el.querySelector<HTMLSelectElement>('select')!;
    select.value = 'none';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    await takePoint(2.03, '7', -127);
    const c = fixture.componentInstance.calibration() as Calibration;
    expect(c.compensation).toBe('none');
    expect(c.points[0]!.tempC).toBeNull();
  });
});
