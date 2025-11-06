import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCustomer } from './edit-customer';

describe('EditCustomer', () => {
  let component: EditCustomer;
  let fixture: ComponentFixture<EditCustomer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCustomer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCustomer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
