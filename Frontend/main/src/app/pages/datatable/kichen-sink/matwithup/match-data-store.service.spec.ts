import { TestBed } from '@angular/core/testing';

import { MatchDataStoreService } from './match-data-store.service';

describe('MatchDataStoreService', () => {
  let service: MatchDataStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchDataStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
