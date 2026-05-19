import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-watch-window',
  templateUrl: './watch-window.component.html',
  styleUrls: ['./watch-window.component.scss']
})
export class WatchWindowComponent {
  
  // ADD THIS LINE: It creates the variable and tells Angular to expect data from the parent component
  @Input() currentVariables: any = null; 

  constructor() {}
}