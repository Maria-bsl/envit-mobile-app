import { TestBed } from '@angular/core/testing';

import { ThemManagerService } from './them-manager.service';

describe('ThemManagerService', () => {
  let service: ThemManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
