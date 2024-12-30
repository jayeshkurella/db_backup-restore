import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDemoComponent } from './dashboard-demo.component';

describe('DashboardDemoComponent', () => {
  let component: DashboardDemoComponent;
  let fixture: ComponentFixture<DashboardDemoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardDemoComponent]
    });
    fixture = TestBed.createComponent(DashboardDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
