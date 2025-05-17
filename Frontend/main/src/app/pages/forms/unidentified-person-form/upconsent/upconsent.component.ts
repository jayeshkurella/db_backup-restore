import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-upconsent',
  imports: [MatDialogContent,MatDialogActions,FormsModule,CommonModule,MatCheckbox,
        MatIcon,MatExpansionModule,MatChipsModule ,MatButtonModule,MatListModule
      ],
  templateUrl: './upconsent.component.html',
  styleUrl: './upconsent.component.scss'
})
export class UpconsentComponent {
   checked = false;
  
    constructor(
      private dialogRef: MatDialogRef<UpconsentComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {}
  
    closeDialog() {
      this.dialogRef.close(this.checked);
    }

}
