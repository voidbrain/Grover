import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrainsDetailComponent } from './detail.component';

describe('StrainsDetailComponent', () => {
  let component: StrainsDetailComponent;
  let fixture: ComponentFixture<StrainsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrainsDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StrainsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
