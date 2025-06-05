import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { environment } from 'src/envirnment/envirnment';
@Component({
  selector: 'app-dialog-model-view',
  imports: [MatDialogModule ,MatButtonModule ,CommonModule],
  templateUrl: './dialog-model-view.component.html',
  styleUrl: './dialog-model-view.component.scss'
})
export class DialogModelViewComponent {
  environment = environment
  constructor(@Inject(MAT_DIALOG_DATA) public person: any,
  private dialogRef: MatDialogRef<DialogModelViewComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

  getImageUrl(imagePath: string): string {
    const fullPath = imagePath ? `${environment.ImgUrlss}${imagePath}` : 'assets/old/images/Chhaya.png';
    return fullPath;
  }
  

}
