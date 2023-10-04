import { Component, ElementRef,ViewChild, OnInit } from '@angular/core';
import {
    CloudAppRestService,
    CloudAppEventsService,
    AlertService,
    CloudAppConfigService,
} from '@exlibris/exl-cloudapp-angular-lib';
import {EMPTY} from "rxjs";


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  currentlyAtLibCode: string;
  currentlyAtDeptCode: string;
  deskConfig;
  loading = false;
  @ViewChild('barcode', {static: false}) barcode: ElementRef;

  constructor(
      private configService: CloudAppConfigService,
      private restService: CloudAppRestService,
      private eventsService: CloudAppEventsService,
      private alert: AlertService,
  ) { }

  ngOnInit() {
      this.loading = true;
      this.eventsService.getInitData().subscribe(data=>{
      this.currentlyAtLibCode = data.user.currentlyAtLibCode;
      this.currentlyAtDeptCode = data.user['currentlyAtDept'];
      });
      this.configService.get().subscribe(config => {
          if (config.desks && this.currentlyAtDeptCode) {
              this.deskConfig = config.desks.find(desk => desk.deskCode.trim() == this.currentlyAtDeptCode.trim());
          }
          if (this.currentlyAtDeptCode == undefined) {
              this.alert.error(`Please select a Desk in Alma first.`);
          } else if (this.deskConfig == undefined) {
              this.alert.error(`The desk you are in, is not defined in the app.`);
          }
          this.loading = false;
      })
  }

  updateLoading(event: boolean) {
    this.loading=event
  }

  private handleOtherMaestroResponses(barcode:string, data: any) {
    let done_step = 'KBH Cum Færdigregistreret';
    if (data.hasOwnProperty('step_title')) {
      if (data.step_title === done_step) {
        this.alert.warn(`Barcode ${barcode} is already registered in the digitisation system.`);
      } else {
        this.alert.warn(`Barcode "${barcode}" has the status "${data.step_title}"`);
      }
    } else {
      this.alert.error(`Maestro error ${data.error}`);
    }
  }


  private handleError(error: any) {
    this.alert.error(error);
    return EMPTY;
  }
}
