import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldReasonDialogComponent } from './hold-reason-dialog.component';

describe('HoldReasonDialogComponent', () => {
  let component: HoldReasonDialogComponent;
  let fixture: ComponentFixture<HoldReasonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldReasonDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoldReasonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
