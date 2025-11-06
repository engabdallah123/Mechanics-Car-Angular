import { Component, OnInit } from '@angular/core';
import { Route, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AccountServices, JwtClaims } from '../../_services/account-services';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, RouterModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent implements OnInit {
  claims: JwtClaims | null = null;
  constructor(public accountServices: AccountServices, private router: Router) {}

  ngOnInit(): void {
    this.claims = this.accountServices.GetClaims();
  }

  Logout() {
    this.accountServices.Logout();
    this.router.navigate([`/login`]);
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
      icon: 'info',
      title: `Please come back`,
    });
  }
}
