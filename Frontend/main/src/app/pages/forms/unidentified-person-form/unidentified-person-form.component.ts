import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-unidentified-person-form',
  imports: [MatIcon],
  templateUrl: './unidentified-person-form.component.html',
  styleUrl: './unidentified-person-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnidentifiedPersonFormComponent { }
