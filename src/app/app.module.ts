import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslatorComponent } from './components/translator/translator.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { SortingModule } from './components/sorting/sorting.module';
import { SideBarComponent } from './components/shared/side-bar/side-bar.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HistoryComponent } from './components/history/history.component';
import { LinearSearchComponent } from './components/searching/linear-search/linear-search.component';
import { ArrayVisualizerComponent } from './components/shared/array-visualizer/array-visualizer.component';
import { SharedModule } from './components/shared/shared.module';
import { SearchingModule } from './components/searching/searching.module';
import { LoaderInterceptor } from './interceptors/loader.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    TranslatorComponent,
    SideBarComponent,
    HistoryComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    SortingModule,
    SearchingModule,
    SharedModule,
    RouterModule,
    MatIconModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
