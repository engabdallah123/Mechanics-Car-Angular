import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountServices } from '../../_services/account-services';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import lottie from 'lottie-web';

@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent implements OnInit {
  useLoginForm: FormGroup;
  loginError: string = '';

  @ViewChild('anim', { static: true })
  anim!: ElementRef;

  constructor(public accountServices: AccountServices, private router: Router) {
    this.useLoginForm = new FormGroup({
      userName: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  ngOnInit(): void {
     lottie.loadAnimation({
       container: this.anim.nativeElement,
       renderer: 'svg',
       loop: true,
       autoplay: true,
       path: 'animation.json',
     });
  }

  AddUser() {
    if (this.useLoginForm.invalid) return;

    this.accountServices.Login(this.useLoginForm.value).subscribe({
      next: (res: any) => {
        this.accountServices.SaveToken(res.token);
        this.router.navigate(['/dashboard']);
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
          title: `Welcom Back`,
        });
      },
      error: (err) => {
        this.loginError = 'Username or password is wrong!';
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
          icon: 'error',
          title: this.loginError,
        });
      },
    });
  }
}
