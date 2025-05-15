import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangelogService } from './changelog.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-changelogs',
  imports: [MatFormFieldModule,ReactiveFormsModule,MatInputModule,MatCardModule],
  templateUrl: './changelogs.component.html',
  styleUrl: './changelogs.component.scss'
})
export class ChangelogsComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private logService: ChangelogService,
    private router: Router
  ) {
    this.form = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      version: ['', Validators.required],
      added: [''],
      modified: [''],
      tested: ['']
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
  
    const value = this.form.value;
    const log = {
      date: value.date,
      version: value.version,
      added: this.splitLines(value.added),
      modified: this.splitLines(value.modified),
      tested: this.splitLines(value.tested),
    };
  
    // You can now submit the log without the `id`
    this.logService.addLog(log).subscribe({
      next: () => {
        this.form.reset({ date: new Date().toISOString().substring(0, 10) });
        this.router.navigate(['datatable/change-log']);
      },
      error: (error) => {
        console.error('Error saving log:', error);
      }
    });
  }
  
  
  
  

  private splitLines(text: string): string[] {
    return text ? text.split('\n').map(line => line.trim()).filter(Boolean) : [];
  }

}
