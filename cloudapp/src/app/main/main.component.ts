import { Component, ElementRef,ViewChild, OnInit } from '@angular/core';
import {filter, tap, catchError} from "rxjs/operators";
import {
    CloudAppRestService,
    CloudAppEventsService,
    AlertService,
    CloudAppConfigService,
} from '@exlibris/exl-cloudapp-angular-lib';
import { DigitizationService } from "../shared/digitization.service";
import {Result} from "../models/Result";
import {AlmaService} from "../shared/alma.service";
import {EMPTY} from "rxjs";


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  private currentlyAtLibCode: string;
  private currentlyAtDeptCode: string;
  private deskConfig;
  loading = false;
  @ViewChild('barcode', {static: false}) barcode: ElementRef;
  readyForDigitizationDept: boolean = false;
  returnFromDigitizationDept: boolean = false;

  /* TODO delete */
  itemFromApi: any = null;
  barcodeForMaestro: string = null;

  constructor(
      private configService: CloudAppConfigService,
      private restService: CloudAppRestService,
      private eventsService: CloudAppEventsService,
      private alert: AlertService,
      private almaService: AlmaService,
      private digitizationService: DigitizationService
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

  private tryParseJson(value: any) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }

  async scanBarcode() {
    this.loading=true;
    this.alert.clear();
    const barcode = this.barcode.nativeElement.value;
    const encodedBarcode = encodeURIComponent(barcode).trim();
    this.almaService.getItemsFromBarcode(encodedBarcode)
        .subscribe(
            result => {
              this.itemFromApi = result;
              this.getBarcodeOrField583x().then(r => {
                  this.checkStatusInDigitization(this.barcodeForMaestro);
                  this.loading = false;
              });
            },
            error => {
              this.alert.error(error.message);
              this.loading = false;
            }
        );
  }

  private resetMain() {
    this.loading = false;
    this.barcode.nativeElement.value = "";
  }

  private checkStatusInDigitization(barcode: string) {
    return this.digitizationService.check(barcode,this.deskConfig)
        .pipe(
            tap( () =>this.loading = false),
            tap(data => this.isBarcodeNew(data) ? this.readyForDigitizationDept=true : null),
            filter(data => !this.isBarcodeNew(data)),
            tap(data => this.isInFinishStep(data) ? this.returnFromDigitizationDept=true : this.handleOtherMaestroResponses(barcode, data)),
            catchError(error => {
                this.resetMain();
                this.handleError(error);
                return EMPTY;
            })
        ).subscribe();

  }

  private isBarcodeNew(data) {
    return data.hasOwnProperty('error') && data.error === 'No book found with the barcode';
  }

  isInFinishStep(data) {
      let finish_step = this.deskConfig.maestroFinishStep.trim();
      console.log(data.step_title , finish_step, data.step_title === finish_step);
      if (data.hasOwnProperty('step_title')) {
        return data.step_title === finish_step;
      }
  }

  handleBackToMain(event: Result) {
      if (event.ok) {
        this.alert.success(this.getMessage(event.message));
      } else {
        this.alert.error(this.getMessage(event.message));
      }
      this.readyForDigitizationDept=false;
      this.returnFromDigitizationDept=false;
      this.barcode.nativeElement.value='';
  }

  getMessage(message:any) {
      if (typeof message === 'string') {
          return message;
      }
      if (message.hasOwnProperty('message')) {
          return message.message;
      }
      return 'Cannot find the message.';
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
        this.alert.warn(`Barcode ${barcode} has the status ${data.step_title}`);
      }
    } else {
      this.alert.error(`Maestro error ${data.error}`);
    }
  }


  private handleError(error: any) {
    this.alert.error(error);
    return EMPTY;
  }

  private async getBarcodeOrField583x() {
      this.barcodeForMaestro = this.itemFromApi.item_data.barcode;
      if (this.deskConfig.useMarcField) {
          await this.almaService.getField583x(this.itemFromApi.holding_data.link)
              .then(field583x => {
                  if (field583x) {
                      this.barcodeForMaestro = field583x;
                  } else {
                      console.log("field583x has no value");
                  }
              })
      }
      return Promise.resolve();
  }
}
