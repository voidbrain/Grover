import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DosesMasterComponent } from './master.component';

describe('DosesMasterComponent', () => {
  let component: DosesMasterComponent;
  let fixture: ComponentFixture<DosesMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DosesMasterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DosesMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
