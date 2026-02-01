import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  isCollapsed = false;
  showSortingDropdown = false;
  showSearchingDropdown = false;

  constructor() {}

  ngOnInit(): void {}

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

  @HostListener('document:click')
  onDocumentClick() {
    if (this.showSortingDropdown) this.showSortingDropdown = false;
  }
}
