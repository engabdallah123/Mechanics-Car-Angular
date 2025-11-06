import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignLabor } from './reassign-labor';

describe('ReassignLabor', () => {
  let component: ReassignLabor;
  let fixture: ComponentFixture<ReassignLabor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReassignLabor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReassignLabor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
