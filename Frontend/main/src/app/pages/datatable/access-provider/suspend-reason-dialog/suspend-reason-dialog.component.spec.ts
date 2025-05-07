import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendReasonDialogComponent } from './suspend-reason-dialog.component';

describe('SuspendReasonDialogComponent', () => {
  let component: SuspendReasonDialogComponent;
  let fixture: ComponentFixture<SuspendReasonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuspendReasonDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuspendReasonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
