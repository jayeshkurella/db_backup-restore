import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule, ValidationErrors, AbstractControl, FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { RegisterApiService } from './register-api.service';

@Component({
  selector: 'app-side-register',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent, CommonModule],
  templateUrl: './side-register.component.html',
  styleUrls: ['./side-register.component.scss']
})
export class AppSideRegisterComponent implements OnInit {


  options = this.settings.getOptions();
  isConsentChecked = false; // Track checkbox state
  isPassword2Visible: any;
  registerForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  // Define user type options based on your Django model
  userTypes = [
    { value: 'reporting_person', label: 'Reporting Person' },
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

  ngOnInit(): void {
    const savedData = localStorage.getItem('tempRegisterForm');
    if (savedData) {
      this.registerForm.patchValue(JSON.parse(savedData));
      localStorage.removeItem('tempRegisterForm');
    }

    if (localStorage.getItem('userAgreedToPrivacy') === 'true') {
      this.registerForm.patchValue({ is_consent: true });
      localStorage.removeItem('userAgreedToPrivacy');
    }
  }

  constructor(private settings: CoreService, private router: Router, private fb: FormBuilder, private authService: RegisterApiService,) {
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
            validators: [
              Validators.required,
              Validators.email,
              Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) // More strict pattern
            ],
            updateOn: 'blur'
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
        this.router.navigate(['/authentication/login']);

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

  goToPrivacyPolicy() {
    const formData = this.registerForm.value;
    localStorage.setItem('tempRegisterForm', JSON.stringify(formData));
    this.router.navigate(['/authentication/privacy-policy']);
  }
  onConsentClick(event: any) {
    const formData = this.registerForm.value;
    localStorage.setItem('tempRegisterForm', JSON.stringify(formData));
    localStorage.setItem('returningFromConsent', 'true');
     this.router.navigate(['/authentication/privacy-policy']);
  }
}
