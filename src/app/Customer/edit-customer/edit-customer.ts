import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Make } from '../../_models/vehicle';
import { CustomerServices } from '../../_services/customer-services';
import { VehicleServices } from '../../_services/vehicle-services';
import { CustomerResponse, Vehicle } from '../../_models/customer';

@Component({
  selector: 'app-edit-customer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-customer.html',
  styleUrls: ['./edit-customer.css'],
})
export class EditCustomer implements OnInit {
  @Input() customerId!: number;
  @Output() closeForm = new EventEmitter<boolean>();

  editCustomer!: FormGroup;
  makes: Make[] = [];

  // قائمة العربيات القديمة فقط للعرض
  oldVehicles: Vehicle[] = [];

  constructor(
    private fb: FormBuilder,
    private customerServices: CustomerServices,
    private vehicleServices: VehicleServices
  ) {
    this.editCustomer = this.fb.group({
      customerName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      vehicles: this.fb.array([]), // للسيارات الجديدة فقط
    });
  }

  ngOnInit() {
    this.loadMakes();
    if (this.customerId) this.loadCustomer();
  }

  get vehicles(): FormArray {
    return this.editCustomer.get('vehicles') as FormArray;
  }

  loadMakes() {
    this.vehicleServices.getAllVehicles().subscribe({
      next: (res) => (this.makes = res),
      error: (err) => console.error('Error loading makes:', err),
    });
  }

  loadCustomer() {
    this.customerServices.getCustomerById(this.customerId).subscribe({
      next: (customer: CustomerResponse) => {
        console.log('Loaded customer for edit:', customer);
        this.editCustomer.patchValue({
          customerName: customer.customerName,
          email: customer.email,
          phone: customer.phoneNumber,
        });

        // احتفظ بالعربيات القديمة للعرض فقط
        this.oldVehicles = customer.vehicles || [];
      },
      error: (err) => console.error('Error loading customer:', err),
    });
  }

  // حذف عربية قديمة
  removeOldVehicle(index: number) {
    const vehicle = this.oldVehicles[index];
    this.vehicleServices.deleteVehicle(vehicle.id).subscribe({
      next: () => {
        this.oldVehicles.splice(index, 1);
      },
      error: (err) => console.error('Error deleting vehicle:', err),
    });
  }

  /** إضافة عربية جديدة */
  addVehicle() {
    const vehicleGroup = this.fb.group({
      makeId: [null, Validators.required],
      modelId: [null, Validators.required],
      licensePlate: ['', Validators.required],
      models: [[]],
    });
    this.vehicles.push(vehicleGroup);
  }

  removeVehicle(index: number) {
    this.vehicles.removeAt(index);
  }

  onMakeChange(index: number) {
    const vehicleGroup = this.vehicles.at(index) as FormGroup;
    const makeId = vehicleGroup.get('makeId')?.value;
    if (!makeId) return;

    this.vehicleServices.getVehicleModels(makeId).subscribe({
      next: (models) => {
        vehicleGroup.patchValue({ models, modelId: null });
      },
      error: (err) => console.error('Error loading models:', err),
    });
  }

  getVehicleModels(index: number) {
    const vehicleGroup = this.vehicles.at(index) as FormGroup;
    return vehicleGroup.get('models')?.value || [];
  }

  submit() {
    if (this.editCustomer.invalid) {
      this.editCustomer.markAllAsTouched();
      return;
    }

    const formValue = this.editCustomer.value;

    const newVehicles = formValue.vehicles.map((v: any) => ({
      licensePlate: v.licensePlate,
      modelId: v.modelId,
    }));

    const payload = {
      customerName: formValue.customerName,
      email: formValue.email,
      phone: formValue.phone,
      vehicles: newVehicles, // فقط العربيات الجديدة
    };

    this.customerServices.updateCustomer(this.customerId, payload).subscribe({
      next: () => {
        console.log('✅ Customer updated successfully');
        this.closeForm.emit(true);
      },
      error: (err) => console.error('❌ Error updating customer:', err),
    });
  }

  cancel() {
    this.closeForm.emit(false);
  }
}
