import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DosesBarComponent } from './doses-bar.component';

describe('DosesBarComponent', () => {
  let component: DosesBarComponent;
  let fixture: ComponentFixture<DosesBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DosesBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DosesBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
