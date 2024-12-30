import { TestBed } from '@angular/core/testing';

import { HomepageApiService } from './homepage-api.service';

describe('HomepageApiService', () => {
  let service: HomepageApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomepageApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
