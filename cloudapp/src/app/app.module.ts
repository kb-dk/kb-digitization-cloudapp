import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule, CloudAppTranslateModule, AlertModule } from '@exlibris/exl-cloudapp-angular-lib';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import {ConfigComponent} from "./config/config.component";
import {ToastrModule} from "ngx-toastr";


export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: 'toast-top-right',
  });
}

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ConfigComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AlertModule,
    FormsModule,
    ReactiveFormsModule,     
    CloudAppTranslateModule.forRoot(),
    getToastrModule(),
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
