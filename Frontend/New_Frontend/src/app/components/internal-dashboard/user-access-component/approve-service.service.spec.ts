import { TestBed } from '@angular/core/testing';

import { ApproveServiceService } from './approve-service.service';

describe('ApproveServiceService', () => {
  let service: ApproveServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApproveServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
