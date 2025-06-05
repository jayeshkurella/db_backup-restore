import { TestBed } from '@angular/core/testing';

import { MainDashserviceService } from './main-dashservice.service';

describe('MainDashserviceService', () => {
  let service: MainDashserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainDashserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
