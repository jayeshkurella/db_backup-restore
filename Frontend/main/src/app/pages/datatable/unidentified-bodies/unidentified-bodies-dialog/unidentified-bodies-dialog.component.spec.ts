import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidentifiedBodiesDialogComponent } from './unidentified-bodies-dialog.component';

describe('UnidentifiedBodiesDialogComponent', () => {
  let component: UnidentifiedBodiesDialogComponent;
  let fixture: ComponentFixture<UnidentifiedBodiesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnidentifiedBodiesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnidentifiedBodiesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
