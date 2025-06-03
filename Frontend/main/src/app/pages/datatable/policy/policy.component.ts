import { Component, OnInit, signal } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TodoService } from 'src/app/services/apps/todo/todo.service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PrivacyrouteService } from '../privacypolicy/privacyroute.service';

@Component({
  selector: 'app-policy',
  imports: [
    MaterialModule,
    CommonModule,
    TablerIconsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.scss'
})
export class PolicyComponent implements OnInit {
  sidePanelOpened = signal<boolean>(true);
  selectedCategory = signal<string>('Privacy Policy'); // Default to Privacy Policy
  public showSidebar = signal<boolean>(false);
  inputFg: UntypedFormGroup;
  
  searchText = signal<string | null>(null);
  editSave = signal<string>('Edit');

  totalTodos = signal<number>(0);
  totalCompleted = signal<number>(0);
  totalIncomplete = signal<number>(0);
  constructor(
    public fb: UntypedFormBuilder,
    public snackBar: MatSnackBar,
    public todoService: TodoService,
    private dialog: MatDialog,
    private previousRouteService: PrivacyrouteService,
  ) {

  }

  isOver(): boolean {
    return window.matchMedia(`(max-width: 960px)`).matches;
  }

  mobileSidebar(): void {
    this.showSidebar.set(!this.showSidebar);
  }

  ngOnInit(): void {
    this.inputFg = this.fb.group({
      mess: [],
    });
    const allTodos = this.todoService.getTodos();
    this.totalTodos.set(allTodos.length);
    this.totalCompleted.set(
      allTodos.filter((todo) => todo.completionStatus).length
    );
    this.totalIncomplete.set(
      allTodos.filter((todo) => !todo.completionStatus).length
    );
  }

  selectionlblClick(val: string): void {
    this.selectedCategory.set(val);

    // Filter todos based on the selected category
    const filteredTodos = this.todoService.getTodos().filter((todo) => {
      if (val === 'all') return true;
      if (val === 'Terms of Use') return todo.completionStatus;
      if (val === 'Legal Disclaimer') return !todo.completionStatus;
      if (val === 'Jurisdiction') return !todo.completionStatus;
      return true;
    });

  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

   goBack() {
    this.previousRouteService.goBack('/');
  }


}
