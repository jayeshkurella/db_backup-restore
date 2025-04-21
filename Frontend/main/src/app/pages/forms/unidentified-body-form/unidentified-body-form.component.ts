import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-unidentified-body-form',
  imports: [MatIcon],
  templateUrl: './unidentified-body-form.component.html',
  styleUrl: './unidentified-body-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnidentifiedBodyFormComponent { }
