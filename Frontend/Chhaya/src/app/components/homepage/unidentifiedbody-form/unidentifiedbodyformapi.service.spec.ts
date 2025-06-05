import { TestBed } from '@angular/core/testing';

import { UnidentifiedbodyformapiService } from './unidentifiedbodyformapi.service';

describe('UnidentifiedbodyformapiService', () => {
  let service: UnidentifiedbodyformapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnidentifiedbodyformapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
