import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { ago, health, targetRange } from './format';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('shows the brand and an offline badge before the hub answers', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.brand')?.textContent).toContain('Grover');
    expect(el.querySelector('.conn')?.textContent).toContain('Offline');
  });
});

describe('format', () => {
  const phase = {
    ec: { min: 1.3, max: 1.8 },
    ph: { min: 5.5, max: 6 },
    waterTemp: { min: 15, max: 35 },
    waterLevel: { min: 10, max: 90 },
  } as never;

  it('classifies readings against the phase range', () => {
    const r = targetRange('ec', phase);
    expect(health(1.0, r, 1000, 2000)).toBe('low');
    expect(health(1.5, r, 1000, 2000)).toBe('ok');
    expect(health(2.0, r, 1000, 2000)).toBe('high');
    expect(health(1.5, r, 0, 2 * 3_600_000)).toBe('stale');
    expect(targetRange('air_temperature', phase)).toBeNull();
  });

  it('formats relative times', () => {
    expect(ago(null, 0)).toBe('never');
    expect(ago(0, 90_000)).toBe('2 min ago');
  });
});
