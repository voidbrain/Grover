import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrowingResultsComponent } from './growing-results.component';

describe('GrowingResultsComponent', () => {
  let component: GrowingResultsComponent;
  let fixture: ComponentFixture<GrowingResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrowingResultsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GrowingResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
