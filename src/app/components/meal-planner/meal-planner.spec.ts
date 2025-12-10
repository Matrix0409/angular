import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealPlanner } from './meal-planner.components';

describe('MealPlanner', () => {
  let component: MealPlanner;
  let fixture: ComponentFixture<MealPlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealPlanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
