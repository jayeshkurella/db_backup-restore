import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleUserTypeDialogComponent } from './google-user-type-dialog.component';

describe('GoogleUserTypeDialogComponent', () => {
  let component: GoogleUserTypeDialogComponent;
  let fixture: ComponentFixture<GoogleUserTypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleUserTypeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleUserTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
