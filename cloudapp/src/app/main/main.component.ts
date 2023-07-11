import { Component, ElementRef,ViewChild, OnInit, OnDestroy } from '@angular/core';
import {catchError, filter, finalize, tap} from "rxjs/operators";
import {
  CloudAppRestService, CloudAppEventsService, AlertService, Request, HttpMethod, RestErrorResponse,
} from '@exlibris/exl-cloudapp-angular-lib';
import { MatRadioChange } from '@angular/material/radio';
import { DigitizationService } from "../shared/digitization.service";
import {CloudAppOutgoingEvents} from "@exlibris/exl-cloudapp-angular-lib/lib/events/outgoing-events";
import {Result} from "../models/Result";
import {AlmaService} from "../shared/alma.service";
import {EMPTY, throwError} from "rxjs";


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
  itemFromApi: any;
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
            },
            error => this.alert.error('Failed to retrieve entity: ' + error.message)
        );
    this.checkStatusInDigitization(encodedBarcode);
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
    this.digitizationService.check(`&barcode=${barcode}&field[customer_id]=20&field[project_id]=37&field[job_id]=54&field[step_id]=69&field[title]=QUID:999999`)
        .pipe(
            tap( () =>this.loading = false),
            tap( data=> console.log(data)),
            tap(data => this.isBarcodeNew(data) ? this.readyForDigitizationDept=true : null),
            filter(data => !this.isBarcodeNew(data)),
            tap(data => this.isInFinishStep(data.step_title) ? this.returnFromDigitizationDept=true : this.barcodeAlreadyExists(barcode, data.step_title)),
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

  isInFinishStep(step_title) {
    // TODO add finish step to config
    let finish_step = 'KBH billedværk modtages (SAMLINGS-EJER)';
    console.log(step_title);
    return step_title === finish_step;
  }

  scanInItem(department:string, status:string, workOrderType:string) {
    let request: Request = {
      url: this.itemFromApi.link + "?op=scan&department="+department+"&status="+status+"&work_order_type="+workOrderType,
      method: HttpMethod.POST,
    };
    this.restService.call(request)
        .subscribe({
          next: result => {
            this.eventsService.refreshPage().subscribe(
                ()=>this.alert.success('Success!')
            );
          },
          error: (e: RestErrorResponse) => {
            this.alert.error('Failed to update data: ' + e.message);
            console.error(e);
          }
        });
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

  private barcodeAlreadyExists(barcode: string, step: string) {
      this.barcode.nativeElement.value='';
      this.alert.error(`Barcode ${barcode} already exists and is not in the finish step. 
                        Please contact digitization department.`);
  }

    private handleError(error: any) {
        console.log(error);
        this.alert.error('Error connecting to digitization system.')
        return EMPTY;
    }
}
