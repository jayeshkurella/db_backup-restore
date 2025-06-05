import { TestBed } from '@angular/core/testing';

import { VolunteeapiService } from './volunteeapi.service';

describe('VolunteeapiService', () => {
  let service: VolunteeapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VolunteeapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
