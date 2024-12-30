import { TestBed } from '@angular/core/testing';

import { SearchpersonAPIService } from './searchperson-api.service';

describe('SearchpersonAPIService', () => {
  let service: SearchpersonAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchpersonAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
