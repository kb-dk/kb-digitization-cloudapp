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
import {DigitizationService} from "./shared/digitization.service";
import { SendMaterialComponent } from './send-material/send-material.component';
import { ReceiveMaterialComponent } from './receive-material/receive-material.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ConfigComponent,
    SendMaterialComponent,
    ReceiveMaterialComponent
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
  ],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'standard'}},
      DigitizationService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
