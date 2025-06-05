import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogModelViewComponent } from './dialog-model-view.component';

describe('DialogModelViewComponent', () => {
  let component: DialogModelViewComponent;
  let fixture: ComponentFixture<DialogModelViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogModelViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogModelViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
