// sorting.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SortingRoutingModule } from './sorting-routing.module';
import { BubbleSortComponent } from './bubble-sort/bubble-sort.component';
import { SharedModule } from '../shared/shared.module'; // import SharedModule

@NgModule({
  declarations: [
    BubbleSortComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SortingRoutingModule
  ]
})
export class SortingModule { }
