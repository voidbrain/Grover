import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantsDetailComponent } from './detail.component';

describe('PlantsDetailComponent', () => {
  let component: PlantsDetailComponent;
  let fixture: ComponentFixture<PlantsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantsDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
