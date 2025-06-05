import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalDialogComponent } from './hospital-dialog.component';

describe('HospitalDialogComponent', () => {
  let component: HospitalDialogComponent;
  let fixture: ComponentFixture<HospitalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
