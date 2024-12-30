import { Component } from '@angular/core';
declare var bootstrap: any;


import { Tab } from 'bootstrap';
@Component({
  selector: 'app-person-adding-form',
  templateUrl: './person-adding-form.component.html',
  styleUrls: ['./person-adding-form.component.css']
})
export class PersonAddingFormComponent {

  goToNextTab(tabId: string): void {
    const nextTab = document.getElementById(tabId + '-tab');
    if (nextTab) {
      new bootstrap.Tab(nextTab).show();
    }
  }

  goToPreviousTab(tabId: string): void {
    const prevTab = document.getElementById(tabId + '-tab');
    if (prevTab) {
      new Tab(prevTab).show();
    }
  }

}
