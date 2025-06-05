import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidentifiedPersonDialogComponent } from './unidentified-person-dialog.component';

describe('UnidentifiedPersonDialogComponent', () => {
  let component: UnidentifiedPersonDialogComponent;
  let fixture: ComponentFixture<UnidentifiedPersonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnidentifiedPersonDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnidentifiedPersonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
