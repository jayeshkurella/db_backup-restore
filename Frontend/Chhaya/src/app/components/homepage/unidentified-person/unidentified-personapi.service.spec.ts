import { TestBed } from '@angular/core/testing';

import { UnidentifiedPersonapiService } from './unidentified-personapi.service';

describe('UnidentifiedPersonapiService', () => {
  let service: UnidentifiedPersonapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnidentifiedPersonapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
