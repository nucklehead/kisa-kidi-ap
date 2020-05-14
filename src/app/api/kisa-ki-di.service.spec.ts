import { TestBed } from '@angular/core/testing';

import { KisaKiDiService } from './kisa-ki-di.service';

describe('KisaKiDiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KisaKiDiService = TestBed.get(KisaKiDiService);
    expect(service).toBeTruthy();
  });
});
