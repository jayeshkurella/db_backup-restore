import { Component, OnInit } from '@angular/core';
declare var bootstrap: any;


import { Tab } from 'bootstrap';
import { PersonAddAPIService } from './person-add-api.service';
import { MissingPerson } from './exportData';
@Component({
  selector: 'app-person-adding-form',
  templateUrl: './person-adding-form.component.html',
  styleUrls: ['./person-adding-form.component.css']
})
export class PersonAddingFormComponent implements OnInit {

  missingPerson: MissingPerson = new MissingPerson();
  constructor(private MPservice :PersonAddAPIService){}

  ngOnInit(): void {
    
  }

  submitForm(): void {
    // Log to see the form data before posting
    console.log(this.missingPerson);
    this.MPservice.postMissingPerson(this.missingPerson).subscribe(
      (response) => {
        console.log('Form submitted successfully', response);
      },
      (error) => {
        console.error('Error submitting form', error);
      }
    );

  }















 //  calculate age as per dob
  calculateAge() {
    if (this.missingPerson.date_of_birth) {
      const dobDate = new Date(this.missingPerson.date_of_birth);
      const today = new Date();
      if (dobDate > today) {
        this.missingPerson.age = null;
        alert('Date of birth cannot be in the future.');
        return;
      }

      const diff = today.getTime() - dobDate.getTime();
      this.missingPerson.age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)); // Convert ms to years
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
