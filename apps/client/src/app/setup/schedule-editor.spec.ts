import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { Actuator, Schedule } from '@grover/contracts';
import { ScheduleEditor } from './schedule-editor';

const light: Actuator = {
  id: 'light',
  roomId: 'grow-1',
  potId: null,
  kind: 'light',
  name: 'Light',
  enabled: true,
  binding: { driver: 'mock' },
  maxRunMs: 0,
  mlPerSecond: null,
};
const schedule: Schedule = {
  id: 'light-window',
  target: { type: 'actuator', actuatorId: 'light' },
  rule: { kind: 'window', from: '06:00', to: '00:00' },
  enabled: true,
  days: null,
};

/** Weekdays in the schedule editor (F-016): the shortcut and what reaches the hub. */
describe('ScheduleEditor', () => {
  it('limits a schedule to the weekend with the shortcut, and refuses no day at all', async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleEditor],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ScheduleEditor);
    fixture.componentRef.setInput('schedule', schedule);
    fixture.componentRef.setInput('actuators', [light]);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const button = (label: string) => [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === label)!;
    const ticked = () =>
      [...el.querySelectorAll<HTMLInputElement>('.day input')]
        .filter((i) => i.checked)
        .map((i) => i.parentElement!.textContent!.trim());

    expect(ticked()).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    button('Weekdays').click();
    await fixture.whenStable();
    for (const day of [...el.querySelectorAll<HTMLInputElement>('.day input')].filter((i) => i.checked)) day.click();
    await fixture.whenStable();
    expect(el.textContent).toContain('Pick at least one day.');

    button('Weekend').click();
    await fixture.whenStable();
    expect(ticked()).toEqual(['Sat', 'Sun']);
    el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    const put = http.expectOne('/api/schedules/light-window');
    expect(put.request.body.days).toEqual([6, 7]);
  });
});
