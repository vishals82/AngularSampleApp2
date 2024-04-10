import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { GridModule } from '@progress/kendo-angular-grid';
import { IconsModule } from "@progress/kendo-angular-icons";
import { AppComponent } from './app.component';

import { CategoryDetailComponent } from './category-details.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    GridModule,
    IconsModule
  ],
  declarations: [
    AppComponent,
    CategoryDetailComponent
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
