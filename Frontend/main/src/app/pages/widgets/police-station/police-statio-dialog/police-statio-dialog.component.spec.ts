import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliceStatioDialogComponent } from './police-statio-dialog.component';

describe('PoliceStatioDialogComponent', () => {
  let component: PoliceStatioDialogComponent;
  let fixture: ComponentFixture<PoliceStatioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliceStatioDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliceStatioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
