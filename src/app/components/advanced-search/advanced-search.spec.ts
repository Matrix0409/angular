import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSearch } from './advanced-search.components';

describe('AdvancedSearch', () => {
  let component: AdvancedSearch;
  let fixture: ComponentFixture<AdvancedSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
