import { TestBed } from '@angular/core/testing';

import { NouvoFonksyonService } from './nouvo-fonksyon.service';

describe('NouvoFonksyonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NouvoFonksyonService = TestBed.get(NouvoFonksyonService);
    expect(service).toBeTruthy();
  });
});
