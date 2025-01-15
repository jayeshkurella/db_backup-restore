import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
declare var bootstrap: any;
import { Tab } from 'bootstrap';
@Component({
  selector: 'app-unidentified-person-form',
  templateUrl: './unidentified-person-form.component.html',
  styleUrls: ['./unidentified-person-form.component.css']
})
export class UnidentifiedPersonFormComponent {

missingPersonForm!: FormGroup;
  fileToUpload: any;





onFileChange(event: any): void {
  const file = event.target.files[0];  // Get the selected file
  if (file) {
    this.fileToUpload = file;  // Store the file in a variable
  }
}


submitMPForm(){}

getCurrentLocation(){}
//  calculate age as per dob
calculateAge(): void {
  const dobControl = this.missingPersonForm.get('date_of_birth');

  if (dobControl?.value) {
    const dobDate = new Date(dobControl.value);
    const today = new Date();

    if (dobDate > today) {
      this.missingPersonForm.patchValue({ age: null });
      alert('Date of birth cannot be in the future.');
      return;
    }

    const age = Math.floor((today.getTime() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    this.missingPersonForm.patchValue({ age });
  }
}

  // to move next page in form
  goToNextTab(tabId: string): void {
    const nextTab = document.getElementById(tabId + '-tab');
    if (nextTab) {
      new bootstrap.Tab(nextTab).show();
    }
  }

  // to to back page in form
  goToPreviousTab(tabId: string): void {
    const prevTab = document.getElementById(tabId + '-tab');
    if (prevTab) {
      new Tab(prevTab).show();
    }
  }

}
