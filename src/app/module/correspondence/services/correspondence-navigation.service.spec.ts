import { TestBed } from '@angular/core/testing';

import { CorrespondenceNavigationService } from './correspondence-navigation.service';

describe('CorrespondenceNavigationService', () => {
  let service: CorrespondenceNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorrespondenceNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
