import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairTaskComponent } from './repair-task-component';

describe('RepairTaskComponent', () => {
  let component: RepairTaskComponent;
  let fixture: ComponentFixture<RepairTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepairTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepairTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
