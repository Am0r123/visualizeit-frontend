import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  isCollapsed = false;
  showSortingDropdown = false;
  showSearchingDropdown = false;
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.showSortingDropdown = false;
      this.showSearchingDropdown = false;
    }
  }

  toggleSortingMenu(event: MouseEvent) {
    event.stopPropagation();
    if (!this.isCollapsed) {
      this.showSortingDropdown = !this.showSortingDropdown;
    }
  }

  toggleSearchingMenu(event: MouseEvent) {
    event.stopPropagation();
    if (!this.isCollapsed) {
      this.showSearchingDropdown = !this.showSearchingDropdown;
    }
  }

  handleAuthAction() {
    if (this.isLoggedIn) {
      this.authService.logout(); 
      this.isLoggedIn = false;
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.showSortingDropdown) this.showSortingDropdown = false;
  }
}