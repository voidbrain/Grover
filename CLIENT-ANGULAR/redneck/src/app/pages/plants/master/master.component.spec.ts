import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantsMasterComponent } from './master.component';

describe('PlantsMasterComponent', () => {
  let component: PlantsMasterComponent;
  let fixture: ComponentFixture<PlantsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantsMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
