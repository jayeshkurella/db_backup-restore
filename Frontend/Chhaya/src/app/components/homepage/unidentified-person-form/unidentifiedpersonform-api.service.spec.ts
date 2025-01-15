import { TestBed } from '@angular/core/testing';

import { UnidentifiedpersonformApiService } from './unidentifiedpersonform-api.service';

describe('UnidentifiedpersonformApiService', () => {
  let service: UnidentifiedpersonformApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnidentifiedpersonformApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
