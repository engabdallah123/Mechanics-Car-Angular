import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraTask } from './extra-task';

describe('ExtraTask', () => {
  let component: ExtraTask;
  let fixture: ComponentFixture<ExtraTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraTask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
