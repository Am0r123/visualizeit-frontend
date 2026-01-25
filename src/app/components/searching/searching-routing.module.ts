import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LinearSearchComponent } from './linear-search/linear-search.component';
import { ArrayVisualizerComponent } from '../shared/array-visualizer/array-visualizer.component';
import { CompareComponent } from '../shared/compare/compare.component';

const routes: Routes = [
  { path: '', component: ArrayVisualizerComponent },
  { path: 'custom', component: ArrayVisualizerComponent },
  { path: 'compare', component: CompareComponent },
  { path: 'linear-search', component: LinearSearchComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchingRoutingModule { }
