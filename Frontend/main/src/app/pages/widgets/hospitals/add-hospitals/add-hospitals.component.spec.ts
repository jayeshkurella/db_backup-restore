import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHospitalsComponent } from './add-hospitals.component';

describe('AddHospitalsComponent', () => {
  let component: AddHospitalsComponent;
  let fixture: ComponentFixture<AddHospitalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddHospitalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddHospitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
