import { Component ,OnInit} from '@angular/core';
import { DailyChangeLog } from '../changelogs/changelog.model';
import { ChangelogService } from '../changelogs/changelog.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-changelogview',
  imports: [CommonModule,ReactiveFormsModule,MatCard,MatCardHeader,MatCardContent,MatCardTitle,MatIcon],
  templateUrl: './changelogview.component.html',
  styleUrl: './changelogview.component.scss'
})
export class ChangelogviewComponent implements OnInit {
  logs: DailyChangeLog[] = [];

  constructor(private logService: ChangelogService,private router: Router,) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.logService.getLogs().subscribe(logs => {
      this.logs = logs;
    });  }
  goToAddLog() {
    this.router.navigate(['datatable/add-changelog']);
  }

  deleteLog(logId: number): void {
    if (confirm('Are you sure you want to delete this log?')) {
      this.logService.deleteLog(logId).subscribe(
        (response) => {
          this.logs = this.logs.filter((log) => log.id !== logId);
          console.log('Log deleted successfully:', response);
        },
        (error) => {
          console.error('Error deleting log:', error);
        }
      );
    }
  }
  

}
