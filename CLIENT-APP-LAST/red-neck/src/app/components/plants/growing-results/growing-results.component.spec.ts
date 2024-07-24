import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrowingResultsComponent } from './growing-results.component';

describe('GrowingResultsComponent', () => {
  let component: GrowingResultsComponent;
  let fixture: ComponentFixture<GrowingResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrowingResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrowingResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
