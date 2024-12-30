import { TestBed } from '@angular/core/testing';

import { MissingpersonapiService } from './missingpersonapi.service';

describe('MissingpersonapiService', () => {
  let service: MissingpersonapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissingpersonapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
