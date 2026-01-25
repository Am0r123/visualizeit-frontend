import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-linear-search',
  templateUrl: './linear-search.component.html',
  styleUrls: ['./linear-search.component.scss']
})
export class LinearSearchComponent implements OnInit {
  linearSearchCode = 
  `def linear_search(arr, target):
    for i in range(len(arr)):
      if arr[i] == target:
        return i
    return -1
  `;

  array = [5, 2, 8, 1]; // array to search
  target: number | null = null; // target input
  searchResult: number | null = null; // stores found index

  constructor() { }

  ngOnInit(): void { }

  onSearchComplete(foundIndex: number | null) {
    this.searchResult = foundIndex;
  }
}
