import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnrejectDialogComponent } from './unreject-dialog.component';

describe('UnrejectDialogComponent', () => {
  let component: UnrejectDialogComponent;
  let fixture: ComponentFixture<UnrejectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnrejectDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnrejectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
