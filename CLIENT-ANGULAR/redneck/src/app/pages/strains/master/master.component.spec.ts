import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrainsMasterComponent } from './master.component';

describe('StrainsMasterComponent', () => {
  let component: StrainsMasterComponent;
  let fixture: ComponentFixture<StrainsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrainsMasterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StrainsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
