import { TestBed } from '@angular/core/testing';

import { MissingPersonApiService } from './missing-person-api.service';

describe('MissingPersonApiService', () => {
  let service: MissingPersonApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissingPersonApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
