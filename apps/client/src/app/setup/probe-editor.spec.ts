import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProbeEditor } from './probe-editor';

/** The join between a set-up form and the hub API: what the user types becomes the body the hub validates. */
describe('ProbeEditor', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbeEditor],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  function type(el: HTMLElement, selector: string, value: string): void {
    const input = el.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
  }

  it('creates a DS18B20 probe with an id from its name', async () => {
    const fixture = TestBed.createComponent(ProbeEditor);
    fixture.componentRef.setInput('roomId', 'grow-1');
    fixture.componentRef.setInput('takenIds', ['reservoir-temperature']);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    type(el, 'input[type=text]', 'Reservoir temperature');
    // selects: kind, where, wiring
    const wiring = el.querySelectorAll('select')[2]!;
    wiring.value = 'ds18b20';
    wiring.dispatchEvent(new Event('input'));
    wiring.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    type(el, 'input[placeholder="28-0123456789ab"]', '28-0000075a3b1c');
    await fixture.whenStable();

    el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    // the hub's snapshot request from the Hub service, then the save
    for (const r of http.match('/api/snapshot')) r.flush(null);
    const put = http.expectOne('/api/probes/reservoir-temperature-2');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({
      roomId: 'grow-1',
      potId: null,
      kind: 'water_temperature',
      name: 'Reservoir temperature',
      enabled: true,
      binding: { driver: 'ds18b20', address: '28-0000075a3b1c' },
    });
  });

  it('does not send a probe without a name, and says why', async () => {
    const fixture = TestBed.createComponent(ProbeEditor);
    fixture.componentRef.setInput('roomId', 'grow-1');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    for (const r of http.match('/api/snapshot')) r.flush(null);
    http.expectNone((req) => req.method === 'PUT');
    expect(el.textContent).toContain('Give it a name');
  });
});
