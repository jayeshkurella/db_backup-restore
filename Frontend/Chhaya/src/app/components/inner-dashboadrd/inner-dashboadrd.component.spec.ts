import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerDashboadrdComponent } from './inner-dashboadrd.component';

describe('InnerDashboadrdComponent', () => {
  let component: InnerDashboadrdComponent;
  let fixture: ComponentFixture<InnerDashboadrdComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InnerDashboadrdComponent]
    });
    fixture = TestBed.createComponent(InnerDashboadrdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
