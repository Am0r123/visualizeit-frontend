// src/app/components/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayVisualizerComponent } from './array-visualizer/array-visualizer.component';
import { FormsModule } from '@angular/forms';
import { CompareComponent } from './compare/compare.component';
import { LoaderComponent } from './loader/loader.component';

@NgModule({
  declarations: [
    ArrayVisualizerComponent,
    CompareComponent,
    LoaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ArrayVisualizerComponent,
    LoaderComponent
  ]
})
export class SharedModule { }
