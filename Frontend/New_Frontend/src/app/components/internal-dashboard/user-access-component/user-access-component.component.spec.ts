import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccessComponentComponent } from './user-access-component.component';

describe('UserAccessComponentComponent', () => {
  let component: UserAccessComponentComponent;
  let fixture: ComponentFixture<UserAccessComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserAccessComponentComponent]
    });
    fixture = TestBed.createComponent(UserAccessComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
