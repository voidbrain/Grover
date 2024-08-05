import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DosesBarHorizontalComponent } from './doses-bar-horizontal.component';

describe('DosesBarComponent', () => {
  let component: DosesBarHorizontalComponent;
  let fixture: ComponentFixture<DosesBarHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DosesBarHorizontalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DosesBarHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
