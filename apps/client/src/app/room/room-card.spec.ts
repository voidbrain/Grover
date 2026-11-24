import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Hub } from '../hub';
import { snapshot } from '../testing/rig-snapshot';
import { RoomCard } from './room-card';

/** The room card after the pump control and tiles moved out (F-015): runs and switches behave as before. */
describe('RoomCard', () => {
  it('runs a pump once and keeps Run disabled while it waits (B-005); switches go through the hub', async () => {
    await TestBed.configureTestingModule({
      imports: [RoomCard],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(RoomCard);
    fixture.componentRef.setInput('room', snapshot.rooms[0]);
    fixture.detectChanges();
    for (const r of http.match('/api/snapshot')) r.flush(snapshot);
    const hub = TestBed.inject(Hub);
    hub.snapshot.set(snapshot as never);
    hub.connected.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const pumps = el.querySelector('section[aria-label=Pumps]')!;
    const grow = [...pumps.querySelectorAll('li')].find((li) => li.textContent!.includes('pump-grow'))!;
    const run = [...grow.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Run')!;
    expect(run.disabled).toBe(false);
    run.click();
    fixture.detectChanges();
    http.expectOne('/api/actuators/pump-grow/run').flush({ commandId: 'c', ok: true, error: null, value: 2000 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(run.disabled).toBe(true);
    expect(grow.textContent).toContain('waiting');

    const light = el.querySelector<HTMLButtonElement>('[role=switch]')!;
    light.click();
    expect(http.expectOne((r) => r.url.endsWith('/switch')).request.body).toEqual({ on: true });
  });
});
