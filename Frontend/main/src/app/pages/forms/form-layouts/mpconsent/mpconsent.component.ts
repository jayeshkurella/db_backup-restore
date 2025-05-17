import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatChip, MatChipListbox, MatChipsModule } from '@angular/material/chips';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
@Component({
  selector: 'app-mpconsent',
  imports: [MatDialogContent,MatDialogActions,FormsModule,CommonModule,MatCheckbox,
    MatIcon,MatExpansionModule,MatChipsModule ,MatButtonModule,MatListModule
  ],
  templateUrl: './mpconsent.component.html',
  styleUrl: './mpconsent.component.scss'
})
export class MpconsentComponent {
   checked = false;

  constructor(
    private dialogRef: MatDialogRef<MpconsentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeDialog() {
    this.dialogRef.close(this.checked);
  }

}
