import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
})
export class CompareComponent implements OnInit {

  leftArray: number[] = [];
  rightArray: number[] = [];
  leftCode: string = '';
  rightCode: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['leftArray']) {
        this.leftArray = JSON.parse(params['leftArray']);
      }
      if (params['rightArray']) {
        this.rightArray = JSON.parse(params['rightArray']);
      }
      this.leftCode = params['leftCode'] || '';
      this.rightCode = params['rightCode'] || '';
    });
  }
}
