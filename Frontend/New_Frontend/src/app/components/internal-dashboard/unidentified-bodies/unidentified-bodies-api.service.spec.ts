import { TestBed } from '@angular/core/testing';

import { UnidentifiedBodiesApiService } from './unidentified-bodies-api.service';

describe('UnidentifiedBodiesApiService', () => {
  let service: UnidentifiedBodiesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnidentifiedBodiesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
