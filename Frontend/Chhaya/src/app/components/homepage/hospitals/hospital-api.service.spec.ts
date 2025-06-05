import { TestBed } from '@angular/core/testing';

import { HospitalAPIService } from './hospital-api.service';

describe('HospitalAPIService', () => {
  let service: HospitalAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HospitalAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
