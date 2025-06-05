import { TestBed } from '@angular/core/testing';

import { PoliceStationApiService } from './police-station-api.service';

describe('PoliceStationApiService', () => {
  let service: PoliceStationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoliceStationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
