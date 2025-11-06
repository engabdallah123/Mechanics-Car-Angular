import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Make, MakeModel } from '../../_models/vehicle';
import { CustomerServices } from '../../_services/customer-services';
import { VehicleServices } from '../../_services/vehicle-services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-customer.html',
  styleUrls: ['./add-customer.css'],
})
export class AddCustomer {
  @Output() closeForm = new EventEmitter<boolean>();

  addCustomer!: FormGroup;
  makes: Make[] = [];

  constructor(
    private fb: FormBuilder,
    private customerServices: CustomerServices,
    private vehicleServices: VehicleServices
  ) {
    this.addCustomer = this.fb.group({
      customerName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      vehicles: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.loadMakes();
  }


  loadMakes() {
    this.vehicleServices.getAllVehicles().subscribe({
      next: (res) => (this.makes = res),
      error: (err) => console.error('Error loading makes:', err),
    });
  }

  /** getter */
  get vehicles(): FormArray {
    return this.addCustomer.get('vehicles') as FormArray;
  }


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
    const makeId = this.vehicles.at(index).get('makeId')?.value;
    if (!makeId) return;

    this.vehicleServices.getVehicleModels(makeId).subscribe({
      next: (models) => this.vehicles.at(index).patchValue({ models: models }),

      error: (err) => console.error('Error loading models:', err),
    });
  }


  submit() {
    if (this.addCustomer.invalid) {
      this.addCustomer.markAllAsTouched();
      return;
    }

    const formValue = this.addCustomer.value;


    const payload = {
      customerName: formValue.customerName,
      email: formValue.email,
      phone: formValue.phone,
      vehiclse: formValue.vehicles.map((v: any) => ({
        licensePlate: v.licensePlate,
        modelId: v.modelId,
      })),
    };

    console.log('📦 Sending payload:', payload);



    this.customerServices.createCustomer(payload).subscribe({
      next: () => {
        console.log('✅ Customer added successfully');
        this.addCustomer.reset();
        this.vehicles.clear();
        this.closeForm.emit(true);

            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              },
            });
            Toast.fire({
              icon: 'success',
              title: 'Customer added successfully',
            });
      },
      error: (err) => {
        console.error('❌ Error adding customer:', err);
      },
    });
  }

  cancel() {
    this.closeForm.emit(false);
  }
}
