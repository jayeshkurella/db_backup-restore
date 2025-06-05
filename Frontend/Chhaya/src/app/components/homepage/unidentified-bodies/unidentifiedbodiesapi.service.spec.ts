import { TestBed } from '@angular/core/testing';

import { UnidentifiedbodiesapiService } from './unidentifiedbodiesapi.service';

describe('UnidentifiedbodiesapiService', () => {
  let service: UnidentifiedbodiesapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnidentifiedbodiesapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
