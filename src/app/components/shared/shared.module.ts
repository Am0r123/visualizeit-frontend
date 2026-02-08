// src/app/components/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayVisualizerComponent } from './array-visualizer/array-visualizer.component';
import { FormsModule } from '@angular/forms';
import { CompareComponent } from './compare/compare.component';
import { LoaderComponent } from './loader/loader.component';
import { TreeVisualizerComponent } from './tree-visualizer/tree-visualizer.component';
import { MainVisualizerComponent } from './main-visualizer/main-visualizer.component';
import { LinkedListVisualizerComponent } from './linked-list-visualizer/linked-list-visualizer.component';

@NgModule({
  declarations: [
    ArrayVisualizerComponent,
    CompareComponent,
    LoaderComponent,
    TreeVisualizerComponent,
    MainVisualizerComponent,
    LinkedListVisualizerComponent
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
