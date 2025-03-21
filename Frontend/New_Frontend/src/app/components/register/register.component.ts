import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { RegisterApiService } from './register-api.service';
import { Router } from '@angular/router';
declare var bootstrap: any; // Bootstrap modal instance

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  isConsentChecked = false; // Track checkbox state
  isPassword2Visible: any;
  registerForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  // Define user type options based on your Django model
  userTypes = [
    { value: 'reporting', label: 'Reporting Person' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'family', label: 'Family' },
    { value: 'police_station', label: 'Police Station' },
    { value: 'medical_staff', label: 'Medical Staff' },
  ];

  // Define sub-user types dynamically
  subUserTypes: any = {
    family: [
      { value: 'father', label: 'Father' },
      { value: 'mother', label: 'Mother' },
      { value: 'son', label: 'Son' },
      { value: 'daughter', label: 'Daughter' },
      { value: 'brother', label: 'Brother' },
      { value: 'sister', label: 'Sister' },
      { value: 'relative', label: 'Relative' }
    ],
    police_station: [
      { value: 'inspector', label: 'Inspector' },
      { value: 'constable', label: 'Constable' },
      { value: 'head_constable', label: 'Head Constable' },
      { value: 'sub_inspector', label: 'Sub Inspector' }
    ],
    medical_staff: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'medical_assistant', label: 'Medical Assistant' },
      { value: 'receptionist', label: 'Receptionist' }
    ]
  };
  

  constructor(private fb: FormBuilder, private authService: RegisterApiService, private router: Router) {
    this.registerForm = this.fb.group(
      {
        first_name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern('^[A-Z][a-zA-Z]*$') // First letter capital, only letters
          ]
        ],
        last_name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern('^[A-Z][a-zA-Z]*$') // First letter capital, only letters
          ]
        ],
        username: [''],
        email_id: [
          '',
          {
            validators: [Validators.required, Validators.email],
            updateOn: 'blur' // Validates when the user leaves the field
          }
        ],
        phone_no: [
          '',
          {
            validators: [Validators.required, Validators.pattern('^[0-9]{10}$')], // Exactly 10 digits
            updateOn: 'blur' // Validate only when the field loses focus
          }
        ],
        country_code: ['+91', Validators.required], // Default country code
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}|:<>?]).{6,}$')
            // At least 6 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
          ]
        ],
        password2: ['', Validators.required], // Confirm password (custom validation added below)
        user_type: ['', Validators.required],
        sub_user_type: [''], // Required based on `user_type`
        is_consent: [false, Validators.requiredTrue], // Checkbox for terms agreement
        status: ['hold', Validators.required]
      },
      { validators: this.passwordMatchValidator } // Custom validator for password match
    );
  
    // Watch user_type to apply dynamic validation for sub_user_type
    this.registerForm.get('user_type')?.valueChanges.subscribe(userType => {
      const subUserTypeControl = this.registerForm.get('sub_user_type');
      if (userType === 'specific_role') {
        subUserTypeControl?.setValidators([Validators.required]);
      } else {
        subUserTypeControl?.clearValidators();
      }
      subUserTypeControl?.updateValueAndValidity();
    });
  }
  
  // ✅ Custom Validator to Check if Passwords Match
  passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('password2')?.value;
  
    return password && confirmPassword && password !== confirmPassword
      ? { passwordMismatch: true }  // ✅ Ensure it's a key-value pair
      : null;
  }
  
  

  get f() {
    return this.registerForm.controls;
  }

  onUserTypeChange() {
    const selectedUserType = this.registerForm.get('user_type')?.value;
    if (!this.subUserTypes[selectedUserType]) {
      this.registerForm.get('sub_user_type')?.setValue(''); // Reset sub-user type if not needed
    }
  }

  onSubmit() {
    this.submitted = true;
    console.log('Form Submitted', this.registerForm.value);

    if (this.registerForm.invalid) {
        alert('Please fill all the required fields correctly before submitting.');
        console.log('Form Errors:', this.registerForm.errors);
        return;
    }

    this.authService.register(this.registerForm.value).subscribe(
        (response) => {
            console.log('Registration successful', response);
            alert(response.message);
            this.errorMessage = '';
            this.router.navigate(['/login']);
        },
        (error) => {
            console.log('Registration failed', error);
            
            if (error.error?.error) {
                this.errorMessage = error.error.error;

                // Alert for duplicate email
                if (this.errorMessage.includes('Email already registered')) {
                    alert('This email is already registered. Please use a different email.');
                } 
                if (this.errorMessage.includes('Passwords do not match')) {
                  alert('Passwords do not match. Please enter the same password in both fields.');
              } 
                // Alert for duplicate phone number
                else if (this.errorMessage.includes('Phone number already used')) {
                    alert('This phone number is already in use. Please enter a different phone number.');
                } 
                // Other errors
                else {
                    alert(this.errorMessage);
                }
            } else {
                this.errorMessage = 'Registration failed. Please try again.';
                alert(this.errorMessage);
            }
        }
    );
}

// In your component.ts file
isPasswordVisible: boolean = false;

togglePasswordVisibility(field: string) {
  if (field === 'password') {
    this.isPasswordVisible = !this.isPasswordVisible;
    const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
    const toggleIcon = document.getElementById('togglePasswordIcon') as HTMLElement;

    if (this.isPasswordVisible) {
      passwordInput.type = 'text';
      toggleIcon.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleIcon.classList.replace('bi-eye-slash', 'bi-eye');
    }
  } else if (field === 'password2') {
    this.isPassword2Visible = !this.isPassword2Visible;
    const password2Input = document.getElementById('password2Input') as HTMLInputElement;
    const toggleIcon2 = document.getElementById('togglePasswordIcon2') as HTMLElement;

    if (this.isPassword2Visible) {
      password2Input.type = 'text';
      toggleIcon2.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
      password2Input.type = 'password';
      toggleIcon2.classList.replace('bi-eye-slash', 'bi-eye');
    }
  }
}




  closeModal() {
    let modalElement = document.getElementById("termsModal");
    if (modalElement) {
      let modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  
    // ✅ Manually remove any leftover modal backdrop
    let backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  
    // ✅ Restore page scrolling if needed
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
  handleCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      (document.getElementById("registerConsent") as HTMLInputElement).checked = true;
      this.closeModal();
    }
  }
    
  
}
