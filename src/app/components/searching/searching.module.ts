// searching.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchingRoutingModule } from './searching-routing.module';
import { LinearSearchComponent } from './linear-search/linear-search.component';
import { SharedModule } from '../shared/shared.module';
import { CodeCheckerComponent } from './code-checker/code-checker.component';

@NgModule({
  declarations: [
    LinearSearchComponent,
    CodeCheckerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SearchingRoutingModule
  ]
})
export class SearchingModule { }
