import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatChipsModule } from '@angular/material/chips';
import { environment } from 'src/envirnment/envirnment';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VolunteerServiceService } from './volunteer-service.service';
@Component({
  selector: 'app-volunteers',
  imports: [MatCardModule, MatChipsModule, TablerIconsModule, MatButtonModule,CommonModule],
  templateUrl: './volunteers.component.html',
  styleUrl: './volunteers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolunteersComponent implements OnInit {
  environment=environment
  socialcards: any[] = [];
  volunteer: any;
  selectedVolunteer: any = null; 
  showProfile: boolean = false;
  volunteerId: string = '';
  volunteerData: any = null;

  constructor(private volunteerService: VolunteerServiceService, private router: Router,private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadVolunteerProfile(id);
      } else {
        this.loadAllVolunteers();
      }
    });
  }

  private loadAllVolunteers(): void {
    this.volunteerService.getVolunteers().subscribe({
      next: data => {
        console.log('🎉 All Volunteers fetched:', data);
        this.socialcards = Array.isArray(data) ? data : data.data || [];
        console.log('→ Assigned to this.socialcards:', this.socialcards);
      },
      error: err => {
        console.error('❌ Error loading all volunteers:', err);
        this.socialcards = [];
      }
    });
  }
  

  trackByUsername(index: number, socialcard: any): string {
    return socialcard.id;  
  }
  goToProfile(volunteer: any) {
    if (!volunteer || !volunteer.id || typeof volunteer.id !== 'string' || volunteer.id.trim() === '') {
      console.error('No valid volunteer ID found:', volunteer);
      return;
    }
    console.log(volunteer)

    this.router.navigate(['widgets/volunteersdata/', volunteer.id]); 
  }

  

  

  private loadVolunteerProfile(id: string): void {
    this.volunteerService.getVolunteerById(id).subscribe({
      next: volunteer => {
        console.log('🎉 Volunteer profile fetched:', volunteer);
        this.socialcards = volunteer ? [volunteer] : [];
        console.log('→ Assigned single profile to this.socialcards:', this.socialcards);
      },
      error: err => {
        console.error(`❌ Error loading volunteer #${id}:`, err);
        this.socialcards = [];
      }
    });
  }
  

  backToList() {
    this.selectedVolunteer = null;
    this.showProfile = false;
  }

}