import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApproveServiceService } from './approve-service.service';

@Component({
  selector: 'app-user-access-component',
  templateUrl: './user-access-component.component.html',
  styleUrls: ['./user-access-component.component.css']
})
export class UserAccessComponentComponent implements OnInit {
  userType: string | null = null;
  pendingUsers: any[] = [];
  filteredUsers: any[] = [];
  adminToken: string | null = '';
  searchQuery: string = ''; // For search input

  constructor(private router: Router, private http: HttpClient, private userService: ApproveServiceService) {}

  ngOnInit(): void {
    this.userType = localStorage.getItem('user_type');
    this.adminToken = localStorage.getItem('authToken');
    this.fetchPendingUsers();

    if (this.userType !== 'admin') {
      alert('Access Denied: You do not have permission to view this page.');
    }
  }

  fetchPendingUsers(): void {
    this.userService.getPendingUsers().subscribe(
      (response: any) => {
        this.pendingUsers = response;
        this.filteredUsers = response;
      },
      (error) => {
        console.error('Error fetching pending users:', error);
      }
    );
  }

  searchUsers(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.pendingUsers.filter(user =>
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.email_id.toLowerCase().includes(query) ||
      user.phone_no.includes(query)
    );
  }

  approveUser(userId: string): void {
    this.updateUserStatus(userId, 'approve');
  }

  rejectUser(userId: string): void {
    this.updateUserStatus(userId, 'reject');
  }

  deactivateUser(userId: string): void {
    this.updateUserStatus(userId, 'deactivate');
  }

  updateUserStatus(userId: string, action: string): void {
    this.userService.updateUserStatus(userId, action).subscribe(
      () => {
        console.log(`User ${action}d successfully`);
        this.pendingUsers = this.pendingUsers.filter(user => user.id !== userId); 
        this.filteredUsers = this.filteredUsers.filter(user => user.id !== userId);
      },
      (error) => {
        console.error(`Error ${action}ing user:`, error);
      }
    );
  }
}
