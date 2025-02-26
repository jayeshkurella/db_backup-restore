import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonAddingFormComponent } from './person-adding-form.component';

describe('PersonAddingFormComponent', () => {
  let component: PersonAddingFormComponent;
  let fixture: ComponentFixture<PersonAddingFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonAddingFormComponent]
    });
    fixture = TestBed.createComponent(PersonAddingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
