import { TestBed } from '@angular/core/testing';

import { BodiesSearchApiService } from './bodies-search-api.service';

describe('BodiesSearchApiService', () => {
  let service: BodiesSearchApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BodiesSearchApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
