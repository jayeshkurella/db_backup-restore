import { TestBed } from '@angular/core/testing';

import { HospitalApiService } from './hospital-api.service';

describe('HospitalApiService', () => {
  let service: HospitalApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HospitalApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
