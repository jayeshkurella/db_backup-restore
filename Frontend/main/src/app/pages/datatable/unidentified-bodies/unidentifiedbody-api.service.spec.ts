import { TestBed } from '@angular/core/testing';

import { UnidentifiedbodyApiService } from './unidentifiedbody-api.service';

describe('UnidentifiedbodyApiService', () => {
  let service: UnidentifiedbodyApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnidentifiedbodyApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
