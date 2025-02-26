import { TestBed } from '@angular/core/testing';

import { PersonAddApiService } from './person-add-api.service';

describe('PersonAddApiService', () => {
  let service: PersonAddApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonAddApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
