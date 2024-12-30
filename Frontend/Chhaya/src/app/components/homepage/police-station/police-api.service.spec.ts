import { TestBed } from '@angular/core/testing';

import { PoliceAPIService } from './police-api.service';

describe('PoliceAPIService', () => {
  let service: PoliceAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoliceAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
