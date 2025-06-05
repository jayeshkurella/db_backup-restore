import { TestBed } from '@angular/core/testing';

import { PaginationapiService } from './paginationapi.service';

describe('PaginationapiService', () => {
  let service: PaginationapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginationapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
