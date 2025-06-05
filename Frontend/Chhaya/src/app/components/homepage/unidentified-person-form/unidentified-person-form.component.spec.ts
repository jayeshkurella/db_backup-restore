import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidentifiedPersonFormComponent } from './unidentified-person-form.component';

describe('UnidentifiedPersonFormComponent', () => {
  let component: UnidentifiedPersonFormComponent;
  let fixture: ComponentFixture<UnidentifiedPersonFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnidentifiedPersonFormComponent]
    });
    fixture = TestBed.createComponent(UnidentifiedPersonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
