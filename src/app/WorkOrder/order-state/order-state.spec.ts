import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderState } from './order-state';

describe('OrderState', () => {
  let component: OrderState;
  let fixture: ComponentFixture<OrderState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderState]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderState);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
