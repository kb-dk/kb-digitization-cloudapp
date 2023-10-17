import { Component, ElementRef,ViewChild, OnInit } from '@angular/core';
import {
    CloudAppRestService,
    CloudAppEventsService,
    AlertService,
    CloudAppConfigService,
} from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  currentlyAtLibCode: string;
  currentlyAtDeptCode: string;
  institution: string;
  almaUrl: string = '';
  deskConfig;
  loading = false;
  inputLabel:string = '';
  @ViewChild('barcode', {static: false}) barcode: ElementRef;

  constructor(
      private configService: CloudAppConfigService,
      private restService: CloudAppRestService,
      private eventsService: CloudAppEventsService,
      private alert: AlertService,
  ) { }

  ngOnInit() {
      this.loading = true;
      this.eventsService.getInitData().subscribe(data => {
          this.currentlyAtLibCode = data.user.currentlyAtLibCode;
          this.currentlyAtDeptCode = data.user['currentlyAtDept'];
          this.institution = data.instCode;
          this.almaUrl = data.urls.alma;
      });
      this.configService.get().subscribe(config => {
          if (config.desks && this.currentlyAtDeptCode) {
              this.deskConfig = config.desks.find(desk => desk.deskCode.trim() == this.currentlyAtDeptCode.trim());
          }
          if (this.currentlyAtDeptCode == undefined) {
              this.alert.error(`Please select a Desk in Alma first.`);
          } else if (this.deskConfig == undefined) {
              this.alert.error(`The desk you are at ( with desk code: "${this.currentlyAtDeptCode}" ), is not defined in the app.`);
          }
          this.inputLabel = this.deskConfig.useMarcField ? 'Barcode or field583x or MMSID' : 'Barcode';
          this.loading = false;
      })
  }

  updateLoading(event: boolean) {
    this.loading=event
  }
}
