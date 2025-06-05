import { TestBed } from '@angular/core/testing';

import { PrivacyrouteService } from './privacyroute.service';

describe('PrivacyrouteService', () => {
  let service: PrivacyrouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivacyrouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
