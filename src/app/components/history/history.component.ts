import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  snippets = [
    {
      title: 'Binary Search',
      date: '2025-11-08',
      lang: 'PY',
      code: `
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
`
    },
    {
      title: 'Quick Sort',
      date: '2025-11-06',
      lang: 'C++',
      code: `
void quickSort(vector<int>& arr, int left, int right) {
    if (left >= right) return;
    int pivot = arr[right];
    int i = left;
    for (int j = left; j < right; j++) {
        if (arr[j] < pivot) swap(arr[i++], arr[j]);
    }
    swap(arr[i], arr[right]);
    quickSort(arr, left, i - 1);
    quickSort(arr, i + 1, right);
}
`
    },
    {
      title: 'Bubble Sort',
      date: '2025-11-03',
      lang: 'JS',
      code: `
for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }
  }
}
`
    }
  ];

  constructor() {}

  ngOnInit(): void {}

}
