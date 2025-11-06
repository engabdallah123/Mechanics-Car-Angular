import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTask } from './edit-task';

describe('EditTask', () => {
  let component: EditTask;
  let fixture: ComponentFixture<EditTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
