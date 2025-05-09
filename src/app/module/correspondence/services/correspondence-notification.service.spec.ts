import { TestBed } from '@angular/core/testing';

import { CorrespondenceNotificationService } from './correspondence-notification.service';

describe('CorrespondenceNotificationService', () => {
  let service: CorrespondenceNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorrespondenceNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
