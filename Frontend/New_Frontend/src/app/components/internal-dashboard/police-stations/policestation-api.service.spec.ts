import { TestBed } from '@angular/core/testing';

import { PolicestationApiService } from './policestation-api.service';

describe('PolicestationApiService', () => {
  let service: PolicestationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicestationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
