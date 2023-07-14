import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import {ErrorComponent} from "./static/error.component";
import {ConfigComponent, ConfigurationGuard} from "./config/config.component";

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'config', component: ConfigComponent},
  { path: 'config', component: ConfigComponent, canActivate: [ConfigurationGuard] },
  { path: 'error', component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
