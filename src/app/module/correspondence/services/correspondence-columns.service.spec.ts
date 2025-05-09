import { TestBed } from '@angular/core/testing';

import { CorrespondenceColumnsService } from './correspondence-columns.service';

describe('CorrespondenceColumnsService', () => {
  let service: CorrespondenceColumnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorrespondenceColumnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
