import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomRecipe } from './custom-recipe.component';

describe('CustomRecipe', () => {
  let component: CustomRecipe;
  let fixture: ComponentFixture<CustomRecipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomRecipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomRecipe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
