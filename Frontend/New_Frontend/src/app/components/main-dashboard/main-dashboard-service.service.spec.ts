import { TestBed } from '@angular/core/testing';

import { MainDashboardServiceService } from './main-dashboard-service.service';

describe('MainDashboardServiceService', () => {
  let service: MainDashboardServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainDashboardServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
