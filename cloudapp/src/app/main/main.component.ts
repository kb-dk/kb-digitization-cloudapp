import { Component, ElementRef,ViewChild, OnInit, OnDestroy } from '@angular/core';
import {filter, finalize, tap, catchError} from "rxjs/operators";
import {
  CloudAppRestService, CloudAppEventsService, AlertService, Request, HttpMethod, RestErrorResponse,
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
  loading = false;
  @ViewChild('barcode', {static: false}) barcode: ElementRef;
  readyForDigitizationDept: boolean = false;
  returnFromDigitizationDept: boolean = false;

  /* TODO delete */
  itemLoaded: boolean = false;
  itemFromApi: any = null;
  requests: any;

  constructor(
      private restService: CloudAppRestService,
      private eventsService: CloudAppEventsService,
      private alert: AlertService,
      private almaService: AlmaService,
      private digitizationService: DigitizationService
  ) { }



  ngOnInit() {
    let pageMetadata = this.eventsService.getPageMetadata();
    console.log('JJ: ' + JSON.stringify(pageMetadata));

    this.eventsService.getInitData().subscribe(data=>{
      this.currentlyAtLibCode = data.user.currentlyAtLibCode;
      this.currentlyAtDept = data.user['currentlyAtDept'];
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

  scanBarcode() {
    //console.log("barcode scanned "+this.barcode.nativeElement.value)
    this.loading=true;
    const barcode = this.barcode.nativeElement.value;
    const encodedBarcode = encodeURIComponent(barcode).trim();
    this.restService.call(`/items?item_barcode=${encodedBarcode}`)
        .subscribe(
            result => {
              this.itemFromApi = result;
              this.checkStatusInDigitization(encodedBarcode);
              this.loading = false;
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
    return this.digitizationService.check(`&barcode=${barcode}&field[customer_id]=20&field[project_id]=37&field[job_id]=54&field[step_id]=69&field[title]=QUID:999999`)
        .pipe(
            tap( () =>this.loading = false),
            tap( data=> console.log(data)),
            tap(data => this.isBarcodeNew(data) ? this.readyForDigitizationDept=true : null),
            filter(data => !this.isBarcodeNew(data)),
            tap(data => this.isInFinishStep(data) ? this.returnFromDigitizationDept=true : this.handleOtherMaestroResponses(barcode, data)),
            catchError(error => {
                this.resetMain();
                this.handleError(error);
                return EMPTY;
            })
        )
        .subscribe();
  }

  private isBarcodeNew(data) {
    return data.hasOwnProperty('error') && data.error === 'No book found with the barcode';
  }

  isInFinishStep(data) {
      // TODO add finish step to config
      let finish_step = 'KBH billedværk modtages (SAMLINGS-EJER)';
      if (data.hasOwnProperty('step_title')) {
        return data.step_title === finish_step;
      }
  }

  handleBackToMain(event: Result) {
      if (event.ok) {
        this.alert.success(event.message)
      } else {
        this.alert.error(event.message)
      }
      this.readyForDigitizationDept=false;
      this.returnFromDigitizationDept=false;
      this.barcode.nativeElement.value='';
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
    console.log(error);
    this.alert.error('Error connecting to digitization system.')
    return EMPTY;
  }

  private getParams(action: string) {
    if (action === 'send'){
      return '&field[customer_id]=20&field[project_id]=37&field[job_id]=54&field[step_id]=69&field[title]=QUID:999999';
    }
  }

}
