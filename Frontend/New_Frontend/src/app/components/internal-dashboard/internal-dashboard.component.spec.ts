import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalDashboardComponent } from './internal-dashboard.component';

describe('InternalDashboardComponent', () => {
  let component: InternalDashboardComponent;
  let fixture: ComponentFixture<InternalDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternalDashboardComponent]
    });
    fixture = TestBed.createComponent(InternalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
