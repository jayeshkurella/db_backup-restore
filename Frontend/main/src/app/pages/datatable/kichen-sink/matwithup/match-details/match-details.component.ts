import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule, MatButton } from '@angular/material/button';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSpinner } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeTitlecasePipe } from 'src/app/components/dashboard1/revenue-updates/person-details/safe-titlecase.pipe';
import { environment } from 'src/envirnment/envirnment';

@Component({
  selector: 'app-match-details',
  imports: [MatDialogModule ,MatButtonModule ,CommonModule,MatIcon,MatCard,MatButton,SafeTitlecasePipe,MatCardTitle],
  templateUrl: './match-details.component.html',
  styleUrl: './match-details.component.scss'
})
export class MatchDetailsComponent {

  environment =environment
  person :any

  constructor(private route: ActivatedRoute,private router :Router) { }

  ngOnInit(): void {
    this.person = history.state.person;
    console.log('Person data:', this.person);
  }



  goBack() {
  this.router.navigate(['/search/match-up-result']); 
  }
}
