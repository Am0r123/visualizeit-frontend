import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TranslatorComponent } from './components/translator/translator.component';
import { HistoryComponent } from './components/history/history.component';

const routes: Routes = [
  { path: 'translator', component: TranslatorComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'sorting', loadChildren: () => import('./components/sorting/sorting.module').then(m => m.SortingModule) },
  { path: 'searching', loadChildren: () => import('./components/searching/searching.module').then(m => m.SearchingModule) },
  { path: '', redirectTo: '/translator', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
