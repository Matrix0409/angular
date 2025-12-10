import { TestBed } from '@angular/core/testing';

import { Spoonacular } from './spoonacular';

describe('Spoonacular', () => {
  let service: Spoonacular;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Spoonacular);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
