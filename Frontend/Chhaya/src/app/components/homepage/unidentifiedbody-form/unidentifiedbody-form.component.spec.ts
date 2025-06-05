import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidentifiedbodyFormComponent } from './unidentifiedbody-form.component';

describe('UnidentifiedbodyFormComponent', () => {
  let component: UnidentifiedbodyFormComponent;
  let fixture: ComponentFixture<UnidentifiedbodyFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnidentifiedbodyFormComponent]
    });
    fixture = TestBed.createComponent(UnidentifiedbodyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
