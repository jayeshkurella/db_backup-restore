import { TestBed } from '@angular/core/testing';

import { UnidnetifiedPersonApiService } from './unidnetified-person-api.service';

describe('UnidnetifiedPersonApiService', () => {
  let service: UnidnetifiedPersonApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnidnetifiedPersonApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
