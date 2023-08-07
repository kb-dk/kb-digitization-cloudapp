import { Component, ElementRef,ViewChild, OnInit, OnDestroy } from '@angular/core';
import {filter, finalize, tap, catchError} from "rxjs/operators";
import {
    CloudAppRestService,
    CloudAppEventsService,
    AlertService,
    Request,
    HttpMethod,
    RestErrorResponse,
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
export class MainComponent implements OnInit, OnDestroy {

  private currentlyAtLibCode: string;
  private currentlyAtDept: string;
  private deskConfig;
  loading = false;
  @ViewChild('barcode', {static: false}) barcode: ElementRef;
  readyForDigitizationDept: boolean = false;
  returnFromDigitizationDept: boolean = false;

  /* TODO delete */
  itemLoaded: boolean = false;
  itemFromApi: any = null;
  barcodeForMaestro: string = null;
  requests: any;

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
      this.currentlyAtDept = data.user['currentlyAtDept'];
    });
      this.configService.get().subscribe(config => {
          if (config.desks && this.currentlyAtDept) {
              this.deskConfig = config.desks.find(desk => desk.deskCode.trim() == this.currentlyAtDept.trim());
          }

          if (this.currentlyAtDept == undefined) {
              this.alert.error(`Please first select a Desk in Alma and then open the app.`);
          } else if (this.deskConfig == undefined) {
              this.alert.error(`Desk ${this.currentlyAtDept} not defined in app`);
          }
          this.loading = false;
      })

  }

  ngOnDestroy(): void {
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

  isDOD(): boolean {
    return this.itemFromApi != null;
  }

  hasRequests(): boolean {
    return this.requests != null && this.requests.total_record_count>0;
  }

  getItemRequests(itemLink:string) {

    this.restService.call<any>(itemLink+"/requests")
        .pipe(finalize(()=> {
          this.itemLoaded = true;
            this.resetMain();
        }))
        .subscribe(
            result => this.requests=result,
            error => this.requests=error
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
      // TODO add finish step to config
      let finish_step = this.deskConfig.maestroFinishStep.trim();
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
      return 'Kan ikke finde message';
  }

  updateLoading(event: boolean) {
    this.loading=event
  }

  private handleOtherMaestroResponses(barcode:string, data: any) {
    let done_step = 'KBH Cum Færdigregistreret';
    if (data.hasOwnProperty('step_title')) {
      if (data.step_title === done_step) {
        this.alert.warn(`Stregkode ${barcode} er allerede færdigregistreret`);
      } else {
        this.alert.warn(`Stregkode ${barcode} har status ${data.step_title}`);
      }
    } else {
      this.alert.error(`Maestro fejl ${data.error}`);
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
