import { Component, ElementRef,ViewChild, OnInit } from '@angular/core';
import {
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
          if (Object.keys(config).length) {
              if (config.desks && this.currentlyAtDeptCode) {
                  this.deskConfig = config.desks.find(desk => desk.deskCode.trim() == this.currentlyAtDeptCode.trim());
              }
              if (this.currentlyAtDeptCode === undefined) {
                  this.alert.error(`Please select a Desk in Alma first.`);
              } else if (this.deskConfig === undefined) {
                  this.alert.error(`The desk you are at ( with desk code: "${this.currentlyAtDeptCode}" ), is not defined in the app.`);
              }
              this.inputLabel = this.deskConfig?.useMarcField ? 'Barcode, MMSID or field583x' : 'Barcode or MMSID';
          } else {
              this.alert.error(`Please ask an Admin to configure this App.`);
          }
          this.loading = false;
      })
  }

  updateLoading(event: boolean) {
    this.loading=event
  }
}
