import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerResponse } from '../../_models/customer';
import { CustomerServices } from '../../_services/customer-services';
import { AddCustomer } from '../add-customer/add-customer';

import Swal from 'sweetalert2';
import { EditCustomer } from '../edit-customer/edit-customer';
import { SpinerComponent } from '../../Spiner/spiner-component/spiner-component';
import { LoadingServices } from '../../_services/loading-services';


@Component({
  selector: 'app-customer-component',
  standalone: true,
  imports: [CommonModule, FormsModule, AddCustomer , EditCustomer,SpinerComponent],
  templateUrl: './customer-component.html',
  styleUrls: ['./customer-component.css'],
})
export class CustomerComponent implements OnInit {
  customers: CustomerResponse[] = [];
  filteredCustomers: CustomerResponse[] = [];

  showAddForm = false;
  isEditMode = false;

  selectedCustomerId: number | null = null;

  searchText: string = '';
  sortBy: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  activeMenuIndex: number | null = null;

  constructor(private customerService: CustomerServices,public loadingServices:LoadingServices) {}

  ngOnInit(): void {
    this.loadCustomers();

    document.addEventListener('click', this.closeMenus.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeMenus.bind(this));
  }

  loadCustomers(): void {
    this.loadingServices.show();
    this.customerService.getCustomerDetails().subscribe({
      next: (res) => {
        this.customers = res;
        this.filteredCustomers = [...res];
        console.log('✅ Customers loaded:', res);

        this.loadingServices.hide();
      },
      error: (err) => {
        console.error('❌ Error fetching customers:', err);
        this.loadingServices.hide();
      },
    });
  }

  openAddCustomer(): void {
    this.showAddForm = true;
  }

  closeAddCustomer(shouldReload: boolean): void {
    if (shouldReload) this.loadCustomers();
    this.showAddForm = false;
  }

  applyFilters(): void {
    let result = this.customers;

    if (this.searchText.trim() !== '') {
      const search = this.searchText.toLowerCase();
      result = result.filter(
        (c) =>
          c.customerName?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.phoneNumber?.includes(search)
      );
    }

    result = [...result].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (this.sortBy) {
        case 'vehicles':
          valA = a.vehicles?.length || 0;
          valB = b.vehicles?.length || 0;
          break;
        default: // name
          valA = a.customerName?.toLowerCase() || '';
          valB = b.customerName?.toLowerCase() || '';
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredCustomers = result;
  }

  setSortDirection(direction: 'asc' | 'desc') {
    this.sortDirection = direction;
    this.applyFilters();
  }

  openEditCustomer(customer: CustomerResponse) {
     if (!customer.customerId) return;
  this.selectedCustomerId = customer.customerId;
  this.isEditMode = true;
  this.activeMenuIndex = null;
}

closeEditCustomer(saved: boolean) {
  this.isEditMode = false;
  if (saved) {
    this.loadCustomers();
  }
}

  deleteCustomer(customerId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      theme: 'dark',
    }).then((result) => {
      if (result.isConfirmed) {
        this.customerService.deleteCustomer(customerId).subscribe({
          next: () => {
            this.loadCustomers();
          },
          error: (err) => {
            console.error('Delete failed:', err);
            alert('Failed to delete customer');
          },
        });
      }
    });
  }

  toggleMenu(index: number) {
    this.activeMenuIndex = this.activeMenuIndex === index ? null : index;
  }
  closeMenus(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.btn-icon-only') && !target.closest('.dropdown-menu')) {
      this.activeMenuIndex = null;
    }
  }

}
