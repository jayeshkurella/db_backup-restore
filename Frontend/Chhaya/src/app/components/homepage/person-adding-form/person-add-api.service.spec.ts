import { TestBed } from '@angular/core/testing';

import { PersonAddAPIService } from './person-add-api.service';

describe('PersonAddAPIService', () => {
  let service: PersonAddAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonAddAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
